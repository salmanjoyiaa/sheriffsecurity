import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B1A1A",
          foreground: "#FFFFFF",
          50: "#FDF2F2",
          100: "#FCE7E7",
          200: "#F9D0D0",
          300: "#F4A8A8",
          400: "#EC7171",
          500: "#E03C3C",
          600: "#C52222",
          700: "#8B1A1A",
          800: "#751717",
          900: "#631818",
        },
        secondary: {
          DEFAULT: "#FFD700",
          foreground: "#1A1A1A",
          50: "#FFFEF0",
          100: "#FFFACC",
          200: "#FFF599",
          300: "#FFED5C",
          400: "#FFE333",
          500: "#FFD700",
          600: "#E6B800",
          700: "#CC9900",
          800: "#A37700",
          900: "#7A5500",
        },
        accent: {
          DEFAULT: "#2E7D32",
          foreground: "#FFFFFF",
          50: "#F1F8F1",
          100: "#DCEFDD",
          200: "#BBDFBD",
          300: "#8EC892",
          400: "#5DAE63",
          500: "#3D9142",
          600: "#2E7D32",
          700: "#256329",
          800: "#214F24",
          900: "#1C411F",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
