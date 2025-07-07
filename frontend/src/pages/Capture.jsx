import { useEffect, useState } from 'react';
import axios from 'axios';
import CaptureForm from '../components/CaptureForm';
import LiveLogViewer from '../components/LiveLogViewer';

export default function CapturePage() {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

    const refreshSessions = async () => {
      try {
        const sessionRes = await axios.get('/api/sessions/');
        setSessions(sessionRes.data);
        const active = sessionRes.data.find(s => s.status === 'running');
        setActiveSession(active || null);
      } catch (err) {
        console.error("Erreur lors du rafraîchissement des sessions", err);
      }
    };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ifRes, sessionRes] = await Promise.all([
          axios.get('/api/interfaces/'),
          axios.get('/api/sessions/')
        ]);
        setInterfaces(ifRes.data);
        setSessions(sessionRes.data);

        const active = sessionRes.data.find(s => s.status === 'running');
        setActiveSession(active);
      } catch (err) {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">Capture du trafic</h1>

      {loading ? (
        <p className="text-center text-blue-500">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="max-w-2xl mx-auto mb-10">
            <CaptureForm interfaces={interfaces} activeSession={activeSession} onSessionUpdate={refreshSessions} />
          </div>

          {activeSession && (
            <>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-4 max-w-2xl mx-auto mb-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">Session en cours</h2>
                <p>Session ID: {activeSession.id}</p>
                <p>Interface: {activeSession.interface_name}</p>
                <p>Démarrée le: {new Date(activeSession.start_time).toLocaleString()}</p>
              </div>
              
              <div className="max-w-4xl mx-auto mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Logs réseau en temps réel</h2>
                <LiveLogViewer />
              </div>
            </>
          )}

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sessions passées</h2>
            <div className="bg-white shadow rounded p-4 divide-y">
              {sessions.filter(s => s.status !== 'running').length === 0 ? (
                <p className="text-gray-500">Aucune session passée.</p>
              ) : (
                sessions
                  .filter(s => s.status !== 'running')
                  .map(session => (
                    <div key={session.id} className="py-2">
                      <p className="font-semibold">Session #{session.id}</p>
                      <p className="text-sm text-gray-600">Interface: {session.interface} | {new Date(session.start_time).toLocaleString()}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
