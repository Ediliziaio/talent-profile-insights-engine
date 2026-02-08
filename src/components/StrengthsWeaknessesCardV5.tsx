/**
 * StrengthsWeaknessesCardV5 - SEZIONE 6: Punti di Forza e Aree di Miglioramento
 * 
 * Card con tabella TOP 3 FORZA / TOP 3 MIGLIORAMENTO:
 * - Descrizione 2-3 righe per ogni tratto
 * - Percorso suggerito
 * - Tempistica stimata (3-6 mesi / 6-12 mesi / 12-24 mesi)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, ArrowRight, Clock, BookOpen } from "lucide-react";
import { TraitCode, TRAIT_LABELS } from "@/types/database";
import { personalizzaTesto } from "@/lib/traitNarrativesV5";

interface StrengthsWeaknessesCardV5Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
}

// Testi brevi per punti di forza (2-3 righe) - come si manifesta e quale valore porta
const STRENGTH_DESCRIPTIONS: Partial<Record<TraitCode, string>> = {
  ORG: "[Nome] porta ordine e chiarezza in ogni progetto. La sua capacità di pianificare e gestire le priorità libera il team da incertezze e ritardi, permettendo a tutti di concentrarsi sull'esecuzione.",
  AUT: "[Nome] si muove con energia e determinazione senza bisogno di stimoli esterni. Questa spinta interiore è contagiosa e alza il livello di ambizione di tutto il team.",
  GP: "[Nome] mantiene la calma anche nelle situazioni più tese. Questa stabilità emotiva è un'ancora per i colleghi nei momenti difficili.",
  ADS: "[Nome] è una garanzia di affidabilità: quando prende un impegno, lo mantiene. Il team può contare su di lei senza riserve.",
  DET: "[Nome] dice le cose come stanno, con rispetto ma senza giri di parole. Questa chiarezza evita malintesi e accelera le decisioni.",
  VEN: "[Nome] sa accendere l'entusiasmo nelle persone. Le sue presentazioni coinvolgono, le sue idee contagiano, le sue proposte convincono.",
  HRM: "[Nome] fa crescere le persone che gestisce. Chi lavora con lei diventa più autonomo e consapevole delle proprie capacità.",
  LDR: "[Nome] è un punto di riferimento naturale. Le persone si rivolgono a lei per orientamento e la seguono spontaneamente.",
  PRO: "[Nome] affronta i problemi cercando soluzioni, non colpevoli. Questa attitudine costruttiva rende l'ambiente di lavoro più sereno e produttivo.",
  COM: "[Nome] accoglie le diversità con apertura genuina. Le persone si sentono libere di esprimersi e condividere idee con lei.",
  ESP: "[Nome] ha una rete di contatti ampia e diversificata. Questo network apre porte e genera opportunità per tutta l'azienda.",
  RC: "[Nome] è coerente e prevedibile nei suoi comportamenti. Questa stabilità genera fiducia e sicurezza nel team.",
  FIN: "[Nome] gestisce le risorse con oculatezza e visione. La sua solidità finanziaria le permette scelte professionali ponderate.",
  SUC: "[Nome] ha una storia di risultati concreti. Il track record parla chiaro: trasforma gli obiettivi in realtà.",
  PRI: "[Nome] ha principi professionali solidi e allineati. Capisce le regole del gioco e le applica con coerenza."
};

// Testi brevi per aree di miglioramento (2-3 righe) - come si manifesta la lacuna e quale impatto ha
const WEAKNESS_DESCRIPTIONS: Partial<Record<TraitCode, string>> = {
  ORG: "[Nome] fatica a tenere il filo delle attività quando la complessità aumenta. Le priorità si confondono e i progetti si accumulano senza completarsi.",
  AUT: "[Nome] ha bisogno di stimoli esterni per attivarsi. Senza qualcuno che la spinga, tende a sedersi su ciò che ha già.",
  GP: "[Nome] sta subendo l'influenza negativa di qualcuno. Questa pressione sottrae energia e limita tutte le altre capacità.",
  ADS: "[Nome] fatica a mantenere gli impegni presi. Le scadenze scivolano e i dettagli vengono trascurati, generando frustrazione nel team.",
  DET: "[Nome] evita le conversazioni difficili. Questa difficoltà nel parlare chiaro crea confusione e accumula problemi non risolti.",
  VEN: "[Nome] fatica a coinvolgere e entusiasmare. Le sue idee, anche buone, restano inascoltate perché presentate in modo poco efficace.",
  HRM: "[Nome] non riesce a far crescere le persone che gestisce. Il suo stile manageriale non produce l'impatto desiderato.",
  LDR: "[Nome] fatica a farsi seguire. Manca quell'influenza naturale che porta le persone ad affidarsi alla sua guida.",
  PRO: "[Nome] tende a prendere le cose sul personale. Le critiche la feriscono e i problemi vengono attribuiti agli altri.",
  COM: "[Nome] fatica ad accogliere punti di vista diversi. Questo limita la collaborazione e la qualità delle decisioni.",
  ESP: "[Nome] lavora in isolamento relazionale. Manca quella rete di contatti che apre opportunità e fornisce supporto.",
  RC: "[Nome] è instabile nelle sue convinzioni. Cambia idea frequentemente, creando confusione in chi lavora con lei.",
  FIN: "[Nome] non presta attenzione alla gestione finanziaria. Questa fragilità economica condiziona le scelte professionali.",
  SUC: "[Nome] non ha ancora raggiunto stabilità nella carriera. I risultati sono frammentati e la traiettoria incerta.",
  PRI: "[Nome] ha principi professionali disallineati. Alcune convinzioni remano contro il suo stesso successo."
};

// Percorsi formativi suggeriti per ogni tratto
const PERCORSI_FORMATIVI: Partial<Record<TraitCode, string>> = {
  ORG: "Corso di Time Management + costruzione routine giornaliera strutturata",
  AUT: "Coaching individuale sulla fiducia + esposizione graduale a sfide crescenti",
  GP: "Colloquio dedicato per identificare PSP + piano di gestione relazione tossica",
  ADS: "Sistema di checklist e scadenze intermedie + check-in settimanali con manager",
  DET: "Training sulla comunicazione assertiva + role-playing su conversazioni difficili",
  VEN: "Corso di public speaking + storytelling aziendale",
  HRM: "Mentoring con manager esperto + formazione su feedback e delegazione",
  LDR: "Coaching sulla leadership situazionale + esposizione progressiva a ruoli di guida",
  PRO: "Training sulla gestione del feedback + tecniche di de-personalizzazione",
  COM: "Workshop sulla diversità e inclusione + esposizione graduale a team eterogenei",
  ESP: "Programma di networking strutturato + partecipazione a eventi di settore",
  RC: "Esposizione graduale al cambiamento + costruzione di routine flessibili",
  FIN: "Consulenza finanziaria personale + costruzione piano di risparmio",
  SUC: "Definizione obiettivi SMART a 12 mesi + mentoring su strategia di carriera",
  PRI: "Coaching sui principi professionali + letture su mentalità di crescita"
};

// Tempistiche stimate in base al punteggio
function getTempisticaStimata(punteggio: number): { label: string; color: string } {
  if (punteggio < -20) return { label: "12-24 mesi", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" };
  if (punteggio < 10) return { label: "6-12 mesi", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" };
  return { label: "3-6 mesi", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" };
}

// Helper per ottenere top 3 tratti più alti/bassi
function getTopTraits(
  traits: Record<TraitCode, number>, 
  direction: 'highest' | 'lowest',
  count: number = 3
): { tratto: TraitCode; punteggio: number }[] {
  const excludedTraits: TraitCode[] = ['CTRL']; // Escludi tratti di controllo
  
  const sortedTraits = Object.entries(traits)
    .filter(([tratto]) => !excludedTraits.includes(tratto as TraitCode))
    .sort((a, b) => direction === 'highest' ? b[1] - a[1] : a[1] - b[1])
    .slice(0, count)
    .map(([tratto, punteggio]) => ({ 
      tratto: tratto as TraitCode, 
      punteggio 
    }));
  
  return sortedTraits;
}

// Export helper per uso in altri componenti (InterviewSheetPDF)
export function getTopStrengths(
  traits: Record<TraitCode, number>,
  count: number = 3
): { trait: TraitCode; value: number }[] {
  return getTopTraits(traits, 'highest', count).map(t => ({ trait: t.tratto, value: t.punteggio }));
}

export function getTopWeaknesses(
  traits: Record<TraitCode, number>,
  count: number = 3
): { trait: TraitCode; value: number }[] {
  return getTopTraits(traits, 'lowest', count).map(t => ({ trait: t.tratto, value: t.punteggio }));
}

export function StrengthsWeaknessesCardV5({
  candidatoNome,
  candidatoSesso,
  traits
}: StrengthsWeaknessesCardV5Props) {
  const topStrengths = getTopTraits(traits, 'highest', 3);
  const topWeaknesses = getTopTraits(traits, 'lowest', 3);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Punti di Forza e Aree di Miglioramento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          I tratti più sviluppati e le aree su cui intervenire
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* TOP 3 FORZA */}
        <div>
          <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" />
            Top 3 Punti di Forza
          </h4>
          <div className="space-y-4">
            {topStrengths.map(({ tratto, punteggio }) => (
              <div 
                key={tratto}
                className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {TRAIT_LABELS[tratto]}
                  </span>
                  <Badge variant="default" className="bg-emerald-500">
                    +{punteggio}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {personalizzaTesto(STRENGTH_DESCRIPTIONS[tratto] || '', candidatoNome, candidatoSesso)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* TOP 3 MIGLIORAMENTO */}
        <div>
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4" />
            Top 3 Aree di Miglioramento
          </h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Tratto</TableHead>
                  <TableHead className="w-[35%]">Impatto</TableHead>
                  <TableHead className="w-[25%]">Percorso Suggerito</TableHead>
                  <TableHead className="w-[15%]">Tempistica</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topWeaknesses.map(({ tratto, punteggio }) => {
                  const tempistica = getTempisticaStimata(punteggio);
                  return (
                    <TableRow key={tratto}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{TRAIT_LABELS[tratto]}</span>
                          <Badge variant="outline" className="text-xs">
                            {punteggio > 0 ? '+' : ''}{punteggio}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {personalizzaTesto(WEAKNESS_DESCRIPTIONS[tratto] || '', candidatoNome, candidatoSesso)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{PERCORSI_FORMATIVI[tratto]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${tempistica.color} flex items-center gap-1`}>
                          <Clock className="h-3 w-3" />
                          {tempistica.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
