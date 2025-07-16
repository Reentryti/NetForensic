import csv
import os
from ..modeling.prediction import PredictionIA

def analyze_conn_log(log_path):
    predictor = PredictionIA()
    results = []

    with open(log_path, 'r') as f:
    
        lines = []
        for line in f:
            if not line.startswith('#'):
                lines.append(line)
        
        
        from io import StringIO
        filtered_content = StringIO(''.join(lines))
        
        #Matching field with zeek conn_log
        field_names = ['ts', 'uid', 'id_orig_h', 'id_orig_p', 'id_resp_h', 'id_resp_p', 
                      'proto', 'service', 'duration', 'orig_bytes', 'resp_bytes', 
                      'conn_state', 'local_orig', 'local_resp', 'missed_bytes', 
                      'history', 'orig_pkts', 'orig_ip_bytes', 'resp_pkts', 
                      'resp_ip_bytes', 'tunnel_parents']
        
        reader = csv.DictReader(filtered_content, fieldnames=field_names, delimiter='\t')
        
        print("Colonnes utilisées:", field_names)

        for row_num, row in enumerate(reader, 1):
            try:
                if row_num <= 3:
                    print(f"Ligne {row_num}: {dict(row)}")
                
                id_orig_p = row.get('id_orig_p', '0')
                id_resp_p = row.get('id_resp_p', '0')

                #row.get('id_orig_h')
                #row.get('id_resp_h')

                
                try:
                    src_port = int(id_orig_p) if id_orig_p and id_orig_p != '-' else 0
                except (ValueError, TypeError):
                    src_port = 0
                    
                try:
                    dst_port = int(id_resp_p) if id_resp_p and id_resp_p != '-' else 0
                except (ValueError, TypeError):
                    dst_port = 0
                
                proto = (row.get('proto', 'tcp') or 'tcp').lower()
                state = row.get('conn_state', 'CON') or 'CON'
                
                row.get('id_orig_h')
                row.get('id_resp_h')


                def safe_float(value, default=0.0):
                    try:
                        return float(value) if value and value != '-' and value != '(empty)' else default
                    except (ValueError, TypeError):
                        return default
                
                data = {
                    'sport': src_port,
                    'dsport': dst_port,
                    'proto': proto,
                    'state': state,
                    'dur': safe_float(row.get('duration')),
                    'sbytes': safe_float(row.get('orig_bytes')),
                    'dbytes': safe_float(row.get('resp_bytes')),
                    'spkts': safe_float(row.get('orig_pkts')),
                    'dpkts': safe_float(row.get('resp_pkts'))
                }
                
                if row_num <= 3:
                    print(f"Data pour prédiction ligne {row_num}: {data}")

                result = predictor.predict(data)

                # Return data with correct field names for database
                results.append({
                    'timestamp': row.get('ts'),
                    'src_port': src_port,
                    'dst_port': dst_port,
                    'src_ip': row.get('id_orig_h'),
                    'dst_ip': row.get('id_resp_h'),
                    'proto': proto,
                    'is_attack': result['is_attack'],
                    'confidence': result['confidence']
                })

            except Exception as e:
                print(f"Erreur ligne Zeek {row_num}: {e}")
                print(f"Contenu de la ligne: {dict(row)}")
                continue

    print(f"Analyse terminée: {len(results)} lignes traitées avec succès")
    return results