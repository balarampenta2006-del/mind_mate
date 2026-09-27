import Modal from './Modal.jsx';

/**
 * Confirmation dialog for destructive actions
 * @param {{ isOpen:boolean, onClose:()=>void, onConfirm:()=>void, title:string, message:string, confirmLabel?:string, isDestructive?:boolean, isLoading?:boolean }} props
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}${isLoading ? ' btn-loading' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {!isLoading && confirmLabel}
          </button>
        </div>
      }
    >
      <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
