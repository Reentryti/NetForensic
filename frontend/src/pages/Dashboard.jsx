export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700">NetForensic</h1>
        <p className="text-gray-600 mt-2 text-lg">Surveillance et capture du trafic en temps réel</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Bloc Capture */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Capture</h2>
            <p className="text-gray-600 mb-4">Démarrez une capture de trafic réseau en temps réel sur l'interface de votre choix.</p>
          </div>
          <a href="/capture" className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
            Accéder
          </a>
        </div>

        {/* Bloc Analyse */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyse</h2>
            <p className="text-gray-600 mb-4">Lancez l'analyse de la capture récente pour détecter des anomalies ou attaques potentielles.</p>
          </div>
          <a href="/analysis" className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
            Accéder
          </a>
        </div>

        {/* Bloc Rapport */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Rapport</h2>
            <p className="text-gray-600 mb-4">Générez un rapport lisible et synthétique basé sur les résultats de l'analyse IA.</p>
          </div>
          <a href="/report" className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
            Accéder
          </a>
        </div>
      </main>

      <footer className="mt-10 text-center text-sm text-gray-500">
        Session active • {new Date().toLocaleTimeString()}
      </footer>
    </div>
  );
}
