import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function LiveStats() {
  const [stats, setStats] = useState({
    packetCount: 0,
    throughput: 0,
    activeConnections: 0,
    trafficData: Array(15).fill(0).map((_, i) => ({ time: i, packets: 0 }))
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats/live/');
        setStats(prev => ({
          packetCount: response.data.packet_count || 0,
          throughput: response.data.throughput_mbps || 0,
          activeConnections: response.data.active_connections || 0,
          trafficData: [
            ...prev.trafficData.slice(1),
            { 
              time: prev.trafficData.length > 0 
                ? prev.trafficData[prev.trafficData.length - 1].time + 1 
                : 0,
              packets: response.data.packets_last_second || 0
            }
          ]
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-stats-card">
      <h3>Statistiques en Temps Réel</h3>
      
      <div className="metrics-grid">
        <MetricCard 
          title="Paquets" 
          value={stats.packetCount.toLocaleString()} 
          icon="📦"
        />
        <MetricCard 
          title="Débit" 
          value={`${stats.throughput.toFixed(2)} Mbps`} 
          icon="🚀"
        />
        <MetricCard 
          title="Connexions" 
          value={stats.activeConnections} 
          icon="🔗"
        />
      </div>

      <div className="traffic-chart">
        <h4>Activité Réseau (30s)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.trafficData}>
            <XAxis dataKey="time" hide />
            <YAxis />
            <Line 
              type="monotone" 
              dataKey="packets" 
              stroke="#8884d8" 
              dot={false} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-title">{title}</div>
  </div>
);