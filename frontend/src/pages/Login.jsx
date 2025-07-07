import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login/', form);
      if (response.data.requires_2fa) {
        localStorage.setItem('temp_token', response.data.temp_token);
        navigate('/verify-2fa');
      } else {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError("Identifiants invalides");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Connexion</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
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
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Se connecter
        </button>
      </form>
    </div>
  );
}