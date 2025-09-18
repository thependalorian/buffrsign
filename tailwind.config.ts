import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // DaisyUI semantic colors mapped to our palette
        success: "hsl(var(--chart-2))",      // Green for compliance/success
        warning: "hsl(var(--chart-3))",      // Orange for warnings
        error: "hsl(var(--chart-5))",        // Red for errors/security
        info: "hsl(var(--chart-4))",         // Purple for AI/info
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        buffrsign: {
          // Light theme using our color palette
          "primary": "hsl(var(--chart-1))",           // #3b82f6 - BuffrSign Blue
          "primary-content": "hsl(var(--primary-foreground))",
          "secondary": "hsl(var(--chart-4))",         // #8b5cf6 - AI Purple
          "secondary-content": "hsl(var(--primary-foreground))",
          "accent": "hsl(var(--chart-2))",            // #10b981 - Compliance Green
          "accent-content": "hsl(var(--primary-foreground))",
          "neutral": "hsl(var(--muted))",
          "neutral-content": "hsl(var(--muted-foreground))",
          "base-100": "hsl(var(--background))",       // #ffffff - White background
          "base-200": "hsl(var(--muted))",            // #f5f5f5 - Light gray
          "base-300": "hsl(var(--border))",           // #e5e7eb - Border color
          "base-content": "hsl(var(--foreground))",   // #0a0a0a - Dark text
          "info": "hsl(var(--chart-4))",              // #8b5cf6 - AI Purple
          "success": "hsl(var(--chart-2))",           // #10b981 - Compliance Green
          "warning": "hsl(var(--chart-3))",           // #f59e0b - Warning Orange
          "error": "hsl(var(--chart-5))",             // #ef4444 - Security Red
        },
        "buffrsign-dark": {
          // Dark theme using our color palette
          "primary": "hsl(var(--primary))",           // Brighter blue for dark mode
          "primary-content": "hsl(var(--primary-foreground))",
          "secondary": "hsl(var(--chart-4))",         // #8b5cf6 - AI Purple
          "secondary-content": "hsl(var(--primary-foreground))",
          "accent": "hsl(var(--chart-2))",            // #10b981 - Compliance Green
          "accent-content": "hsl(var(--primary-foreground))",
          "neutral": "hsl(var(--muted))",
          "neutral-content": "hsl(var(--muted-foreground))",
          "base-100": "hsl(var(--background))",       // #0a0a0a - Dark background
          "base-200": "hsl(var(--muted))",            // #262626 - Dark gray
          "base-300": "hsl(var(--border))",           // #262626 - Dark border
          "base-content": "hsl(var(--foreground))",   // #fafafa - Light text
          "info": "hsl(var(--chart-4))",              // #8b5cf6 - AI Purple
          "success": "hsl(var(--chart-2))",           // #10b981 - Compliance Green
          "warning": "hsl(var(--chart-3))",           // #f59e0b - Warning Orange
          "error": "hsl(var(--chart-5))",             // #ef4444 - Security Red
        }
      }
    ],
    darkTheme: "buffrsign-dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
} satisfies Config;
