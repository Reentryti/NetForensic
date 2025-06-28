import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Capture', path: '/capture' },
    { name: 'Analyse', path: '/analysis' },
    { name: 'Rapport', path: '/report' },
  ];

  return (
    <nav className="bg-blue-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">NetForensic</h1>
        <div className="flex space-x-4">
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
        </div>
      </div>
    </nav>
  );
}
