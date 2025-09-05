import React from 'react';
import type { TenureUnit } from '../types';

interface TenureSwitchProps {
  selectedUnit: TenureUnit;
  onUnitChange: (unit: TenureUnit) => void;
}

const TenureSwitch: React.FC<TenureSwitchProps> = ({ selectedUnit, onUnitChange }) => {
  const baseClasses = "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500";

  return (
    <div className="flex bg-slate-200 dark:bg-slate-600 p-1 rounded-lg mt-0.5">
      <button
        type="button"
        onClick={() => onUnitChange('years')}
        className={`${baseClasses} ${selectedUnit === 'years' ? activeClasses : inactiveClasses.replace('hover:bg-slate-300 dark:hover:bg-slate-500', '')}`}
      >
        Years
      </button>
      <button
        type="button"
        onClick={() => onUnitChange('months')}
        className={`${baseClasses} ${selectedUnit === 'months' ? activeClasses : inactiveClasses.replace('hover:bg-slate-300 dark:hover:bg-slate-500', '')}`}
      >
        Months
      </button>
    </div>
  );
};

export default TenureSwitch;
