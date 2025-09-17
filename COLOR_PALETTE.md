# 🎨 BuffrSign Color Palette Guide

## **Brand Color System**

This document defines the official color palette for the BuffrSign digital signature platform. All components, pages, and design elements must use these colors consistently to maintain brand identity and visual harmony.

---

## 🌈 **Primary Color Palette**

### **Core Brand Colors**
```css
/* Primary Blue - Main brand color */
--primary: 220 70% 50%        /* #3b82f6 - Primary buttons, links, highlights */
--primary-foreground: 0 0% 98% /* #fafafa - Text on primary backgrounds */

/* Secondary Colors */
--secondary: 0 0% 96.1%       /* #f5f5f5 - Secondary backgrounds, cards */
--secondary-foreground: 0 0% 9% /* #171717 - Text on secondary backgrounds */

/* Accent Colors */
--accent: 0 0% 96.1%          /* #f5f5f5 - Accent backgrounds, hover states */
--accent-foreground: 0 0% 9%  /* #171717 - Text on accent backgrounds */
```

### **Chart Color System (Feature-Specific)**
```css
/* Chart-1: Primary Blue (Digital Signatures) */
--chart-1: 220 70% 50%        /* #3b82f6 - Primary actions, main features */

/* Chart-2: Success Green (Compliance) */
--chart-2: 160 60% 45%        /* #10b981 - Success states, compliance badges */

/* Chart-3: Warning Orange (Alerts) */
--chart-3: 30 80% 55%         /* #f59e0b - Warnings, notifications */

/* Chart-4: Purple (AI Features) */
--chart-4: 280 65% 60%        /* #8b5cf6 - AI-powered features, intelligence */

/* Chart-5: Red (Security) */
--chart-5: 340 75% 55%        /* #ef4444 - Security alerts, destructive actions */
```

---

## 🎯 **Usage Guidelines**

