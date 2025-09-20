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
          // Light theme using our color palette (from UI_UX_STRATEGY.md)
          "primary": "hsl(var(--chart-1))",           // #1E40AF - BuffrBlue
          "primary-content": "hsl(var(--primary-foreground))",
          "secondary": "hsl(var(--chart-4))",         // #7C3AED - BuffrPurple
          "secondary-content": "hsl(var(--primary-foreground))",
          "accent": "hsl(var(--chart-2))",            // #059669 - Success Green
          "accent-content": "hsl(var(--primary-foreground))",
          "neutral": "hsl(var(--muted))",
          "neutral-content": "hsl(var(--muted-foreground))",
          "base-100": "hsl(var(--background))",       // #ffffff - White background
          "base-200": "hsl(var(--muted))",
          "base-300": "hsl(var(--border))",
          "base-content": "hsl(var(--foreground))",   // #0a0a0a - Dark text
          "info": "hsl(var(--chart-4))",              // #7C3AED - AI Purple for Info
          "success": "hsl(var(--chart-2))",           // #059669 - Success Green
          "warning": "hsl(var(--chart-3))",           // #F59E0B - Warning Orange
          "error": "hsl(var(--chart-5))",             // #DC2626 - Error Red
        },
        "buffrsign-dark": {
          // Dark theme using our color palette (from UI_UX_STRATEGY.md)
          "primary": "hsl(var(--primary))",           // Brighter BuffrBlue for dark mode
          "primary-content": "hsl(var(--primary-foreground))",
          "secondary": "hsl(var(--chart-4))",         // Brighter BuffrPurple
          "secondary-content": "hsl(var(--primary-foreground))",
          "accent": "hsl(var(--chart-2))",            // Brighter Success Green
          "accent-content": "hsl(var(--primary-foreground))",
          "neutral": "hsl(var(--muted))",
          "neutral-content": "hsl(var(--muted-foreground))",
          "base-100": "hsl(var(--background))",       // #0a0a0a - Dark background
          "base-200": "hsl(var(--muted))",
          "base-300": "hsl(var(--border))",
          "base-content": "hsl(var(--foreground))",   // #fafafa - Light text
          "info": "hsl(var(--chart-4))",              // Brighter AI Purple for Info
          "success": "hsl(var(--chart-2))",           // Brighter Success Green
          "warning": "hsl(var(--chart-3))",           // Brighter Warning Orange
          "error": "hsl(var(--chart-5))",             // Brighter Error Red
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
