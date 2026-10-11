import React from 'react';
import { ShimmerLayers, shimmerHostClass, shimmerVars } from '@/components/ui/shimmer-layers';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'ghost' | 'green';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  className?: string;
}

// Filled variants get the running edge light (ShimmerLayers) and a
// coloured drop shadow; the fill is the --bg variable so hover/active can
// change it underneath the light.
const FILLED: ButtonVariant[] = ['primary', 'green', 'danger'];

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'text-text-inverse border border-white/10 [--bg:var(--brand)] hover:[--bg:var(--brand-hover)] active:[--bg:var(--brand-active)] shadow-[0_6px_16px_-6px_rgba(234,124,17,0.55)] hover:shadow-[0_10px_22px_-8px_rgba(234,124,17,0.6)]',
  green:
    'text-text-inverse border border-white/10 [--bg:var(--brand)] hover:[--bg:var(--brand-hover)] active:[--bg:var(--brand-active)] shadow-[0_6px_16px_-6px_rgba(234,124,17,0.55)] hover:shadow-[0_10px_22px_-8px_rgba(234,124,17,0.6)]',
  danger:
    'text-text-inverse border border-white/10 [--bg:#b91c1c] hover:[--bg:#991b1b] active:[--bg:#7f1d1d] shadow-[0_6px_16px_-6px_rgba(185,28,28,0.5)]',
  secondary:
    'text-text-base border border-border-default bg-gradient-to-b from-white to-gray-50 hover:to-gray-100 active:from-gray-50 shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(16,24,40,0.06),0_4px_10px_-6px_rgba(16,24,40,0.18)]',
  'danger-outline':
    'text-red-600 border border-red-300 hover:border-red-400 bg-gradient-to-b from-white to-red-50/40 hover:to-red-50 shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(16,24,40,0.05)]',
  ghost:
    'bg-transparent text-text-secondary hover:bg-gray-100 active:bg-gray-200 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const Spinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${iconSizeStyles[size]}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  children,
  className = '',
}) => {
  const isDisabled = disabled || loading;
  const filled = FILLED.includes(variant);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={filled ? shimmerVars({ radius: '0.5rem' }) : undefined}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg',
        filled ? shimmerHostClass : '',
        'transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out',
        'hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2',
        'select-none cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {filled && <ShimmerLayers />}
      {loading ? (
        <Spinner size={size} />
      ) : leftIcon ? (
        <span className={`shrink-0 ${iconSizeStyles[size]}`} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {children && <span>{children}</span>}

      {!loading && rightIcon && (
        <span className={`shrink-0 ${iconSizeStyles[size]}`} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
