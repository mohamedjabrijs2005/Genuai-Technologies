/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "surface-bright": "#F1F5F9",
        "surface-container": "#E2E8F0",
        "surface-container-lowest": "#FFFFFF",
        "on-background": "#0F172A",
        "on-surface": "#1E293B",
        "on-surface-variant": "#475569",
        
        "accent-gold": "#D4AF37",
        "indigo-brand": "#667EEA",
        "indigo-brand-dark": "#4C51BF",
        "on-tertiary": "#FFFFFF",
        
        "primary": "#3B82F6",
        "primary-container": "#EFF6FF",
        "on-primary": "#FFFFFF",
        
        "success-emerald": "#10B981",
        "warning-amber": "#F59E0B",
        "error-crimson": "#EF4444",
        
        "info": "#3B82F6",
        "info-dark": "#2563EB",
        "success": "#10B981",
        "success-dark": "#059669",
        "warning": "#F59E0B",
        "warning-dark": "#D97706",
        "error": "#EF4444",
        "error-dark": "#DC2626",
      },
      borderRadius: {
        "xxl": "1.5rem",
      },
      spacing: {
        "xs": "4px",
        "sm": "12px",
        "md": "20px",
        "lg": "32px",
        "xl": "48px",
        "xxl": "96px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
      },
      fontFamily: {
        "headline-md": ["Montserrat", "sans-serif"],
        "headline-sm": ["Montserrat", "sans-serif"],
        "display-lg": ["Montserrat", "sans-serif"],
        "display-lg-mobile": ["Montserrat", "sans-serif"],
        "body-base": ["Inter", "sans-serif"],
        "body-bold": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.15em", fontWeight: "800" }],
        "body-base": ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        "body-bold": ["16px", { lineHeight: "1.7", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "800" }],
        "display-lg-mobile": ["40px", { lineHeight: "1.1", fontWeight: "900" }],
        "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "900" }],
      }
    },
  },
  plugins: [],
}
