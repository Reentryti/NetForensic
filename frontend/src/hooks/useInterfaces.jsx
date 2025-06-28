import { useEffect, useState } from "react";
import axios from 'axios';

export default function useInterfaces(){
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
  axios.get('api/interfaces/')
  .then(res => setInterfaces(res.data))
  .catch(err =>{
    console.error("Erreur lors de la récupération des interfaces", err);
    setInterfaces([]);
  })
  .finally(() => setLoading(false));
}, []);

return {interfaces, loading};
};


