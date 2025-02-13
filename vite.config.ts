import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://ia.tnx1.xyz",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
