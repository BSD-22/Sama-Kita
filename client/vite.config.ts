import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __VITE_GOOGLE_CLIENT_ID__: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
  },
});
