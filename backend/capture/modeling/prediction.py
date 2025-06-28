import joblib
import numpy as np
#import os
#from django.conf import settings


class PredictionIA:
    def __init__(self):
        self.model = joblib.load('models/unsw_rf_model_reduit.pkl')
        self.scaler = joblib.load('models/unsw_scaler_reduit.pkl')

        self.proto_map = {'tcp': 0, 'udp': 1, 'icmp': 2} 
        self.state_map = {'FIN': 0, 'CON': 1, 'INT': 2} 

    def encode_feature(self, value, mapping):
        return mapping.get(value, -1)

    def predict(self, data):
        try:
            proto = self.encode_feature(data['proto'], self.proto_map)
            state = self.encode_feature(data['state'], self.state_map)

            features_list = [
                float(data['sport']),
                float(data['dsport']),
                proto,
                state,
                float(data['dur']),
                float(data['sbytes']),
                float(data['dbytes']),
                float(data['spkts']),
                float(data['dpkts'])
            ]

            features_np = np.array([features_list])
            features_scaled = self.scaler.transform(features_np)

            prediction = int(self.model.predict(features_scaled)[0])
            confidence = float(self.model.predict_proba(features_scaled)[0][1])

            return {
                "is_attack": bool(prediction),
                "confidence": round(confidence, 3)
            }

        except Exception as e:
            raise ValueError(f"Erreur de prédiction: {str(e)}")
