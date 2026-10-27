import {defineConfig} from "vitest/config";

// Test delle regole Firestore: richiedono l'emulatore (npm run test:rules)
export default defineConfig({
  test: {
    include: ["src/**/*.rules.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20000,
  },
});
