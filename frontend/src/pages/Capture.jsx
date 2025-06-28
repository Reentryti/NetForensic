import CaptureForm from "../components/Capture_Form";
import './Capture.css';


export default function Capture() {
  return (
    <div>
      <h2>Nouvelle Capture</h2>
      <CaptureForm />
      <div className="live-logs">
        <h3>Logs en temps réel</h3>
      </div>
    </div>
  );
}