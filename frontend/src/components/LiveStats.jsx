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
    const id = setInterval(() => {
      axios.get("/api/stats/live/")
        .then(res => setStats(res.data))
        .catch(e => setErr("Impossible de charger les stats"));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;
  //if (!stats) return <p className="animate-pulse">Stats…</p>;

  return (
    <div className="bg-white shadow rounded p-4 grid grid-cols-2 gap-4">
      <Stat label="Paquets" value={stats.packet_count} />
      <Stat label="Débit (par Mbps)" value={stats.throughput_mbps} />
      <Stat label="Connexions actives" value={stats.active_conns} />
      <Stat label="Paquets perdus" value={stats.dropped} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
