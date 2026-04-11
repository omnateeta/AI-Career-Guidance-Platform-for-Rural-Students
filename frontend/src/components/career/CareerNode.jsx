import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FaGraduationCap, FaBook, FaBriefcase, FaCertificate, FaIndustry, FaStar } from 'react-icons/fa';

// Category color schemes
const categoryStyles = {
  education: {
    bg: 'from-blue-500 to-blue-600',
    icon: FaGraduationCap,
    borderColor: 'border-blue-300',
  },
  stream: {
    bg: 'from-purple-500 to-purple-600',
    icon: FaBook,
    borderColor: 'border-purple-300',
  },
  degree: {
    bg: 'from-indigo-500 to-indigo-600',
    icon: FaGraduationCap,
    borderColor: 'border-indigo-300',
  },
  specialization: {
    bg: 'from-teal-500 to-teal-600',
    icon: FaStar,
    borderColor: 'border-teal-300',
  },
  career: {
    bg: 'from-green-500 to-green-600',
    icon: FaBriefcase,
    borderColor: 'border-green-300',
  },
  job: {
    bg: 'from-orange-500 to-orange-600',
    icon: FaIndustry,
    borderColor: 'border-orange-300',
  },
  certification: {
    bg: 'from-pink-500 to-pink-600',
    icon: FaCertificate,
    borderColor: 'border-pink-300',
  },
};

const CareerNode = ({ data }) => {
  // Defensive checks to prevent errors
  if (!data) {
    return null;
  }

  const style = categoryStyles[data.category] || categoryStyles.education;
  const Icon = style.icon;

  // Safely access children array
  const childrenCount = Array.isArray(data.children) ? data.children.length : 0;

  return (
    <div
      className={`clay-card min-w-[220px] max-w-[280px] bg-gradient-to-br ${style.bg} text-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">{data.label || 'Unknown'}</h3>
          <p className="text-xs opacity-90 line-clamp-2">{data.description || ''}</p>
          
          {data.metadata && typeof data.metadata === 'object' && (
            <div className="mt-2 space-y-1">
              {data.metadata.demand && (
                <div className="flex items-center text-xs">
                  <span className="opacity-75">Demand:</span>
                  <span className="ml-1 font-semibold capitalize">{data.metadata.demand}</span>
                </div>
              )}
              {data.metadata.duration && (
                <div className="text-xs opacity-75">⏱ {data.metadata.duration}</div>
              )}
            </div>
          )}
          
          {childrenCount > 0 && (
            <div className="mt-2 text-xs opacity-75">
              ✓ {childrenCount} options available
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  );
};

export default memo(CareerNode);
