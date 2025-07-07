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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-6 font-sans">
      <h1 className="text-3xl font-extrabold text-cyan-300 text-center mb-8 font-mono drop-shadow">Rapport d'analyse</h1>

      <div className="p-8 max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={`mb-4 px-6 py-2 text-white font-bold rounded-md shadow-md transition-all duration-200 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? "Génération en cours..." : "Générer le rapport"}
        </button>

        {error && <p className="text-red-400 bg-red-900/40 border border-red-600 rounded-lg p-4 mb-4 font-semibold">{error}</p>}

        <textarea
          className="w-full h-96 border border-cyan-700 rounded-xl p-4 font-mono text-sm resize-none bg-slate-900 text-cyan-100 shadow-inner"
          value={report}
          readOnly
          placeholder="Le rapport généré apparaîtra ici..."
        />
      </div>
    </div>
  );
}
