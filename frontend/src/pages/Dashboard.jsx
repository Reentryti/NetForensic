import { Network, Search, FileText, Activity, Shield, AlertTriangle, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    {
      title: "Paquets Analysés",
      value: "2,847,392",
      change: "+12.5%",
      icon: Activity,
      color: "text-green-400",
    },
    {
      title: "Menaces Détectées",
      value: "23",
      change: "-8.2%",
      icon: Shield,
      color: "text-red-400",
    },
    {
      title: "Alertes Actives",
      value: "7",
      change: "+2",
      icon: AlertTriangle,
      color: "text-yellow-400",
    },
    {
      title: "Connexions Actives",
      value: "156",
      change: "+5.1%",
      icon: Users,
      color: "text-cyan-400",
    },
  ];

  // Données pour les graphiques
  const trafficData = [
    { time: "13:00", upload: 45, download: 120 },
    { time: "13:05", upload: 52, download: 135 },
    { time: "13:10", upload: 48, download: 128 },
    { time: "13:15", upload: 61, download: 142 },
    { time: "13:20", upload: 55, download: 138 },
    { time: "13:25", upload: 67, download: 155 },
    { time: "13:30", upload: 59, download: 148 },
  ];
  const protocolData = [
    { name: "HTTP/HTTPS", value: 45, color: "#06b6d4" },
    { name: "TCP", value: 25, color: "#4caf50" },
    { name: "UDP", value: 15, color: "#f59e42" },
    { name: "ICMP", value: 10, color: "#ef4444" },
    { name: "Autres", value: 5, color: "#a21caf" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
    

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Network className="w-12 h-12 text-cyan-400" />
            <h2 className="text-4xl font-bold text-white">NetForensic</h2>
          </div>
          <p className="text-xl text-slate-300 mb-6">Surveillance et analyse intelligente du trafic réseau</p>
          <div className="flex items-center justify-center space-x-4 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Session active • {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{metric.title}</p>
                  <p className="text-white text-2xl font-bold">{metric.value}</p>
                  <p className={`text-sm ${metric.color}`}>{metric.change}</p>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="flex flex-col items-center text-center">
              <Network className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Capture</h3>
              <p className="text-slate-300 mb-4">Démarrez une capture de trafic réseau en temps réel sur l'interface de votre choix.</p>
              <a href="/capture" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-semibold shadow transition">Accéder</a>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="flex flex-col items-center text-center">
              <Search className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Analyse</h3>
              <p className="text-slate-300 mb-4">Lancez l'analyse de la capture récente pour détecter des anomalies ou attaques potentielles.</p>
              <a href="/analysis" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-semibold shadow transition">Accéder</a>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="flex flex-col items-center text-center">
              <FileText className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Rapport</h3>
              <p className="text-slate-300 mb-4">Générez un rapport lisible et synthétique basé sur les résultats de l'analyse IA.</p>
              <a href="/report" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-semibold shadow transition">Accéder</a>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trafic Réseau */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-cyan-400 text-lg font-semibold mb-4">Trafic Réseau (Mbps)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #06b6d4', color: '#fff' }} />
                <Line type="monotone" dataKey="download" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="upload" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Distribution des Protocoles */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-cyan-400 text-lg font-semibold mb-4">Distribution des Protocoles</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={protocolData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {protocolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #06b6d4', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#fff' }} formatter={value => <span style={{ color: '#fff' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
