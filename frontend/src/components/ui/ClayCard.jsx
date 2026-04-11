import { motion } from 'framer-motion';

/**
 * ClayCard Component
 * Professional claymorphism card with 3D soft UI effect
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Enable hover animation (default: true)
 * @param {Function} props.onClick - Click handler
 * @param {'sm' | 'md' | 'lg'} props.size - Card size (default: 'md')
 */
export default function ClayCard({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'clay-card-sm p-4',
    md: 'clay-card p-6',
    lg: 'clay-card-lg p-8'
  };

  const baseClasses = `${sizeClasses[size]} ${className}`;

  if (onClick) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.02, y: -4 } : {}}
        whileTap={hover ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
