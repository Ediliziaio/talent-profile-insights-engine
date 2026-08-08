import { useMemo } from 'react';
import { HardHat, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TraitCode, ReliabilityIndex } from '@/types/database';
import { calcolaSafetyIndex, FasciaSicurezza } from '@/lib/safetyIndexV5';

const FASCIA_STYLE: Record<FasciaSicurezza, { badge: string; bar: string }> = {
  AFFIDABILE: { badge: 'bg-green-100 text-green-800 border-green-300', bar: 'bg-green-500' },
  ADEGUATO: { badge: 'bg-blue-100 text-blue-800 border-blue-300', bar: 'bg-blue-500' },
  ATTENZIONE: { badge: 'bg-amber-100 text-amber-800 border-amber-300', bar: 'bg-amber-500' },
  CRITICO: { badge: 'bg-red-100 text-red-800 border-red-300', bar: 'bg-red-500' },
};

interface SafetyIndexCardProps {
  traits: Partial<Record<TraitCode, number>>;
  reliabilityIndex?: ReliabilityIndex | null;
}

/**
 * Indice di Propensione alla Sicurezza — derivato dai tratti V5, calcolato
 * interamente lato client: nessun dato aggiuntivo richiesto al DB.
 */
export function SafetyIndexCard({ traits, reliabilityIndex }: SafetyIndexCardProps) {
  const ips = useMemo(
    () => calcolaSafetyIndex(traits, reliabilityIndex),
    [traits, reliabilityIndex]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardHat className="h-5 w-5 text-primary" />
            Indice di Propensione alla Sicurezza
          </CardTitle>
          {ips.fascia ? (
            <Badge variant="outline" className={FASCIA_STYLE[ips.fascia].badge}>
              {ips.label} — {ips.indice}/100
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {ips.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {ips.indice !== null && ips.fascia && (
          <div
            className="h-2.5 rounded-full bg-muted overflow-hidden"
            role="meter"
            aria-valuenow={ips.indice}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Indice di propensione alla sicurezza"
          >
            <div
              className={`h-full rounded-full ${FASCIA_STYLE[ips.fascia].bar} transition-all`}
              style={{ width: `${ips.indice}%` }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">{ips.descrizione}</p>

        {ips.indice !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ips.fattori.map((f) => (
              <div key={f.trait} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.valore}/100</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.testo}</p>
              </div>
            ))}
          </div>
        )}

        {ips.penalitaInterazione > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
            Autodisciplina e tenuta alla pressione sono entrambe basse: la combinazione pesa più
            della somma (−{ips.penalitaInterazione} punti). È il profilo che lavora bene in
            condizioni normali e taglia i passaggi quando il cantiere è in ritardo.
          </p>
        )}

        {ips.leve.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Cosa fare in pratica</h4>
            <ul className="space-y-1.5">
              {ips.leve.map((l) => (
                <li key={l} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground flex gap-2 items-start border-t pt-3">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{ips.disclaimer}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export default SafetyIndexCard;
