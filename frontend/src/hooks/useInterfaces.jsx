import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useInterfaces() {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const response = await axios.get('/api/interfaces/');
        setInterfaces(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterfaces();
  }, []);

  return { interfaces, loading, error };
}