import useInterfaces from '../hooks/useInterfaces';
import InterfaceList from '../components/InterfaceList';
import CaptureForm from '../components/Capture_Form';
import './Dashboard.css';

export default function Dashboard() {
  const { interfaces, loading, error } = useInterfaces();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1> NetForensic</h1>
        <p className="dashboard-subtitle">Surveillance et capture du trafic en temps réel</p>
      </header>

      <main className="dashboard-main">
        <section className="interface-section card">
          <h2>Interfaces Disponibles</h2>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <InterfaceList interfaces={interfaces} />
          )}
        </section>

        <section className="capture-section card">
          <h2>Nouvelle Capture</h2>
          <CaptureForm interfaces={interfaces} />
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>Session active • {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}