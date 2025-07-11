import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/sessions/analyzed/')
      .then(res => setSessions(res.data))
      .catch(() => setError("Impossible de charger les sessions analysées"));
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedSession) return;

    setLoading(true);
    setError('');
    setPdfUrl('');

    try {
      const res = await axios.get(`/api/capture/${selectedSession}/generate-report/`, {
        responseType: 'blob'
      });

      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      setPdfUrl(fileURL);

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la génération du rapport.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `rapport_session_${selectedSession}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
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

        {pdfUrl && (
          <div className="mt-6 flex flex-col items-center">
            <iframe
              src={pdfUrl}
              title="Rapport PDF"
              width="100%"
              height="600px"
              className="border"
            />
            <button
              onClick={handleDownload}
              className="mt-4 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Télécharger le rapport PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
