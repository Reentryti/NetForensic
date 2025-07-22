import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Capture', path: '/capture' },
    { name: 'Analyse', path: '/analysis' },
    { name: 'Rapport', path: '/report' },
  ];

  // Fonction pour lire le cookie CSRF
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  //  Initialise le cookie CSRF au chargement du composant
  useEffect(() => {
    axios.get("http://localhost:8000/accounts/csrf/", {
      withCredentials: true,
    })
    .then(() => console.log("CSRF cookie récupéré"))
    .catch(err => console.error("Erreur CSRF init:", err));
  }, []);

  // Logout 
  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8000/accounts/logout/', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          "X-CSRFToken": getCookie("csrftoken"), 
        },
      });

      if (response.status === 200) {
        window.location.href = 'http:localhost:8000/accounts/login/';
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="bg-blue-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">NetForensic</h1>

        <div className="flex items-center space-x-4">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-3 py-1 rounded ${
                location.pathname === item.path
                  ? 'bg-white text-blue-700 font-semibold'
                  : 'hover:bg-blue-600'
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Logout Button */}
          {location.pathname === '/' && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-semibold"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
