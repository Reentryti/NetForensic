import { Link, useLocation } from 'react-router-dom';
import { FaNetworkWired } from 'react-icons/fa';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Capture', path: '/capture' },
    { name: 'Analyse', path: '/analysis' },
    { name: 'Rapport', path: '/report' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 shadow-lg border-b border-cyan-500">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaNetworkWired className="text-cyan-400 text-2xl drop-shadow" />
          <h1 className="text-2xl font-extrabold tracking-wide text-cyan-300 font-mono">NetForensic</h1>
        </div>
        <div className="flex space-x-2 md:space-x-4">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm md:text-base shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-blue-900 
                ${location.pathname === item.path
                  ? 'bg-cyan-400 text-blue-900 shadow-md'
                  : 'hover:bg-cyan-600 hover:text-white text-cyan-100'}
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
