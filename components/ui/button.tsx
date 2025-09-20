/**
 * BuffrSign Button Component
 * 
 * Purpose: Reusable button component with business model integration
 * Location: /components/ui/Button.tsx
 * Features: TypeScript-based, design system compliant, business logic aware
 */

import React from 'react';
import { ButtonProps, designTokens, componentStyles } from '@/lib/design-system';
import { cn } from '@/lib/utils';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  state = 'default',
  children,
  onClick,
  className,
  ...props
}) => {
  const baseStyles = componentStyles.button.base;
  const variantStyles = componentStyles.button.variants[variant];
  const sizeStyles = componentStyles.button.sizes[size];
  
  const stateStyles = {
    loading: 'opacity-75 cursor-not-allowed',
    disabled: 'opacity-50 cursor-not-allowed',
    success: 'bg-success-500 hover:bg-success-600',
    error: 'bg-error-500 hover:bg-error-600'
  };

  const handleClick = () => {
    if (state === 'loading' || state === 'disabled') return;
    onClick?.();
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles,
        sizeStyles,
        stateStyles[state],
        className
      )}
      onClick={handleClick}
      disabled={state === 'loading' || state === 'disabled'}
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
};

export { Button };
export default Button;