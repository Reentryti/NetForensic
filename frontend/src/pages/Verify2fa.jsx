import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Verify2FA() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('temp_token');
      const res = await axios.post('/api/auth/verify-2fa/', { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('temp_token');
      navigate('/');
    } catch (err) {
      setError("Code invalide");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Vérification 2FA</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Code 2FA"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Valider
        </button>
      </form>
    </div>
  );
}