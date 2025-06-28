import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/sessions/')
      .then(response => {
        setSessions(response.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { sessions, loading };
}