### **1. Primary Actions & CTAs**
- **Main Buttons**: Use `--primary` (#3b82f6) for primary actions
- **Hover States**: Use `--primary/90` (90% opacity) for hover effects
- **Text on Primary**: Use `--primary-foreground` (#fafafa) for contrast

```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Start Signing Free
</Button>
```

### **2. Feature Categories**
- **Digital Signatures**: `--chart-1` (Blue) - Core functionality
- **Compliance**: `--chart-2` (Green) - ETA 2019, CRAN, legal features
- **AI Features**: `--chart-4` (Purple) - Intelligence, automation
- **Security**: `--chart-5` (Red) - Authentication, encryption
- **Notifications**: `--chart-3` (Orange) - Alerts, warnings

### **3. Background Hierarchy**
```css
/* Main Background */
--background: 0 0% 100%        /* #ffffff - Page backgrounds */

/* Card Backgrounds */
--card: 0 0% 100%              /* #ffffff - Card, modal backgrounds */

/* Muted Backgrounds */
--muted: 0 0% 96.1%            /* #f5f5f5 - Subtle backgrounds, borders */
--muted-foreground: 0 0% 45.1% /* #737373 - Secondary text */
```

---

## 🎨 **Component Color Mapping**

### **Navigation & Header**
```tsx
// Logo and brand elements
<Link className="text-primary">BuffrSign</Link>

// CRAN Ready badge
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
  CRAN Ready
</span>

// Navigation links
<Link className="text-muted-foreground hover:text-foreground">
  Features
</Link>
```

### **Hero Section**
```tsx
// AI Badge
<div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
  Powered by Advanced AI
</div>

// Main headline gradient
<h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
  Minutes, Not Days
</h1>

// Trust indicators
<div className="text-green-500">ETA 2019 Compliant</div>
<div className="text-blue-500">10,000+ Users</div>
<div className="text-orange-500">2-Minute Setup</div>
```

### **Feature Cards**
```tsx
// Card borders and hover effects
<Card className="border-2 hover:border-primary/50 hover:shadow-xl">

// Feature icons with gradient backgrounds
<div className="bg-gradient-to-r from-blue-100 to-indigo-100">
  <Brain className="text-blue-600" />
</div>

// Feature links
<Link className="text-primary hover:text-primary/80">
  Learn more
</Link>
```

### **Call-to-Action Section**
```tsx
// CTA background gradient
<section className="bg-gradient-to-r from-primary to-purple-600">

// White button on gradient background
<Button className="bg-white text-primary hover:bg-white/90">
  Start Free Trial
</Button>

// Outline button
<Button className="border-white text-white hover:bg-white hover:text-primary">
  Schedule Demo
</Button>
```

---

## 🌙 **Dark Mode Colors**

### **Dark Theme Adaptations**
```css
.dark {
  --background: 0 0% 3.9%      /* #0a0a0a - Dark backgrounds */
  --foreground: 0 0% 98%       /* #fafafa - Light text */
  --card: 0 0% 3.9%            /* #0a0a0a - Dark cards */
  --primary: 0 0% 98%          /* #fafafa - Light primary */
  --muted: 0 0% 14.9%          /* #262626 - Dark muted backgrounds */
}
```

### **Dark Mode Considerations**
- **Contrast**: Ensure sufficient contrast ratios (WCAG AA compliant)
- **Accessibility**: Test color combinations for colorblind users
- **Consistency**: Maintain the same color meanings across themes

---

## 📱 **Responsive Color Usage**

### **Mobile Considerations**
```css
/* Ensure colors work well on small screens */
@media (max-width: 768px) {
  /* Adjust opacity for better mobile visibility */
  .glass-effect {
    @apply bg-white/90; /* Increase opacity on mobile */
  }
}
```

### **High DPI Displays**
```css
/* Ensure colors render crisply on retina displays */
@media (-webkit-min-device-pixel-ratio: 2) {
  /* Use solid colors where possible */
  .gradient-text {
    -webkit-font-smoothing: antialiased;
  }
}
```

---

## 🔧 **Implementation Examples**

### **CSS Variables Usage**
```css
/* Define custom colors using the palette */
.custom-button {
  background-color: hsl(var(--chart-1));
  color: hsl(var(--primary-foreground));
}

.custom-card {
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
}
```

### **Tailwind Classes**
```tsx
// Use semantic color classes
<div className="bg-primary text-primary-foreground">
  Primary content
</div>

<div className="bg-chart-2 text-white">
  Success message
</div>

<div className="bg-chart-4 text-white">
  AI feature highlight
</div>
```

---

## ✅ **Color Compliance Checklist**

- [ ] **Primary actions** use `--primary` (#3b82f6)
- [ ] **Success states** use `--chart-2` (#10b981)
- [ ] **Warning states** use `--chart-3` (#f59e0b)
- [ ] **AI features** use `--chart-4` (#8b5cf6)
- [ ] **Security alerts** use `--chart-5` (#ef4444)
- [ ] **Text contrast** meets WCAG AA standards
- [ ] **Dark mode** colors maintain brand consistency
- [ ] **Hover states** use appropriate opacity variations
- [ ] **Gradients** use approved color combinations
- [ ] **Accessibility** considered for colorblind users

---

## 🚫 **Color Usage Restrictions**

### **Avoid These Combinations**
- ❌ **Red on Green**: Poor contrast and accessibility
- ❌ **Blue on Purple**: Similar hues, poor distinction
- ❌ **Yellow on White**: Insufficient contrast
- ❌ **Multiple Bright Colors**: Can be overwhelming

### **Recommended Alternatives**
- ✅ **Blue on White**: High contrast, professional
- ✅ **Green on White**: Clear success indication
- ✅ **Purple on Light Gray**: Subtle AI feature highlighting
- ✅ **Orange on Dark**: Clear warning visibility

---

## 📚 **Resources & References**

- **Color Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **WCAG Guidelines**: [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **Brand Guidelines**: Internal BuffrSign brand documentation
- **Design System**: Component library and design tokens

---

**Last Updated**: January 30, 2025  
**Version**: 1.0  
**Maintained By**: BuffrSign Design Team  

*This color palette ensures consistent, professional, and accessible design across all BuffrSign platform components.* 🎨✨
