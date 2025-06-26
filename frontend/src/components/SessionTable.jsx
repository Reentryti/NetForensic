import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SessionTable({ data }) {
  return (
    <table className="session-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Interface</th>
          <th>Début</th>
          <th>Durée</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((session) => (
          <tr key={session.id}>
            <td>{session.id}</td>
            <td>{session.interface.name}</td>
            <td>
              {format(new Date(session.start_time), 'PPpp', { locale: fr })}
            </td>
            <td>
              {session.end_time 
                ? `${Math.round((new Date(session.end_time) - new Date(session.start_time)) / 60000)} min`
                : 'En cours'}
            </td>
            <td>
              <Link to={`/sessions/${session.id}`}>
                <button>Détails</button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}