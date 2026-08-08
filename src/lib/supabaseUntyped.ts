/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';

/**
 * Accesso a tabelle e viste del marketplace non ancora presenti nei tipi
 * generati di Supabase (marketplace_profili, marketplace_sblocchi, colonne
 * marketplace_* su candidati).
 *
 * I tipi generati si aggiornano solo rigenerando types.ts dopo l'applicazione
 * della migration: fino ad allora il client tipizzato rifiuterebbe questi nomi.
 * Il chiamante è responsabile di tipizzare il risultato (`as MarketplaceProfilo[]`).
 */
export const fromUntyped = (table: string): any => (supabase as any).from(table);
