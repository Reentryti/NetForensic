import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/capture">Capture</Link>
        <Link to="/sessions">Sessions</Link>
      </nav>
      <main>
        <Outlet />  {/* Content get there */}
      </main>
    </div>
  );
}