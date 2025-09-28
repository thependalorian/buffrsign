# BuffrSign Styling Consistency Guide

## Overview
This guide ensures consistent implementation of the BuffrSign design system across all components and pages.

## Design System Architecture

### 1. CSS Custom Properties (globals.css)
All colors and design tokens are defined as CSS custom properties in `app/globals.css`:

```css
:root {
  /* Primary Brand Colors */
  --primary: 225 69% 40%;        /* #1E40AF - BuffrBlue */
  --secondary: 265 82% 61%;      /* #7C3AED - BuffrPurple */
  --accent: 243 75% 58%;         /* #4F46E5 - BuffrIndigo */
  
  /* Semantic Colors */
  --chart-1: 225 69% 40%;        /* BuffrBlue (Primary, Legal) */
  --chart-2: 160 90% 30%;        /* Success Green (Compliance) */
  --chart-3: 35 92% 53%;         /* Warning Orange */
  --chart-4: 265 82% 61%;        /* BuffrPurple (AI, Info) */
  --chart-5: 0 72% 51%;          /* Error Red (Security) */
}
```

### 2. Tailwind Configuration
The `tailwind.config.ts` maps these CSS variables to Tailwind classes:

```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  chart: {
    "1": "hsl(var(--chart-1))",  // BuffrBlue
    "2": "hsl(var(--chart-2))",  // Success Green
    "3": "hsl(var(--chart-3))",  // Warning Orange
    "4": "hsl(var(--chart-4))",  // BuffrPurple
    "5": "hsl(var(--chart-5))",  // Error Red
  }
}
```

### 3. DaisyUI Integration
DaisyUI themes are configured to use our design system:

```typescript
themes: [
  {
    buffrsign: {
      "primary": "hsl(var(--chart-1))",     // BuffrBlue
      "secondary": "hsl(var(--chart-4))",   // BuffrPurple
      "accent": "hsl(var(--chart-2))",      // Success Green
      "info": "hsl(var(--chart-4))",        // AI Purple
      "success": "hsl(var(--chart-2))",     // Success Green
      "warning": "hsl(var(--chart-3))",     // Warning Orange
      "error": "hsl(var(--chart-5))",       // Error Red
    }
  }
]
```

## Component Styling Standards

### 1. Button Components
**✅ Correct Implementation:**
```tsx
// Use design system colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>

// Use semantic colors for specific states
<button className="bg-chart-2 text-white hover:bg-chart-2/90">
  Success Button
</button>
```

**❌ Avoid:**
```tsx
// Hardcoded colors
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Hardcoded Button
</button>
```

### 2. Card Components
**✅ Correct Implementation:**
```tsx
// Use design system classes
<div className="document-card p-6">
  <h3 className="text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

**❌ Avoid:**
```tsx
// Hardcoded colors and inconsistent naming
<div className="bg-white dark:bg-gray-800 p-6">
  <h3 className="text-gray-900 dark:text-white">Title</h3>
