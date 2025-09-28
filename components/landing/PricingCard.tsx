
import { CheckCircle } from 'lucide-react';
import CTAButton from './CTAButton';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaAction: () => void;
  annualOffer?: string;
  className?: string;
}

const PricingCard = ({ title, price, period, features, popular = false, ctaText, ctaAction, annualOffer, className = '' }: PricingCardProps) => (
  <div className={`bg-card p-8 rounded-2xl shadow-lg relative ${popular ? 'border-2 border-chart-1' : ''} ${className}`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-chart-1 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    {annualOffer && popular && (
      <div className="absolute -top-4 right-0 transform translate-x-1/4 -translate-y-1/2">
        <span className="bg-chart-2 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {annualOffer}
        </span>
      </div>
    )}
    <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-foreground">{price}</span>
      <span className="text-muted-foreground">/{period}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <CheckCircle className="w-5 h-5 text-chart-1 mr-3" />
          <span className="text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
    <CTAButton onClick={ctaAction} primary={popular} className="w-full">
      {ctaText}
    </CTAButton>
  </div>
);

export default PricingCard;
