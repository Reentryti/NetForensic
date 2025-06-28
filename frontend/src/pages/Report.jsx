import { useState } from "react";
import { generateReport } from "../api";

export default function ReportPage() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const data = await generateReport();
      setReport(data.report || "Aucun rapport disponible.");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération du rapport.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rapport d'analyse</h1>

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className={`mb-4 px-4 py-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {loading ? "Génération en cours..." : "Générer le rapport"}
      </button>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <textarea
        className="w-full h-96 border rounded p-4 font-mono text-sm resize-none"
        value={report}
        readOnly
        placeholder="Le rapport généré apparaîtra ici..."
      />
    </div>
  );
}
