/**
 * BuffrSign iOS-Style Button Component
 * 
 * Purpose: iOS-inspired button component with consistent rounded styling
 * Location: /components/ui/button.tsx
 * Features: iOS-style rounded corners, smooth animations, touch-friendly sizing
 * 
 * iOS Design Principles:
 * - Rounded corners (12px radius for standard buttons)
 * - Subtle shadows for depth
 * - Smooth transitions and hover effects
 * - Touch-friendly minimum 44px height
 * - Clean typography with proper font weights
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'default' | 'loading' | 'disabled' | 'success' | 'error';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  state = 'default',
  children,
  className,
  disabled,
  ...props
}, ref) => {
  // iOS-style base styles with rounded corners and smooth transitions
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-95';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg active:shadow-sm',
    outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md active:shadow-sm',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
    success: 'bg-chart-2 text-white hover:bg-chart-2/90 shadow-md hover:shadow-lg active:shadow-sm',
    warning: 'bg-chart-3 text-white hover:bg-chart-3/90 shadow-md hover:shadow-lg active:shadow-sm',
    error: 'bg-chart-5 text-white hover:bg-chart-5/90 shadow-md hover:shadow-lg active:shadow-sm'
  };
  
  // iOS-style sizing with rounded corners and touch-friendly heights
  const sizeStyles = {
    sm: 'h-9 px-4 text-sm rounded-lg', // 36px height, 8px radius
    md: 'h-11 px-6 text-base rounded-xl', // 44px height, 12px radius (iOS standard)
    lg: 'h-12 px-8 text-lg rounded-xl', // 48px height, 12px radius
    xl: 'h-14 px-10 text-xl rounded-2xl' // 56px height, 16px radius
  };
  
  const stateStyles = {
    default: '',
    loading: 'opacity-75 cursor-not-allowed',
    disabled: 'opacity-50 cursor-not-allowed',
    success: 'bg-chart-2 hover:bg-chart-2/90',
    error: 'bg-chart-5 hover:bg-chart-5/90'
  };

  const isDisabled = disabled || state === 'loading' || state === 'disabled';

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        stateStyles[state],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {state === 'loading' && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;