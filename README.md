![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql&logoColor=white) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)   ![LLM-Ready](https://img.shields.io/badge/LLM-Integrated-purple?logo=openai&logoColor=white)
#  NetForensic - Plateforme de Forensic Réseau.

## Architecture

### 1.  Sonde Réseau (Agent de Capture)
- **Outils** : Zeek
- **Fonctions** :
  - Capture des paquets réseau au format PCAP
  - Extraction des métadonnées (IP, ports, protocoles, DNS, etc.)
  - Transmission sécurisée vers le backend

### 2. Backend Sécurisé
- **Technos** : Python (Django), PostgreSQL
- **Fonctions** :
  - Stockage structuré des logs
  - API REST sécurisée (JWT, OAuth2)
  - Intégration avec le moteur d’analyse IA

### 3. Moteur d’Analyse IA
- **Modèles** :
  - Apprentissage supervisé : Random Forest, SVM
  - Apprentissage non supervisé : Isolation Forest, DBSCAN
  - LLM (pour génération de résumé, classification ou explication d'événements)
- **Fonctions** :
  - Détection d’anomalies réseau
  - Corrélation multi-événements
  - Génération de synthèses via LLM

### 4. Tableau de Bord 
- **Technos** : React.js
- **Fonctions** :
  - Timeline interactive des activités réseau
  - Filtres multi-critères (adresse IP, protocole, timestamp…)
  - Export des résultats en PDF (conformes aux standards légaux)

---

## 🚀 Objectifs

- Reconstituer la chronologie d'une attaque
- Détecter des comportements malveillants en temps réel
- Conserver les preuves numériques pour les procédures légales
- Fournir des interfaces intuitives d’exploration et d’analyse