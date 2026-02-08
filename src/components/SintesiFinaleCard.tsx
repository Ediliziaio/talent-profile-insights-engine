/**
 * SintesiFinaleCard - Sintesi Finale del Profilo Candidato
 * 
 * Genera automaticamente una sintesi completa come nei report manuali:
 * - Dati anagrafici
 * - Profilo sintetico con punteggi chiave
 * - Punti di forza (eccellenze >160)
 * - Aree di attenzione (<80)
 * - Raccomandazione operativa condizionale
 * - Prossimi passi suggeriti
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  User, CheckCircle2, AlertTriangle, Target, 
  TrendingUp, TrendingDown, Lightbulb, ArrowRight,
  Clock, Shield, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfiloTipo, SCALE_LABELS } from '@/types/database';
import { getProfiloDetailedDescription } from '@/lib/profiloDetailedDescriptions';
import { getVerdictLabelV5, FitVerdictV5, ROLE_PROFILES_V5 } from '@/lib/roleMatchingV5';
import { calculateAllRolesCompatibilityV5Cached } from '@/lib/roleMatchingV5Cache';
import { TraitScores } from '@/lib/syndromes';

interface SintesiFinaleCardProps {
  candidatoNome: string;
  candidatoCognome: string;
  eta?: number | null;
  ruoloRichiesto: string;
  profiloTipo: ProfiloTipo | null;
  scalePunteggi: Record<string, number>;
  stressZone?: boolean;
  className?: string;
}

/**
 * Genera la sintesi testuale del profilo
 */
function generaSintesiTestuale(
  nome: string,
  cognome: string,
  eta: number | null | undefined,
  ruolo: string,
  profiloTipo: ProfiloTipo | null,
  scalePunteggi: Record<string, number>
): string {
  const profiloInfo = profiloTipo ? getProfiloDetailedDescription(profiloTipo) : null;
  const profiloLabel = profiloInfo?.titolo || 'Profilo in valutazione';
  
  // Identifica eccellenze e debolezze
  const eccellenze: string[] = [];
  const debolezze: string[] = [];
  
  Object.entries(scalePunteggi).forEach(([scala, valore]) => {
    const label = SCALE_LABELS[scala as keyof typeof SCALE_LABELS] || scala;
    if (valore >= 160) {
      eccellenze.push(`${label} (${valore})`);
    } else if (valore < 80) {
      debolezze.push(`${label} (${valore})`);
    }
  });
  
  let sintesi = `${cognome} ${nome}`;
  if (eta) sintesi += `, ${eta} anni`;
  sintesi += `, candidato/a per ${ruolo}.\n\n`;
  sintesi += `Profilo: ${profiloLabel.toUpperCase()}`;
  
  if (eccellenze.length > 0) {
    sintesi += ` con eccellente ${eccellenze.slice(0, 2).join(' e ').toLowerCase()}`;
  }
  
  if (debolezze.length > 0) {
    sintesi += `. Limiti: ${debolezze.slice(0, 2).join(', ').toLowerCase()}`;
  }
  
  sintesi += '.';
  
  return sintesi;
}

/**
 * Genera raccomandazione operativa condizionale
 */
function generaRaccomandazioneCondizionale(
  profiloTipo: ProfiloTipo | null,
  scalePunteggi: Record<string, number>,
  verdict: FitVerdictV5
): { condizione: string; azione: string }[] {
  const raccomandazioni: { condizione: string; azione: string }[] = [];
  
  const sc = scalePunteggi['SC'] || 100;
  const cf = scalePunteggi['CF'] || 100;
  const ec = scalePunteggi['EC'] || 100;
  const pa = scalePunteggi['PA'] || 100;
  const sp = scalePunteggi['SP'] || 100;
  const mo = scalePunteggi['MO'] || 100;
  
  // Raccomandazioni basate su profilo e punteggi
  if (sc > 160 && cf < 100) {
    raccomandazioni.push({
      condizione: "l'azienda ha bisogno di STABILITÀ e CONTINUITÀ",
      azione: "PROCEDERE con colloquio approfondito su capacità di adattamento ai cambiamenti"
    });
    raccomandazioni.push({
      condizione: "l'azienda ha bisogno di TRASFORMAZIONE RADICALE",
      azione: "VALUTARE CON CAUTELA - il profilo è più esecutivo che trasformativo"
    });
  } else if (ec > 160 && pa > 160) {
    raccomandazioni.push({
      condizione: "l'azienda cerca LEADERSHIP e RISULTATI",
      azione: "PROCEDERE con fast-track - profilo ad alto potenziale"
    });
    raccomandazioni.push({
      condizione: "l'azienda ha struttura rigida con poca autonomia",
      azione: "VALUTARE il rischio frustrazione - profilo richiede spazio decisionale"
    });
  } else if (mo > 140 && sp < 100) {
    raccomandazioni.push({
      condizione: "il ruolo richiede VENDITA o OBIETTIVI ECONOMICI",
      azione: "NON PROCEDERE - pattern 'Motore a vuoto' rilevato, manca direzione"
    });
    raccomandazioni.push({
      condizione: "il ruolo è OPERATIVO/ESECUTIVO",
      azione: "VALUTARE - buona motivazione se guidato da obiettivi chiari"
    });
  } else if (verdict === 'IDONEO') {
    raccomandazioni.push({
      condizione: "il ruolo corrisponde alle aspettative del candidato",
      azione: "PROCEDERE con proposta - match positivo su tutti i requisiti"
    });
  } else if (verdict === 'IDONEO_CON_RISERVA') {
    raccomandazioni.push({
      condizione: "le aree di attenzione sono gestibili",
      azione: "PROCEDERE con piano di onboarding strutturato"
    });
    raccomandazioni.push({
      condizione: "le aree di attenzione sono critiche per il ruolo",
      azione: "VALUTARE alternative o piano di sviluppo intensivo"
    });
  } else {
    raccomandazioni.push({
      condizione: "esistono ruoli alternativi in azienda",
      azione: "CONSIDERARE ricollocazione su ruoli più compatibili"
    });
    raccomandazioni.push({
      condizione: "il ruolo richiesto è l'unica opzione",
      azione: "VALUTARE con cautela i rischi operativi specifici"
    });
  }
  
  return raccomandazioni;
}

