import { motion } from 'framer-motion';

/**
 * GradientButton Component
 * Professional gradient button with claymorphism effect
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant (primary, accent, ocean, sunset)
 */
export default function GradientButton({ 
  children, 
  onClick, 
  disabled = false,
  type = 'button',
  className = '',
  variant = 'primary'
}) {
  const variantClasses = {
    primary: 'btn-gradient',
    accent: 'bg-gradient-to-r from-accent-400 to-accent-600 text-white font-semibold px-6 py-3 rounded-clay border-none shadow-clay hover:shadow-clay-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    ocean: 'bg-gradient-to-r from-secondary-400 to-secondary-600 text-white font-semibold px-6 py-3 rounded-clay border-none shadow-clay hover:shadow-clay-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    sunset: 'bg-gradient-to-r from-pink-400 to-orange-400 text-white font-semibold px-6 py-3 rounded-clay border-none shadow-clay hover:shadow-clay-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const baseClasses = `${variantClasses[variant]} ${className}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={baseClasses}
    >
      {children}
    </motion.button>
  );
}
