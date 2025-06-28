import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InterfaceSelect({ onInterfaceChange }) {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshInterfaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/interfaces/');
      
      if (response.data.length === 0) {
        setError("Aucune interface détectée");
      } else {
        setInterfaces(response.data);
        if (response.data[0]) {
          onInterfaceChange(response.data[0].name);
        }
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInterfaces();
    
   
    const interval = setInterval(refreshInterfaces, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="interface-selector">
      <select 
        onChange={(e) => onInterfaceChange(e.target.value)}
        disabled={loading || error}>
        {loading && <option>Détection en cours...</option>}
        {error && <option>{error}</option>}
        
        {interfaces.map((iface, index) => (
          <option key={index} value={iface.name}>
            {iface.name} ({iface.description})
          </option>
        ))}
      </select>
      
      <button 
        type="button" 
        onClick={refreshInterfaces}
        disabled={loading}>
        ⟳ Rafraîchir
      </button>
    </div>
  );
}