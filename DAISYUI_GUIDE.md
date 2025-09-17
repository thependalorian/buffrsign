# 🎨 DaisyUI + BuffrSign Theme Integration Guide

## **Overview**

This guide explains how to use DaisyUI components with our custom BuffrSign color palette. DaisyUI provides pre-built, accessible components that automatically use our brand colors and maintain consistency across the platform.

---

## 🚀 **Installation & Setup**

### **Dependencies Installed**
```bash
npm install daisyui@latest
```

### **Tailwind Configuration**
DaisyUI is configured in `tailwind.config.ts` with our custom BuffrSign themes:
- **`buffrsign`**: Light theme using our color palette
- **`buffrsign-dark`**: Dark theme with adjusted colors for contrast

### **Theme Activation**
The theme is automatically applied via the `data-theme` attribute in the HTML:
```html
<html data-theme="buffrsign">
```

---

## 🎯 **Color Mapping**

### **DaisyUI Semantic Colors → BuffrSign Palette**
```css
/* Primary Actions - Digital Signatures */
--primary: #3b82f6 (BuffrSign Blue)
--primary-content: #fafafa (White text)

/* Secondary Actions - AI Features */
--secondary: #8b5cf6 (AI Purple)
--secondary-content: #fafafa (White text)

/* Accent Actions - Compliance */
--accent: #10b981 (Compliance Green)
--accent-content: #fafafa (White text)

/* Status Colors */
--info: #8b5cf6 (AI Purple)
--success: #10b981 (Compliance Green)
--warning: #f59e0b (Warning Orange)
--error: #ef4444 (Security Red)
```

---

## 🧩 **Component Usage Examples**

### **1. Button Components**

#### **Primary Buttons (Digital Signatures)**
```tsx
// Main actions - signing, uploading, etc.
<button className="btn btn-primary">Start Signing</button>
<button className="btn btn-primary btn-outline">Upload Document</button>
<button className="btn btn-primary btn-ghost">View Details</button>
```

#### **Secondary Buttons (AI Features)**
```tsx
// AI-powered features
<button className="btn btn-secondary">AI Analysis</button>
<button className="btn btn-secondary btn-outline">Smart Detection</button>
<button className="btn btn-secondary btn-ghost">AI Insights</button>
```

#### **Accent Buttons (Compliance)**
```tsx
// Compliance and verification
<button className="btn btn-accent">Verify Compliance</button>
<button className="btn btn-accent btn-outline">Check ETA 2019</button>
<button className="btn btn-accent btn-ghost">Audit Trail</button>
```

#### **Status Buttons**
```tsx
// Different states and alerts
<button className="btn btn-info">Information</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-warning">Warning</button>
<button className="btn btn-error">Error</button>
```

### **2. Card Components**

#### **Basic Document Card**
```tsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Service Agreement</h2>
    <p>Contract between parties for web development services.</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">Sign Now</button>
    </div>
  </div>
</div>
```

#### **Card with Badge**
```tsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <div className="flex items-center justify-between mb-2">
      <h2 className="card-title">Legal Document</h2>
      <div className="badge badge-primary">ETA 2019</div>
    </div>
    <p>Compliant digital signature workflow.</p>
    <div className="card-actions justify-end">
      <button className="btn btn-secondary">AI Analysis</button>
    </div>
  </div>
</div>
```

### **3. Form Components**

#### **Input Fields**
```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">Document Title</span>
  </label>
  <input 
    type="text" 
    placeholder="Enter document title" 
    className="input input-bordered w-full" 
  />
</div>
```

#### **Select Dropdowns**
```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">Document Type</span>
  </label>
  <select className="select select-bordered w-full">
    <option>Select document type</option>
    <option>Contract</option>
    <option>Agreement</option>
    <option>Certificate</option>
  </select>
</div>
```

#### **Checkboxes and Radio Buttons**
```tsx
<div className="form-control">
  <label className="label cursor-pointer">
    <span className="label-text">Enable AI Analysis</span>
    <input type="checkbox" className="checkbox checkbox-primary" />
  </label>
</div>

<div className="form-control">
  <label className="label cursor-pointer">
    <span className="label-text">Compliance Check</span>
    <input type="radio" name="compliance" className="radio radio-primary" />
  </label>
</div>
```

### **4. Alert Components**

#### **Success Alert (Compliance)**
```tsx
<div className="alert alert-success">
  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>Document compliance verified. ETA 2019 requirements met.</span>
</div>
```

#### **Info Alert (AI Features)**
```tsx
<div className="alert alert-info">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
  <span>AI analysis completed. 3 signature fields detected.</span>
</div>
```

#### **Warning Alert (Security)**
```tsx
<div className="alert alert-warning">
  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
  <span>Document contains sensitive information. Review before sharing.</span>
</div>
```

### **5. Modal Components**

#### **Document Upload Success Modal**
```tsx
<div className="modal modal-open">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Document Upload Success!</h3>
    <p className="py-4">Your document has been successfully uploaded and is ready for AI analysis.</p>
    <div className="modal-action">
      <button className="btn btn-primary" onClick={() => setModalOpen(false)}>
        Continue
      </button>
    </div>
  </div>
  <div className="modal-backdrop" onClick={() => setModalOpen(false)}></div>
</div>
```

