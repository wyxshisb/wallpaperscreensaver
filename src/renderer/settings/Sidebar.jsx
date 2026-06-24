export default function Sidebar({ panels, activePanel, onSelect }) {
  return (
    <nav className="settings-sidebar">
      {panels.map((panel) => (
        <div
          key={panel.id}
          className={`sidebar-item ${activePanel === panel.id ? 'active' : ''}`}
          onClick={() => onSelect(panel.id)}
        >
          <span className="sidebar-icon">{panel.icon}</span>
          <span>{panel.label}</span>
        </div>
      ))}
    </nav>
  );
}
