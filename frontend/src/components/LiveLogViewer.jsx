import { useEffect, useState, useRef } from 'react';

export default function LiveLogViewer() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const logsEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // Auto-scroll
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
  if (!isInitialMount.current && logs.length > 0) {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100); 

    return () => clearTimeout(timeout);
    } else {
      isInitialMount.current = false;
    }
  }, [logs]);
  

  useEffect(() => {
    const eventSource = new EventSource('/api/logs/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prev => [...prev.slice(-99), newLog]); 
    };

    eventSource.onerror = () => {
      console.error("Erreur de connexion SSE");
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return (
    <div className="bg-black text-green-400 font-mono rounded shadow-md">
    
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white text-sm">
       
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
        </div>
      </div>

      <div className="p-4 h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center">
            En attente de logs...
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="mb-4 p-2 bg-gray-100 rounded text-sm font-mono">

               <div className="mb-1 text-blue-800 font-semibold">
                    [{log.timestamp}] [{log.log_type}]
                </div>
                <pre className="overflow-x-auto">
                    {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                </pre>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}