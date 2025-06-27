import csv
import os
from ..modeling.prediction import PredictionIA

def analyze_conn_log(log_path):
    predictor = PredictionIA()
    results = []

    if not os.path.exists(log_path):
        print(f"Fichier {log_path} introuvable.")
        return []

    with open(log_path, 'r') as f:
        reader = csv.DictReader(f, delimiter='\t')

        for row in reader:
            try:
                src_port = int(row.get('id.orig_p', 0))
                dst_port = int(row.get('id.resp_p', 0))
                proto = row.get('proto', 'tcp').lower()

                data = {
                    'src_port': src_port,
                    'dst_port': dst_port,
                    'proto': proto
                }

                result = predictor.predict(data)

                results.append({
                    'timestamp': row.get('ts'),
                    'src_port': src_port,
                    'dst_port': dst_port,
                    'proto': proto,
                    'is_attack': result['is_attack'],
                    'confidence': result['confidence']
                })

            except Exception as e:
                print(f"Erreur ligne Zeek : {e}")
    
    return results
