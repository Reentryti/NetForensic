import useInterfaces from '../hooks/useInterfaces';
import { useState } from 'react'; 
export default function CaptureForm() {
  const { interfaces, loading } = useInterfaces();
  const [form, setForm] = useState({
    interface_id: '',
    filter: ''
  });

  const handleSubmit = () => {
    axios.post('/api/capture/', form)
      .then(() => alert('Capture démarrée !'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={form.interface_id}
        onChange={(e) => setForm({...form, interface_id: e.target.value})}
      >
        <option value="">Sélectionner une interface</option>
        {interfaces.map(iface => (
          <option key={iface.id} value={iface.id}>
            {iface.name}
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