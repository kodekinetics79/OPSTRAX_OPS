
import React from 'react';

const GradeBadge = ({ grade }) => {
  const getStyles = () => {
    switch (grade?.toLowerCase()) {
      case 'platinum':
        return 'bg-slate-800 text-white border-slate-700 shadow-sm shadow-purple-500/20';
      case 'gold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'silver':
        return 'bg-white/10 text-gray-300 border-white/10';
      case 'bronze':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/5';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border flex items-center gap-1 w-fit ${getStyles()}`}>
      {grade === 'Platinum' && <span className="text-[10px]">✨</span>}
      {grade}
    </span>
  );
};

export default GradeBadge;
