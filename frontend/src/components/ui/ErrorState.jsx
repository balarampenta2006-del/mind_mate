import PropTypes from 'prop-types';

/**
 * Reusable Error State Component
 * @param {Object} props
 * @param {string} props.title - The error title
 * @param {string} props.message - The detailed error message
 * @param {Function} props.onRetry - Optional retry callback
 */
export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="empty-state" style={{ color: 'var(--danger)' }}>
      <div className="empty-state-icon" style={{ color: 'var(--danger-soft)', background: 'var(--danger)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '28px', color: '#fff' }} />
      </div>
      <h3 style={{ color: 'var(--text)' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '0 auto' }}>
        {message || 'An unexpected error occurred while trying to load this content. Please try again later.'}
      </p>
      {onRetry && (
        <button className="btn btn-outline" style={{ marginTop: 'var(--sp-4)' }} onClick={onRetry}>
          <i className="fa-solid fa-rotate-right" /> Try Again
        </button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func
};
