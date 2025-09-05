// Fix: Implement a flexible InputField component that supports adornments.
import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  rightAdornmentPadding?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, leftAdornment, rightAdornment, rightAdornmentPadding, className = '', ...props }) => {
  return (
    <div>
      {/* Hide label if it's empty string, useful for tenure input */}
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>}
      <div className="relative rounded-md shadow-sm">
        {leftAdornment && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{leftAdornment}</span>
          </div>
        )}
        <input
          id={id}
          className={`block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700
                     text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200
                     ${leftAdornment ? 'pl-7' : 'pl-3'} ${rightAdornment ? (rightAdornmentPadding || 'pr-3') : 'pr-3'} py-2.5 ${className}`}
          {...props}
        />
        {rightAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightAdornment}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;