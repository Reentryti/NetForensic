import joblib
import numpy as np
#import os
#from django.conf import settings

class PredictionIA:
    def __init__(self):
        #model_path = os.path.join(settings.BASE_DIR, 'models', 'network_forensics_model.joblib')
        self.model = joblib.load('models/network_forensics_model.joblib')
        self.scaler = joblib.load('models/scaler.joblib')
    
    def predict(self, data):
        try:
            # 1. Encodage du protocole
            proto_encoded = 1 if data['proto'] == 'tcp' else 0
            
            # 2. Préparation des features
            features = np.array([
                [data['src_port'], data['dst_port'], proto_encoded]
            ], dtype=np.float32)  # <-- Conversion en float32
            
            # 3. Normalisation
            features_scaled = self.scaler.transform(features)
            
            # 4. Prédiction
            prediction = int(self.model.predict(features_scaled)[0])  # Conversion en int
            proba = float(self.model.predict_proba(features_scaled)[0][1])  # Conversion en float
            
            return {
                'is_attack': bool(prediction),
                'confidence': proba
            }
            
        except Exception as e:
            raise ValueError(f"Erreur de prédiction: {str(e)}")

