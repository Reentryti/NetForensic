import useInterfaces from '../hooks/useInterfaces';
import InterfaceList from '../components/InterfaceList';
import CaptureForm from '../components/Capture_Form';
import LiveStats from '../components/LiveStats';

export default function Dashboard() {
  const { interfaces, loading } = useInterfaces();

  return (
    <div>
      <h1>Analyse Réseau</h1>
      <div className="grid">
        <InterfaceList interfaces={interfaces} />
        <CaptureForm />
        <LiveStats />
      </div>
    </div>
  );
}