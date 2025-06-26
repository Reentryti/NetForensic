export default function InterfaceList({ interfaces }) {
  return (
    <div className="card">
      <h3>Interfaces disponibles</h3>
      <ul>
        {interfaces.map(iface => (
          <li key={iface.id}>
            <span>{iface.name}</span>
            <span>{iface.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}