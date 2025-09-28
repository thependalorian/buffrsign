
import { cn } from '@/lib/utils';

/**
 * iOS-Style CTA Button Component
 * 
 * Purpose: Call-to-action button with iOS-inspired rounded styling
 * Location: /components/landing/CTAButton.tsx
 * Features: iOS-style rounded corners, smooth animations, touch-friendly sizing
 */

interface CTAButtonProps {
  children: React.ReactNode;
  primary?: boolean;
  className?: string;
  onClick?: () => void;
}

const CTAButton = ({ children, primary = false, className = '', onClick }: CTAButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      // iOS-style base styles with rounded corners and smooth transitions
      'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none select-none active:scale-95',
      // iOS-style sizing with rounded corners
      'h-12 px-8 text-base rounded-2xl', // 48px height, 16px radius for prominent CTAs
      // iOS-style shadows and hover effects
      'shadow-lg hover:shadow-xl active:shadow-md',
      primary 
        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25' 
        : 'bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-border hover:border-primary/50',
      className
    )}
  >
    {children}
  </button>
);

export default CTAButton;
