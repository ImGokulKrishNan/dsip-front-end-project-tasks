import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    plugins: [react()],

    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React
            react: ["react", "react-dom", "react-router-dom"],
            // Data fetching
            query: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
            // All Radix UI primitives (dialog, dropdown, select, etc.)
            radix: [
              "@radix-ui/react-checkbox",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-label",
              "@radix-ui/react-scroll-area",
              "@radix-ui/react-select",
              "@radix-ui/react-separator",
              "@radix-ui/react-slider",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-toast",
              "@radix-ui/react-tooltip",
            ],
            // Icons (lucide can be large if many icons are used)
            icons: ["lucide-react"],
            // Small styling/utils libs
            utils: ["class-variance-authority", "clsx", "tailwind-merge"],
          },
        },
      },
      chunkSizeWarningLimit: 400,
    },
  };
});
