import type { supabase as SupabaseClientInstance } from '@/integrations/supabase/client';

type Client = typeof SupabaseClientInstance;

let pending: Promise<Client> | null = null;

/**
 * Carica il client Supabase su richiesta.
 *
 * Il sito pubblico è prerenderizzato e la maggior parte dei visitatori non è
 * autenticata: importare l'SDK (~170 kB) nel bundle iniziale lo metteva nel
 * modulepreload di ogni pagina, bloccando il percorso critico per niente.
 * Così viene scaricato dopo il primo paint, o solo quando serve davvero.
 */
export function getSupabase(): Promise<Client> {
  pending ??= import('@/integrations/supabase/client').then((m) => m.supabase);
  return pending;
}
