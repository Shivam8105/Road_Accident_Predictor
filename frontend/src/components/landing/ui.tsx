import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'quiet';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-60 active:translate-y-px';

const sizes = 'px-5 py-2.5';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  quiet: 'text-slate-600 hover:text-slate-900',
};

/** Shared control primitive. Corner radius for controls is 8px (rounded-lg), by design. */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  return <button className={`${base} ${variant === 'quiet' ? '' : sizes} ${variants[variant]} ${className}`} {...props} />;
};
