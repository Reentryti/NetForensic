import SessionTable from '../components/SessionTable';

export default function Sessions() {
  const { sessions } = useSessions();

  return (
    <div>
      <h2>Sessions passées</h2>
      <SessionTable data={sessions} />
    </div>
  );
}