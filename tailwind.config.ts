import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        primaryForeground: "var(--primary-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        obsidian: {
          50: '#f6f7f9',
          100: '#ecedf1',
          200: '#d5d9e1',
          300: '#b1b9c9',
          400: '#8693aa',
          500: '#64748b',
          600: '#525e75',
          700: '#434d5f',
          800: '#384150',
          900: '#323743',
          950: '#09090b',
        },
        sapphire: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        }
      },
      boxShadow: {
        'soft': '0 4px 40px -2px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 10px rgba(0,0,0,0.02)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      backgroundImage: {
        'noise': "url('/noise.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
  darkMode: "class",
};
export default config;
