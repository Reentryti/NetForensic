import os
import signal
from django.utils import timezone
from capture.models import CaptureSession

# Handle some bad sessions capture w/o pid during crash or restart
def cleanup_orphan_zeek_sessions():
    print("Nettoyage des session Zeek orphelines ...")

    sessions = CaptureSession.objects.filter(status='running')

    for session in sessions:
        if session.pid:
            try:
                os.killpg(os.getpgid(session.pid), signal.SIGTERM)
                print(f"Capture {session.id} (pid={session.pid}) stoppée automatiquement.")
                killed = True
            except ProcessLookupError:
                print(f" Processus {session.pid} déjà arrêté.")
                killed = True
            except Exception as e:
                print(f" Erreur arrêt session {session.id}: {e}")

        else:
            print(f"Session {session.id} sans PID → impossible d'arrêter Zeek proprement.")

        # Database sync
        session.status = 'failed' if not session.pid else 'stopped'
        session.end_time = timezone.now()
        session.save()
