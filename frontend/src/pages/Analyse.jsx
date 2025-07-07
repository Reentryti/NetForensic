import { useState, useEffect } from 'react';
import axios from 'axios';
import { runAnalysis } from '../api/';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');

  useEffect(() => {
    axios.get('/api/sessions/')
      .then(res => setSessions(res.data))
      .catch(() => setError("Impossible de charger les sessions."));
  }, []);

  const handleAnalysis = async () => {
    if (!selectedSession) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`/api/capture/${selectedSession}/analyse/`);
      setResult(res.data);
    } catch (err) {
      setError("Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-6 font-sans">
      <h1 className="text-3xl font-extrabold text-cyan-300 text-center mb-6 font-mono drop-shadow">Analyse du trafic</h1>

      <div className="max-w-xl mx-auto bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <p className="mb-4 text-slate-300">Choisissez une session puis cliquez pour lancer l'analyse.</p>

        <select
          className="w-full mb-4 p-2 border border-cyan-700 rounded bg-slate-900 text-cyan-200 focus:ring-2 focus:ring-cyan-400"
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
        >
          <option value="">-- Sélectionner une session --</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id} className="bg-slate-900 text-cyan-200">
              Session #{session.id} - {session.interface_name} - {new Date(session.start_time).toLocaleString()}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalysis}
          disabled={loading || !selectedSession}
          className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Lancer l'analyse
        </button>

        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 bg-red-900/40 border border-red-600 rounded-lg p-4 text-center font-semibold">{error}</p>}

        {result && (
          <div className="mt-6 bg-cyan-950/60 border border-cyan-700 rounded-xl p-4">
            <h2 className="text-lg font-bold text-cyan-200 mb-2 font-mono">Résultat de l'analyse</h2>
            <pre className="text-sm text-cyan-100 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
