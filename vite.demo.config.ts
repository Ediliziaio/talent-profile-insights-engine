import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Modalità demo LOCALE (`npm run dev:demo`).
 *
 * Sostituisce il client Supabase con un mock a dati finti, così si possono
 * vedere e rifinire le schermate dell'area riservata senza credenziali.
 * È un file di configurazione separato: non tocca `vite.config.ts` e non
 * può finire nel bundle di produzione.
 */
export default defineConfig({
  server: { host: "::", port: 8299, strictPort: true },
  plugins: [react()],
  resolve: {
    alias: [
      // L'alias del mock va PRIMA di "@": Vite valuta in ordine.
      {
        find: /^@\/integrations\/supabase\/client$/,
        replacement: path.resolve(__dirname, "./src/mocks/supabaseDemo.ts"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
