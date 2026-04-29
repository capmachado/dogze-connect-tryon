import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { dogze: { bg: "#1a1a1a", panel: "#202020", soft: "#2a2a2a", orange: "#C85A0E", orange2: "#D87521", text: "#FFFFFF", muted: "#B9B9B9" } },
      fontFamily: { display: ["Arial Narrow", "Roboto Condensed", "Oswald", "Arial", "sans-serif"], sans: ["Inter", "Arial", "sans-serif"] },
      boxShadow: { glow: "0 0 0 1px rgba(200,90,14,.35), 0 18px 50px rgba(0,0,0,.35)" }
    }
  },
  plugins: []
};
export default config;
