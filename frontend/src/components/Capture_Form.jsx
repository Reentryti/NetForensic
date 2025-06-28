import useInterfaces from '../hooks/useInterfaces';
import { useState } from 'react'; 
import axios from 'axios';
import { createPath } from 'react-router-dom';

export default function CaptureForm() {
  const { interfaces, loading } = useInterfaces();
  const [form, setForm] = useState({
    interface_name: '',
    filter: ''
  });

  const handleSubmit = () => {
    e.preventDefault();

    axios.post('/api/capture/', form)
      .then(() => alert('Capture démarrée !'))
      .catch(err => {
        console.error(err);
        alert('Erreur de démarrage de la capture');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={form.interface_id}
        onChange={(e) => setForm({...form, interface_id: e.target.value})}>
        <option value="">Sélectionner une interface</option>
        {interfaces.map(iface => (
          <option key={iface.name} value={iface.name}>
            {iface.name} ({iface.type})
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filtre BPF (optionnel)"
        value={form.filter}
        onChange={(e) => setForm({...form, filter: e.target.value})}
      />

      <button type="submit">Démarrer</button>
    </form>
  );
}