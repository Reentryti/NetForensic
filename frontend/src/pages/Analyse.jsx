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
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">Analyse du trafic</h1>

      <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
        <p className="mb-4 text-gray-600">Choisissez une session puis cliquez pour lancer l'analyse.</p>

        <select
          className="w-full mb-4 p-2 border rounded"
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
        >
          <option value="">-- Sélectionner une session --</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              Session #{session.id} - {session.interface_name} - {new Date(session.start_time).toLocaleString()}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalysis}
          disabled={loading || !selectedSession}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Lancer l'analyse
        </button>

        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {result && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Résultat de l'analyse</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
