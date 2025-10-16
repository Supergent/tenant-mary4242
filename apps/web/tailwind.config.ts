import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn703s5hkkh7cm8dfq88ydf2y57sk5w4/design-tokens/tailwind.preset";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
};

export default config;
