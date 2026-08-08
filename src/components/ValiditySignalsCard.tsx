import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DOMANDE } from '@/data/questionario';
import { RispostaInputV5 } from '@/lib/scoringV5';
import {
  calcolaValiditaEstesa,
  ValiditaEstesa,
  LivelloValidita,
} from '@/lib/validityV5';

const LIVELLO_UI: Record<
  LivelloValidita,
  { label: string; badge: string; icon: typeof ShieldCheck }
> = {
  OK: {
    label: 'Nessun segnale anomalo',
    badge: 'bg-green-100 text-green-800 border-green-300',
    icon: ShieldCheck,
  },
  ATTENZIONE: {
    label: 'Segnali da verificare',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: ShieldAlert,
  },
  CRITICO: {
    label: 'Compilazione sospetta',
    badge: 'bg-red-100 text-red-800 border-red-300',
    icon: ShieldX,
  },
};

interface ValiditySignalsCardProps {
  candidatoId: string;
  /** Segnali salvati al submit (validity_flags); se assenti si calcolano dalle risposte */
  validityFlags?: ValiditaEstesa | null;
}

/**
 * Attendibilità estesa: coerenza intra-tratto, risposte in serie, tempi.
 * Affianca l'indice di attendibilità del manuale (5 domande di controllo).
 * Per i candidati storici, senza validity_flags salvati, ricalcola i segnali
 * dalle risposte (i tempi non sono disponibili retroattivamente).
 */
export function ValiditySignalsCard({ candidatoId, validityFlags }: ValiditySignalsCardProps) {
  const { data: calcolata, isLoading } = useQuery({
    queryKey: ['validita-estesa', candidatoId],
    enabled: !validityFlags,
    queryFn: async (): Promise<ValiditaEstesa> => {
      // select('*') e lettura permissiva: tempo_ms può non esistere ancora
      // nel DB (migration non applicata) e non deve rompere la query.
      const { data, error } = await supabase
        .from('risposte')
        .select('*')
        .eq('candidato_id', candidatoId);
      if (error) throw error;

      type RigaRisposta = {
        domanda_id: number;
        valore: RispostaInputV5['valore'];
        tempo_ms?: number | null;
      };
      const righe = (data ?? []) as RigaRisposta[];

      const risposte: RispostaInputV5[] = righe.map((r) => ({
        domanda_id: r.domanda_id,
        valore: r.valore,
      }));
      const tempi: Record<number, number> = {};
      for (const r of righe) {
        if (typeof r.tempo_ms === 'number' && r.tempo_ms > 0) tempi[r.domanda_id] = r.tempo_ms;
      }
      const domandeV5 = DOMANDE.map((d) => ({
        id: d.id,
        scala_primaria: d.scala_primaria,
        polarita: d.polarita,
      }));
      return calcolaValiditaEstesa(risposte, domandeV5, tempi);
    },
  });

  const validita = validityFlags ?? calcolata;

  const ui = useMemo(() => (validita ? LIVELLO_UI[validita.livello] : null), [validita]);

  if (isLoading || !validita || !ui) return null;

  const Icon = ui.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5 text-primary" />
            Attendibilità estesa
          </CardTitle>
          <Badge variant="outline" className={ui.badge}>
            {ui.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {validita.segnali.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Coerenza fra le risposte, sequenze e ritmo di compilazione rientrano nei parametri di
            una compilazione letta e ragionata.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {validita.segnali.map((s) => (
              <li
                key={s.codice}
                className={`rounded-lg border p-3 ${
                  s.livello === 'CRITICO'
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-amber-200 bg-amber-50/60'
                }`}
              >
                <p className="text-sm font-medium mb-0.5">{s.titolo}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.dettaglio}</p>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground flex gap-2 items-start border-t pt-3">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            Questi controlli affiancano l’indice di attendibilità del manuale (domande di
            controllo) e non modificano i punteggi: indicano quanto fidarsi del profilo.
            {!validita.tempi.disponibile &&
              ' I tempi di risposta non sono disponibili per questa compilazione.'}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

export default ValiditySignalsCard;