---

## 🎨 **Custom Styling with Our Palette**

### **Using CSS Variables**
```css
.custom-component {
  background-color: hsl(var(--chart-1));      /* BuffrSign Blue */
  color: hsl(var(--primary-foreground));      /* White text */
  border-color: hsl(var(--chart-4));          /* AI Purple */
}
```

### **Using Tailwind Classes**
```tsx
// Our custom utility classes
<div className="bg-signature text-white">Digital Signature</div>
<div className="bg-compliance text-white">Compliance Status</div>
<div className="bg-ai text-white">AI Feature</div>
<div className="bg-security text-white">Security Alert</div>
```

### **Gradient Effects**
```tsx
// Brand gradient
<h1 className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
  BuffrSign Platform
</h1>

// Feature-specific gradients
<div className="bg-gradient-to-r from-chart-1 to-chart-2 text-white">
  Digital Signatures + Compliance
</div>
```

---

## 🌙 **Theme Switching**

### **Manual Theme Toggle**
```tsx
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'buffrsign' ? 'buffrsign-dark' : 'buffrsign';
  document.documentElement.setAttribute('data-theme', newTheme);
};

<button className="btn btn-primary" onClick={toggleTheme}>
  Toggle Theme
</button>
```

### **System Theme Detection**
```tsx
// Automatically detect system preference
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = mediaQuery.matches ? 'buffrsign-dark' : 'buffrsign';
  document.documentElement.setAttribute('data-theme', theme);
}, []);
```

---

## 📱 **Responsive Design**

### **Mobile-First Approach**
```tsx
// Responsive button sizes
<button className="btn btn-primary btn-sm md:btn-md lg:btn-lg">
  Sign Document
</button>

// Responsive card layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards will stack on mobile, 2 columns on tablet, 3 on desktop */}
</div>
```

### **Touch-Friendly Components**
```tsx
// Ensure buttons are large enough for touch
<button className="btn btn-primary min-h-[44px] min-w-[44px]">
  Touch Target
</button>
```

---

## ♿ **Accessibility Features**

### **Built-in Accessibility**
- **ARIA labels** automatically applied
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** for modals and forms
- **Color contrast** meets WCAG AA standards

### **Custom Accessibility Enhancements**
```tsx
// Add descriptive labels
<button 
  className="btn btn-primary" 
  aria-label="Start digital signature process for uploaded document"
>
  Start Signing
</button>

// Provide loading states
<button className="btn btn-primary btn-loading" disabled>
  Processing...
</button>
```

---

## 🔧 **Advanced Customization**

### **Component Variants**
```tsx
// Custom button variants
<button className="btn btn-primary btn-wide">Wide Button</button>
<button className="btn btn-primary btn-block">Full Width</button>
<button className="btn btn-primary btn-circle">+</button>
```

### **State Modifiers**
```tsx
// Different button states
<button className="btn btn-primary" disabled>Disabled</button>
<button className="btn btn-primary btn-loading">Loading</button>
<button className="btn btn-primary btn-active">Active</button>
```

### **Size Variants**
```tsx
// Button sizes
<button className="btn btn-primary btn-xs">Extra Small</button>
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary">Normal</button>
<button className="btn btn-primary btn-lg">Large</button>
```

---

## 📚 **Best Practices**

### **1. Consistent Usage**
- Use `btn-primary` for main actions (signing, uploading)
- Use `btn-secondary` for AI features
- Use `btn-accent` for compliance actions
- Use status colors for their intended purposes

### **2. Component Hierarchy**
- Primary buttons for main CTAs
- Secondary buttons for supporting actions
- Outline buttons for less prominent actions
- Ghost buttons for subtle interactions

### **3. Color Semantics**
- **Blue (Primary)**: Digital signature actions
- **Purple (Secondary)**: AI-powered features
- **Green (Accent)**: Compliance and success
- **Orange (Warning)**: Warnings and notifications
- **Red (Error)**: Errors and security alerts

### **4. Responsive Design**
- Test on mobile devices
- Ensure touch targets are adequate
- Use responsive breakpoints consistently
- Maintain readability across screen sizes

---

## 🚀 **Getting Started**

### **1. View the Showcase**
Import and use the `DaisyUIShowcase` component to see all available components:
```tsx
import { DaisyUIShowcase } from "@/components/daisyui-showcase";

// Add to your page
<DaisyUIShowcase />
```

### **2. Start with Basic Components**
Begin with buttons, cards, and forms to get familiar with the system.

### **3. Customize as Needed**
Use our color palette and utility classes to extend DaisyUI components.

### **4. Test Accessibility**
Ensure all components meet accessibility standards for your users.

---

## 📖 **Resources**

- **DaisyUI Documentation**: [https://daisyui.com/](https://daisyui.com/)
- **Component Examples**: See `components/daisyui-showcase.tsx`
- **Color Palette**: See `COLOR_PALETTE.md`
- **Tailwind CSS**: [https://tailwindcss.com/](https://tailwindcss.com/)

---

**Last Updated**: January 30, 2025  
**Version**: 1.0  
**Maintained By**: BuffrSign Development Team  

*This guide ensures consistent, accessible, and professional component usage across the BuffrSign platform.* 🎨✨