/**
 * Genera prossimi passi suggeriti
 */
function generaProssimiPassi(
  scalePunteggi: Record<string, number>,
  verdict: FitVerdictV5
): string[] {
  const passi: string[] = [];
  
  const qr = scalePunteggi['QR'] || 100;
  const cf = scalePunteggi['CF'] || 100;
  const sc = scalePunteggi['SC'] || 100;
  const sv = scalePunteggi['SV'] || 100;
  
  // Passi basati su aree critiche
  if (qr < 100) {
    passi.push('Colloquio su esempi concreti di assunzione responsabilità');
  }
  if (cf < 100) {
    passi.push('Verifica capacità di gestione stress e imprevisti');
  }
  if (sc > 160) {
    passi.push('Esplorazione adattabilità ai cambiamenti');
  }
  if (sv < 90) {
    passi.push('Assessment situazione personale e supporto necessario');
  }
  
  // Passi standard basati su verdict
  if (verdict === 'IDONEO') {
    passi.push('Verifica aspettative economiche e di crescita');
    passi.push('Proposta economica e negoziazione');
  } else if (verdict === 'IDONEO_CON_RISERVA') {
    passi.push('Secondo colloquio con responsabile diretto');
    passi.push('Definizione piano di onboarding con milestones');
  } else if (verdict === 'DA_VALUTARE') {
    passi.push('Assessment approfondito sulle criticità');
    passi.push('Valutazione ruoli alternativi');
  } else {
    passi.push('Comunicazione trasparente delle motivazioni');
    passi.push('Eventuale proposta per ruoli diversi');
  }
  
  return passi.slice(0, 4); // Max 4 passi
}

export function SintesiFinaleCard({
  candidatoNome,
  candidatoCognome,
  eta,
  ruoloRichiesto,
  profiloTipo,
  scalePunteggi,
  stressZone,
  className
}: SintesiFinaleCardProps) {
  const profiloInfo = profiloTipo ? getProfiloDetailedDescription(profiloTipo) : null;
  
  // Calcolo semplificato del verdict basato sui punteggi
  const avgScore = Object.values(scalePunteggi).reduce((a, b) => a + b, 0) / Math.max(Object.values(scalePunteggi).length, 1);
  const verdict: FitVerdictV5 = avgScore >= 130 ? 'IDONEO' : avgScore >= 100 ? 'IDONEO_CON_RISERVA' : avgScore >= 80 ? 'DA_VALUTARE' : 'NON_IDONEO';
  const compatibilitaPct = Math.round(Math.max(20, Math.min(95, (avgScore / 200) * 100)));
  
  // Identifica eccellenze e debolezze
  const eccellenze = Object.entries(scalePunteggi)
    .filter(([_, v]) => v >= 160)
    .map(([scala, valore]) => ({
      scala,
      label: SCALE_LABELS[scala as keyof typeof SCALE_LABELS] || scala,
      valore
    }));
    
  const areeAttenzione = Object.entries(scalePunteggi)
    .filter(([_, v]) => v < 80)
    .map(([scala, valore]) => ({
      scala,
      label: SCALE_LABELS[scala as keyof typeof SCALE_LABELS] || scala,
      valore
    }));
  
  const sintesiTestuale = generaSintesiTestuale(
    candidatoNome, 
    candidatoCognome, 
    eta, 
    ruoloRichiesto, 
    profiloTipo, 
    scalePunteggi
  );
  
  const raccomandazioni = generaRaccomandazioneCondizionale(profiloTipo, scalePunteggi, verdict);
  const prossimiPassi = generaProssimiPassi(scalePunteggi, verdict);
  
  return (
    <Card className={cn("border-2 border-slate-300 dark:border-slate-700", className)}>
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          📊 Sintesi del Profilo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Sintesi Testuale */}
        <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {sintesiTestuale}
          </p>
        </div>
        
        {/* Punti di Forza */}
        {eccellenze.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              PUNTI DI FORZA
            </h4>
            <div className="space-y-1">
              {eccellenze.map((e, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{e.label}</span>
                  <Badge variant="outline" className="ml-auto text-green-600 border-green-300">
                    {e.valore}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Aree di Attenzione */}
        {areeAttenzione.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
              AREE DI ATTENZIONE
            </h4>
            <div className="space-y-1">
              {areeAttenzione.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>{a.label}</span>
                  <Badge variant="outline" className="ml-auto text-amber-600 border-amber-300">
                    {a.valore}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Raccomandazione Operativa */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            📋 RACCOMANDAZIONE OPERATIVA
          </h4>
          
          <div className="space-y-3">
            {raccomandazioni.map((r, idx) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  SE {r.condizione}:
                </p>
                <p className="text-sm flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{r.azione}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Prossimi Passi */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            PROSSIMI PASSI
          </h4>
          
          <ol className="space-y-2">
            {prossimiPassi.map((passo, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <span>{passo}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
