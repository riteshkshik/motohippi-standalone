import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Inline api-client — no monorepo workspace needed
      "@workspace/api-client-react/custom-fetch": path.resolve(
        __dirname,
        "src/lib/api-client/custom-fetch.ts"
      ),
      "@workspace/api-client-react": path.resolve(
        __dirname,
        "src/lib/api-client/index.ts"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
