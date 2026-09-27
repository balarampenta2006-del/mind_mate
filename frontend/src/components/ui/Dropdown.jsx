import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Dropdown Component
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - The element that opens the dropdown
 * @param {Array<{label: string, icon?: string, onClick?: Function, danger?: boolean}>} props.items - Dropdown items
 * @param {'left'|'right'} props.align - Alignment of the dropdown menu
 */
export default function Dropdown({ trigger, items, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div 
          className="dropdown-menu" 
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: 0,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '200px',
            zIndex: 'var(--z-overlay)',
            padding: 'var(--sp-2) 0',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                width: '100%',
                padding: '10px var(--sp-4)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--text-sm)',
                color: item.danger ? 'var(--danger)' : 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
              className="dropdown-item-hover"
            >
              {item.icon && <i className={item.icon} style={{ width: '16px', textAlign: 'center' }} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    danger: PropTypes.bool
  })).isRequired,
  align: PropTypes.oneOf(['left', 'right'])
};
