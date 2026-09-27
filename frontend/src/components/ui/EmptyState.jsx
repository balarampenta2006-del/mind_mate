/**
 * @param {{ icon?:string, title:string, description?:string, action?:React.ReactNode }} props
 */
export default function EmptyState({ icon = 'fa-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
}
