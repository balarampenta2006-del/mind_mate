import { getInitials } from '@/utils/formatters.js';

/**
 * @param {{ name:string, size?:'sm'|'md'|'lg'|'xl', color?:string }} props
 */
export default function Avatar({ name = '', size = 'md', color }) {
  const initials = getInitials(name);
  return (
    <div
      className={`avatar avatar-${size}`}
      aria-label={name}
      style={color ? { background: color } : undefined}
      title={name}
    >
      {initials}
    </div>
  );
}
