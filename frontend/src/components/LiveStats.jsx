import { useEffect, useState } from "react";
import axios from "axios";

export default function LiveStatsCard() {
  const [stats, setStats] = useState({
    //Initializing stats
    packet_count: 0,
    throughput_mbps: 0,
    active_conns: 0,
    dropped: 0,
  });
  const [err, setErr] = useState(null);

  useEffect(() => {
    // Premier appel immédiat pour test
    const fetchStats = async () => {
      try {
        //console.log(" Appel API stats...");
        const response = await axios.get("/api/stats/live/");
        //console.log(" Réponse API stats:", response.data);
        //console.log(" Status:", response.status);
        setStats(response.data);
        setErr(null);
      } catch (error) {
        //console.error(" Erreur API stats:", error);
        //console.error(" Response data:", error.response?.data);
        //console.error(" Status code:", error.response?.status);
        setErr(`Erreur: ${error.response?.status || 'Réseau'} - ${error.message}`);
      }
    };

    // Premier appel
    fetchStats();

    // Puis interval
    const id = setInterval(fetchStats, 2000);
    return () => clearInterval(id);
  }, []);

  if (err) return (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <p className="text-red-600">{err}</p>
      <p className="text-sm text-red-500 mt-2">Vérifiez la console pour plus de détails</p>
    </div>
  );

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-4">Statistiques en temps réel</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Paquets" value={stats.packet_count} />
        <Stat label="Débit (Mbps)" value={stats.throughput_mbps} />
        <Stat label="Connexions actives" value={stats.active_conns} />
        <Stat label="Paquets perdus" value={stats.dropped} />
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Dernière mise à jour: {stats.timestamp ? new Date(stats.timestamp * 1000).toLocaleTimeString() : 'N/A'}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value?.toLocaleString() || 0}</p>
    </div>
  );
}