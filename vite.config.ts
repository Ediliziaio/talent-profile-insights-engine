import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Il bundle SSR è monolitico per scelta: lo consuma solo lo script di prerender.
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            manualChunks(id) {
              // Gli helper interni di Vite/Rollup (__vitePreload) non stanno in
              // node_modules: se Rollup li accorpa a un chunk pesante, l'entry si
              // ritrova a importarlo staticamente solo per quelli. Li ancoriamo al
              // vendor React, che serve comunque nel percorso critico.
              if (id.includes("preload-helper") || id.includes("commonjsHelpers")) {
                return "react-vendor";
              }
              if (!id.includes("node_modules")) return;
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
                return "react-vendor";
              }
              if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
                return "motion";
              }
              // @supabase, recharts, jspdf e html2canvas restano allo splitting
              // automatico. Raggruppandoli a mano, Rollup ci assorbiva dentro gli
              // helper condivisi (tslib, __vitePreload) e l'entry finiva per
              // importare staticamente chunk pesanti solo per quelli.
            },
          },
        },
  },
}));
