import SessionTable from '../components/SessionTable';
import useSessions from '../hooks/useSessions';

export default function Sessions() {
  const { sessions } = useSessions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-6 font-sans">
      <h2 className="text-3xl font-extrabold text-cyan-300 text-center mb-8 font-mono drop-shadow">Sessions passées</h2>
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        <SessionTable data={sessions} />
      </div>
    </div>
  );
}