</div>
```

### 3. Feature Cards
**✅ Correct Implementation:**
```tsx
const FeatureCard = ({ icon, title, description, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-chart-1/10 text-chart-1',
    secondary: 'bg-chart-4/10 text-chart-4',
    success: 'bg-chart-2/10 text-chart-2',
    warning: 'bg-chart-3/10 text-chart-3',
    error: 'bg-chart-5/10 text-chart-5'
  };

  return (
    <div className="feature-card p-8 rounded-2xl">
      <div className={`w-16 h-16 ${colorStyles[color]} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};
```

## Color Usage Guidelines

### Primary Colors
- **chart-1 (BuffrBlue)**: Primary actions, legal features, main branding
- **chart-4 (BuffrPurple)**: Secondary actions, AI features, info states
- **chart-2 (Success Green)**: Success states, compliance indicators, positive actions
- **chart-3 (Warning Orange)**: Warning states, attention-grabbing elements
- **chart-5 (Error Red)**: Error states, security features, destructive actions

### Semantic Usage
```tsx
// Legal/Compliance features
<div className="bg-chart-1/10 text-chart-1">ETA 2019 Compliant</div>

// AI features
<div className="bg-chart-4/10 text-chart-4">AI Analysis</div>

// Success states
<div className="bg-chart-2/10 text-chart-2">Document Signed</div>

// Warning states
<div className="bg-chart-3/10 text-chart-3">Review Required</div>

// Error states
<div className="bg-chart-5/10 text-chart-5">Security Alert</div>
```

## CSS Classes Reference

### Pre-defined Component Classes
```css
/* From globals.css */
.signature-button { @apply bg-primary text-primary-foreground hover:bg-primary/90; }
.compliance-badge { @apply bg-chart-2/10 text-chart-2 border-chart-2/20; }
.warning-badge { @apply bg-chart-3/10 text-chart-3 border-chart-3/20; }
.ai-badge { @apply bg-chart-4/10 text-chart-4 border-chart-4/20; }
.security-badge { @apply bg-chart-5/10 text-chart-5 border-chart-5/20; }
.document-card { @apply bg-card text-card-foreground border border-border rounded-lg shadow-sm; }
.feature-card { @apply bg-card text-card-foreground border-2 border-border hover:border-primary/50; }
```

### Utility Classes
```css
/* Text colors */
.text-signature { @apply text-chart-1; }
.text-compliance { @apply text-chart-2; }
.text-warning { @apply text-chart-3; }
.text-ai { @apply text-chart-4; }
.text-security { @apply text-chart-5; }

/* Background colors */
.bg-signature { @apply bg-chart-1; }
.bg-compliance { @apply bg-chart-2; }
.bg-warning { @apply bg-chart-3; }
.bg-ai { @apply bg-chart-4; }
.bg-security { @apply bg-chart-5; }
```

## Dark Mode Support

All components automatically support dark mode through CSS custom properties:

```css
.dark {
  --primary: 225 69% 50%;        /* Brighter for dark mode */
  --background: 0 0% 3.9%;       /* Dark background */
  --foreground: 0 0% 98%;        /* Light text */
}
```

## Accessibility Considerations

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --foreground: 0 0% 0%;
    --background: 0 0% 100%;
    --primary: 220 100% 50%;
  }
}
```

### Focus States
All interactive elements include proper focus states:
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

## Implementation Checklist

### For New Components:
- [ ] Use CSS custom properties from `globals.css`
- [ ] Follow semantic color mapping (chart-1 through chart-5)
- [ ] Include proper focus states for accessibility
- [ ] Support dark mode automatically
- [ ] Use `cn()` utility for conditional classes
- [ ] Follow naming conventions (kebab-case for CSS classes)

### For Existing Components:
- [ ] Replace hardcoded colors with design system colors
- [ ] Use semantic color classes (text-foreground, text-muted-foreground)
- [ ] Ensure consistent spacing using design tokens
- [ ] Test in both light and dark modes
- [ ] Verify accessibility with screen readers

## Common Patterns

### 1. Status Indicators
```tsx
const StatusIndicator = ({ status }) => {
  const statusStyles = {
    active: 'bg-chart-2/10 text-chart-2',
    pending: 'bg-chart-3/10 text-chart-3',
    error: 'bg-chart-5/10 text-chart-5',
    info: 'bg-chart-4/10 text-chart-4'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
```

### 2. Interactive Cards
```tsx
const InteractiveCard = ({ children, onClick }) => (
  <div 
    className="document-card cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
    onClick={onClick}
  >
    {children}
  </div>
);
```

### 3. Form Elements
```tsx
const FormInput = ({ error, ...props }) => (
  <input
    className={`form-input ${error ? 'border-chart-5 focus:ring-chart-5' : ''}`}
    {...props}
  />
);
```

## Testing Guidelines

### Visual Testing
1. Test all components in light mode
2. Test all components in dark mode
3. Test with high contrast mode enabled
4. Verify color contrast ratios meet WCAG standards

### Component Testing
1. Test hover states
2. Test focus states
3. Test disabled states
4. Test loading states

## Maintenance

### Regular Audits
- Review new components for design system compliance
- Check for hardcoded colors in pull requests
- Update this guide when adding new design tokens
- Test color accessibility with tools like WebAIM

### Updates
When updating the design system:
1. Update CSS custom properties in `globals.css`
2. Update Tailwind configuration
3. Update DaisyUI theme configuration
4. Update this documentation
5. Test all existing components

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintainer**: BuffrSign Development Team
