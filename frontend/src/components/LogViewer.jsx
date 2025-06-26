export default function LogViewer({ logs }) {
  return (
    <div className="log-viewer">
      <h3>Logs</h3>
      <div className="log-container">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="timestamp">{log.timestamp}</span>
            <span className="log-type">{log.log_type}</span>
            <pre>{JSON.stringify(log.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}