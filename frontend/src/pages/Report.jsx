import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les sessions au chargement
  useEffect(() => {
    axios.get('/api/sessions/analyzed/')
      .then(res => setSessions(res.data))
      .catch(() => setError("Impossible de charger les sessions analysées"));
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedSession) return;

    setLoading(true);
    setError('');
    setReport('');

    try {
      const res = await axios.get(`/api/capture/${selectedSession}/generate-report/`);
      setReport(res.data.report || "Aucun rapport disponible.");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la génération du rapport.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">Génération de rapport</h1>

      <div className="bg-white rounded shadow p-6">
        <p className="mb-4 text-gray-600">Sélectionnez une session pour générer son rapport :</p>

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
          onClick={handleGenerateReport}
          disabled={loading || !selectedSession}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          {loading ? "Génération en cours..." : "Générer le rapport"}
        </button>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {report && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Rapport généré</h2>
            <textarea
              className="w-full h-96 border rounded p-4 font-mono text-sm resize-none"
              value={report}
              readOnly
              placeholder="Le rapport généré apparaîtra ici..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
