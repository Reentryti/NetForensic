import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LogViewer from '../components/LogViewer';

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Chargement de la session
    axios.get(`/api/sessions/${id}/`)
      .then(res => setSession(res.data));

    // Chargement des logs associés
    axios.get(`/api/sessions/${id}/logs/`)
      .then(res => setLogs(res.data));
  }, [id]);

  if (!session) return <div>Chargement...</div>;

  return (
    <div className="session-detail">
      <h2>Session #{session.id}</h2>
      <div className="metadata">
        <p>Interface: <strong>{session.interface.name}</strong></p>
        <p>Statut: <span className={`status-${session.status}`}>{session.status}</span></p>
      </div>
      
      <LogViewer logs={logs} />
    </div>
  );
}