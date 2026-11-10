import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path in tsconfig.json so feature modules can be tested.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    exclude: ["node_modules/**", ".next/**"],
  },
});
