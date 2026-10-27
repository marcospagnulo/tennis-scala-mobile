import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // i test delle regole richiedono l'emulatore: npm run test:rules
    exclude: ["**/node_modules/**", "**/*.rules.test.ts"],
  },
});
