import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn703s5hkkh7cm8dfq88ydf2y57sk5w4/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
