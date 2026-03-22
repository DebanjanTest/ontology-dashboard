/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "var(--bg-main)",
        bgSidebar: "var(--bg-sidebar)",
        bgCard: "var(--bg-card)",
        accentTeal: "var(--accent-teal)",
        accentRed: "var(--accent-red)",
        accentOrange: "var(--accent-orange)",
        accentYellow: "var(--accent-yellow)",
        textPrimary: "var(--text-primary)",
        textMuted: "var(--text-muted)",
        borderLight: "var(--border)",
        alertHighBg: "var(--alert-high-bg)",
        alertHighBorder: "var(--alert-high-border)",
        alertMediumBg: "var(--alert-medium-bg)",
        alertMediumBorder: "var(--alert-medium-border)",
        alertLowBg: "var(--alert-low-bg)",
        alertLowBorder: "var(--alert-low-border)",
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        nav: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Syne', 'sans-serif']
      }
    },
  },
  plugins: [],
}
