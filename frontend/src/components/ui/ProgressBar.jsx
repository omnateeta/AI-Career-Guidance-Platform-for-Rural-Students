import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Gamified claymorphism progress bar
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.label - Progress label
 * @param {string} props.showPercentage - Show percentage text
 * @param {string} props.className - Additional CSS classes
 */
export default function ProgressBar({ 
  progress = 0, 
  label, 
  showPercentage = true,
  className = '' 
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gradient">{clampedProgress}%</span>
          )}
        </div>
      )}
      
      <div className="progress-clay w-full h-4">
        <motion.div
          className="progress-clay-fill h-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
