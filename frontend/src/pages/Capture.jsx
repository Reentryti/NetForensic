import { useEffect, useState } from 'react';
import axios from 'axios';
import CaptureForm from '../components/CaptureForm';

export default function CapturePage() {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-6 font-sans">
      <h1 className="text-3xl font-extrabold text-cyan-300 text-center mb-8 font-mono drop-shadow">Capture du trafic</h1>

      {loading ? (
        <p className="text-center text-cyan-400 animate-pulse">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-400 bg-red-900/40 border border-red-600 rounded-lg p-4 max-w-xl mx-auto font-semibold">{error}</p>
      ) : (
        <>
          <div className="max-w-2xl mx-auto mb-10">
            <CaptureForm interfaces={interfaces} />
          </div>

          {activeSession && (
            <div className="bg-yellow-100/10 border border-yellow-400 rounded-xl p-4 max-w-2xl mx-auto mb-6 shadow-lg">
              <h2 className="text-lg font-bold text-yellow-300 mb-2 font-mono">Session en cours</h2>
              <p className="text-cyan-100">Session ID: <span className='font-bold'>{activeSession.id}</span></p>
              <p className="text-cyan-100">Interface: <span className='font-bold'>{activeSession.interface_name}</span></p>
              <p className="text-cyan-100">Démarrée le: <span className='font-bold'>{new Date(activeSession.start_time).toLocaleString()}</span></p>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-cyan-200 mb-4 font-mono">Sessions passées</h2>
            <div className="bg-slate-800 shadow rounded-xl p-4 divide-y border border-slate-700">
              {sessions.filter(s => s.status !== 'running').length === 0 ? (
                <p className="text-cyan-400">Aucune session passée.</p>
              ) : (
                sessions
                  .filter(s => s.status !== 'running')
                  .map(session => (
                    <div key={session.id} className="py-2">
                      <p className="font-semibold text-cyan-200">Session #{session.id}</p>
                      <p className="text-sm text-cyan-100">Interface: {session.interface_name} | {new Date(session.start_time).toLocaleString()}</p>
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
