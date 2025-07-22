import subprocess
import os
import threading
import time
from datetime import datetime
from django.conf import settings
from .log_parser import parse_ascii_log
from capture.models import ZeekLog, CaptureSession
import signal

class ZeekController:
    def __init__(self, session_id=None):
        self.session_id = session_id
        self.zeek_process = None
        self.capture_active = False
        self.zeek_thread = None
        self.monitor_thread = None
        
        # Récupération des params de Zeek
        self.zeek_path = getattr(settings, 'ZEEK_PATH', '/usr/local/zeek/bin/zeek')
        self.base_log_dir = getattr(settings, 'ZEEK_LOG_DIR', os.path.join(settings.BASE_DIR, 'zeek_logs'))
        
    #Fonction pour le démarrage de la capture
    def start_capture(self, interface, capture_filter=None):
        if self.capture_active:
            return False
            
        #Creation du répertoire des logs
        log_dir = os.path.join(self.base_log_dir, datetime.now().strftime("%Y%m%d_%H%M%S"))
        os.makedirs(log_dir, exist_ok=True)
        
        self.capture_active = True
        
        #Commande de capture par zeek
        cmd = [
            self.zeek_path,
            "-i", interface,
            "-C",  # Ne pas vérifier les checksums
            "-e", f'redef LogAscii::use_json = T;',
            "-e", f'redef LogAscii::json_timestamps = JSON::TS_ISO8601;',
            "-e", f'redef Log::default_scope_sep = "_";',
            "/usr/local/zeek/share/zeek/site/local.zeek"
        ]
        
        if capture_filter:
            cmd.extend(["-f", capture_filter])
            
        #Lancement de zeek dans un thread séparé
        self.zeek_thread = threading.Thread(
            target=self._run_zeek,
            args=(cmd, log_dir),
            daemon=True
        )
        self.zeek_thread.start()
        
        #Démarrage du thread de surveillance des logs
        self.monitor_thread = threading.Thread(
            target=self._monitor_logs,
            args=(log_dir,),
            daemon=True
        )
        self.monitor_thread.start()
        
        return True
    
    #Fonctoin d'execution de la commande de zeek    
    def _run_zeek(self, cmd, log_dir):

        try:
            self.zeek_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=log_dir,
            preexec_fn=os.setsid
            )
            try:
                session = CaptureSession.objects.get(id=self.session_id)
                session.pid = self.zeek_process.pid
                session.save()
                print(f"PID Zeek enregistré: {session.pid}")
            except Exception as e:
                print(f"Erreur lors de l'enregistrement du PID: {e}")
 
            while self.capture_active:
                output = self.zeek_process.stdout.readline()
                if output:
                    print(f"Zeek: {output.strip()}")
                
                if self.zeek_process.poll() is not None:
                    break
                
                time.sleep(0.1)
            
            stdout, stderr = self.zeek_process.communicate()
            if stdout:
                print(f"Zeek: {stdout.strip()}")
            if stderr:
                print(f"Zeek (erreur): {stderr.strip()}")
                
            return_code = self.zeek_process.returncode
            print(f"Capture Zeek terminée avec le code {return_code}")
            
        except Exception as e:
            print(f"Erreur lors de l'exécution de Zeek: {str(e)}")
        finally:
            self.capture_active = False

    #Fonction de surveillance des logs générés
    def _monitor_logs(self, log_dir):
        processed_files = set()
        
        while self.capture_active:
            try:
                log_files = [f for f in os.listdir(log_dir) if f.endswith('.log')]
                
                for log_file in log_files:
                    if log_file not in processed_files:
                        full_path = os.path.join(log_dir, log_file)
                        self._import_log(full_path)
                        processed_files.add(log_file)
                        
                time.sleep(5)
            except Exception as e:
                print(f"Erreur lors de la surveillance des logs: {str(e)}")
                time.sleep(10)
    
    #Fonction d'importation des logs dans la bb
    def _import_log(self, log_file):
        
        log_type = os.path.basename(log_file).replace('.log', '')
        entries = parse_ascii_log(log_file)
        
        zeek_logs = []
        for data in entries:
            try:
                ts = float(data.get('ts', '0'))
                timestamp = datetime.utcfromtimestamp(ts)
                
                zeek_logs.append(ZeekLog(
                    session_id=self.session_id,
                    log_type=log_type,
                    timestamp=timestamp,
                    data=data
                ))
            except Exception as e:
                print(f"Erreur lors de l'import de l'entrée: {str(e)}")
        
       
        ZeekLog.objects.bulk_create(zeek_logs)
        print(f"Importé {len(zeek_logs)} logs de type {log_type}")
    
    #Fonction pour arreter la capture 
    def stop_capture(self):
        
        if not self.capture_active:
            return
            
        self.capture_active = False
        
        if self.zeek_process and self.zeek_process.poll() is None:
            try:
                os.killpg(os.getpgid(self.zeek_process.pid), signal.SIGTERM)
                self.zeek_process.wait(timeout=5)
                print(f"Capture stoppée proprement (PID: {self.zeek_process.pid})")
            except Exception as e:
                print(f"Erreur lors de l'arret de Zeek: {e}")
        
        print("Capture arrêtée")