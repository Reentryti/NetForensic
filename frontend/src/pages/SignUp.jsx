import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      await axios.post('/api/auth/register/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Inscription</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Prénom"
          value={form.first_name}
          onChange={e => setForm({ ...form, first_name: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Nom"
          value={form.last_name}
          onChange={e => setForm({ ...form, last_name: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          S'inscrire
        </button>
      </form>
    </div>
  );
}