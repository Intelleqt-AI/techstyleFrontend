import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // shadcn tokens (keep neutrals simple)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // deep navy from globals.css
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },

        // App neutrals
        neutral: {
          0: "#ffffff",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          900: "#111827",
        },

        // Earthy palette tokens
        clay: {
          50: "#FBEAE1",
          100: "#FBE3D9",
          200: "#F1BBAA",
          300: "#F1A88C",
          400: "#E68E71",
          500: "#E07A57",
          600: "#CE6B4E",
          700: "#A14A35",
          800: "#8A4A33",
          900: "#6E3D2A",
          DEFAULT: "#E07A57",
        },
        sage: { 300: "#B9C7B7", 500: "#8FA58F", 700: "#6F8A6F" },
        olive: { 600: "#6E7A58", 700: "#5D684A" },
        ochre: { 300: "#D8A864", 500: "#C78A3B", 700: "#A16F2E" },
        terracotta: { 500: "#C6664C", 600: "#B75A41", 700: "#9F4A33" },
        umber: { 600: "#6A4B3C", 700: "#5B4034" },
        taupe: { 700: "#7D786C" },
        bone: { 50: "#FAF7F2" },
        greige: { 100: "#EFEAE2", 300: "#D9D5CC", 500: "#B6B0A4" },
        slatex: { 500: "#6B7C85", 700: "#4B5960" }, // avoid colliding with Tailwind 'slate'

        // Text + border helpers
        ink: { DEFAULT: "#1F1D1A", muted: "#4E4943", onDark: "#FFFFFF" },
        borderSoft: "#E5E0D8",
        borderStrong: "#C9C3B8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
