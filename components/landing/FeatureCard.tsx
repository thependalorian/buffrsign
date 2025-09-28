
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  visual?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  visual, 
  color = 'primary',
  className 
}: FeatureCardProps) => {
  const colorStyles = {
    primary: 'bg-chart-1/10 text-chart-1',
    secondary: 'bg-chart-4/10 text-chart-4',
    accent: 'bg-chart-2/10 text-chart-2',
    success: 'bg-chart-2/10 text-chart-2',
    warning: 'bg-chart-3/10 text-chart-3',
    error: 'bg-chart-5/10 text-chart-5'
  };

  return (
    <div className={cn(
      'feature-card p-8 rounded-2xl flex flex-col',
      className
    )}>
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
        colorStyles[color]
      )}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed flex-grow">{description}</p>
      {visual && <div className="mt-6">{visual}</div>}
    </div>
  );
};

export default FeatureCard;
