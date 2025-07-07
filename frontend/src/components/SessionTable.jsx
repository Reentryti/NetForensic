import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SessionTable({ data }) {
  return (
    <table className="w-full text-cyan-100 bg-blue-950/80 rounded-xl border border-cyan-700 shadow-md font-mono">
      <thead>
        <tr className="bg-cyan-900/60">
          <th className="py-2 px-4 border-b border-cyan-700">ID</th>
          <th className="py-2 px-4 border-b border-cyan-700">Interface</th>
          <th className="py-2 px-4 border-b border-cyan-700">Début</th>
          <th className="py-2 px-4 border-b border-cyan-700">Statut</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map(session => (
            <tr key={session.id} className="hover:bg-cyan-900/30 transition-all">
              <td className="py-2 px-4 border-b border-cyan-800 text-cyan-200 font-bold">{session.id}</td>
              <td className="py-2 px-4 border-b border-cyan-800">{session.interface_name}</td>
              <td className="py-2 px-4 border-b border-cyan-800">{new Date(session.start_time).toLocaleString()}</td>
              <td className="py-2 px-4 border-b border-cyan-800">
                <span className={`px-2 py-1 rounded text-xs font-semibold 
                  ${session.status === 'running' ? 'bg-cyan-400 text-blue-950' : 'bg-cyan-900 text-cyan-200'}`}>{session.status}</span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="py-4 text-center text-cyan-400">Aucune session trouvée.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}