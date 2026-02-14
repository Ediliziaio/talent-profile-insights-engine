import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import { Copy, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColloquioArea {
  id: string;
  area: string;
  priorita: 'ALTA' | 'MEDIA';
  motivazione: string;
  domande: string[];
}

interface ColloquioTabV3Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
  syndromes: SyndromeResult[];
}

const SEGNALI_ALLARME = [
  'Parla male di colleghi o superiori precedenti',
  'Non sa dare numeri concreti sui risultati',
  'Dice "sì" a tutto senza approfondire',
  'Si agita quando chiedi dettagli specifici',
  'Racconta solo successi, mai fallimenti',
  'Non fa domande alla fine del colloquio',
];

const SEGNALI_POSITIVI = [
  'Racconta fallimenti e cosa ha imparato',
  'Dà numeri concreti senza esitazione',
  'Ammette aree di miglioramento',
  'Fa domande sulla cultura aziendale',
  'Parla bene dei colleghi precedenti',
  'Ha un piano chiaro per il futuro',
];

function generateColloquioAreasV3(
  traits: Record<string, number>,
  nome: string,
  sesso: string | null
): ColloquioArea[] {
  const areas: ColloquioArea[] = [];
  const pronome = sesso === 'F' ? 'la' : sesso === 'M' ? 'lo' : 'la/lo';

  if (traits.GP !== undefined && traits.GP < 21) {
    areas.push({
      id: 'pressioni',
      area: 'Pressioni e benessere',
      priorita: 'ALTA',
      motivazione: `${nome} mostra segni di forte pressione relazionale. È fondamentale capire come sta davvero prima di qualsiasi altra valutazione.`,
      domande: [
        `Come stai davvero in questo periodo? C'è qualcosa che ti pesa?`,
        `C'è qualcuno nel tuo ambiente — lavoro o personale — che ti causa preoccupazione?`,
        `Come reagisci quando qualcosa non va secondo i piani?`,
        `Quali strategie usi per recuperare energia dopo periodi difficili?`,
      ],
    });
  }

  if (traits.ORG !== undefined && traits.ORG < 30) {
    areas.push({
      id: 'organizzazione',
      area: 'Organizzazione e metodo',
      priorita: 'ALTA',
      motivazione: `${nome} sembra avere difficoltà a pianificare e stabilire priorità. Capire come organizza il lavoro è essenziale.`,
      domande: [
        `Come organizzi una settimana tipo di lavoro?`,
        `Quando arrivano 3 urgenze contemporaneamente, come decidi quale affrontare?`,
        `Quanti progetti segui in questo momento? Come tieni traccia di tutto?`,
      ],
    });
  }

  if (traits.PRO !== undefined && traits.PRO < 10) {
    areas.push({
      id: 'critiche',
      area: 'Gestione delle critiche',
      priorita: 'ALTA',
      motivazione: `${nome} sembra prendere le critiche molto sul personale. Importante verificare come reagisce ai feedback negativi.`,
      domande: [
        `L'ultima volta che qualcuno ti ha ${sesso === 'F' ? 'criticata' : 'criticato'}: cosa hai provato? Come hai reagito?`,
        `Quando qualcosa va storto nel tuo lavoro, qual è la tua prima reazione?`,
      ],
    });
  }

  const rc = traits.RC;
  if (rc !== undefined && (rc > 45 || rc < -14)) {
    const isRigido = rc > 45;
    areas.push({
      id: 'cambiamento',
      area: 'Apertura al cambiamento',
      priorita: 'ALTA',
      motivazione: isRigido
        ? `${nome} tende ad essere molto ${sesso === 'F' ? 'strutturata' : 'strutturato'} e ${sesso === 'F' ? 'resistente' : 'resistente'} ai cambiamenti. Verificare la flessibilità.`
        : `${nome} cambia idea e direzione molto spesso. Verificare la stabilità nelle decisioni.`,
      domande: [
        `Come reagisci quando i piani cambiano all'improvviso?`,
        `Preferisci ambienti stabili o dinamici? Perché?`,
      ],
    });
  }

  if (traits.DET !== undefined && traits.DET < 25) {
    areas.push({
      id: 'comunicazione',
      area: 'Comunicazione diretta',
      priorita: 'MEDIA',
      motivazione: `${nome} tende ad evitare il confronto diretto. Capire come gestisce le conversazioni difficili.`,
      domande: [
        `Raccontami l'ultima volta che hai detto qualcosa di scomodo a un superiore.`,
        `Come gestisci un collaboratore che non fa il suo lavoro?`,
        `Quando non sei d'accordo con una decisione, come lo comunichi?`,
      ],
    });
  }

  if (traits.VEN !== undefined && traits.VEN < 15) {
    areas.push({
      id: 'coinvolgimento',
      area: 'Capacità di coinvolgimento',
      priorita: 'MEDIA',
      motivazione: `${nome} ha difficoltà a comunicare in modo persuasivo e a coinvolgere gli altri.`,
      domande: [
        `Vendimi questo ruolo: perché dovremmo scegliere te?`,
        `Come hai convinto qualcuno di un'idea a cui era contrario?`,
      ],
    });
  }

  if (traits.COM !== undefined && traits.COM < 0) {
    areas.push({
      id: 'relazioni',
      area: 'Relazioni con gli altri',
      priorita: 'MEDIA',
      motivazione: `${nome} sembra avere un approccio selettivo nelle relazioni. Verificare l'apertura verso persone diverse.`,
      domande: [
        `Come costruisci relazioni professionali con persone nuove?`,
        `Hai lavorato con qualcuno molto diverso da te? Come è andata?`,
      ],
    });
  }

  if (traits.AUT !== undefined && traits.AUT < 25) {
    areas.push({
      id: 'motivazione',
      area: 'Motivazione e obiettivi',
      priorita: 'MEDIA',
      motivazione: `La motivazione interna di ${nome} è debole. Capire cosa ${pronome} spinge e dove vuole arrivare.`,
      domande: [
        `Cosa ti appassiona nel tuo lavoro? Cosa ti fa alzare la mattina?`,
        `Quali sono i tuoi obiettivi professionali nei prossimi 3 anni?`,
        `Quando ti sei ${sesso === 'F' ? 'sentita' : 'sentito'} più ${sesso === 'F' ? 'realizzata' : 'realizzato'} professionalmente?`,
      ],
    });
  }

  if (traits.SUC !== undefined && traits.SUC < -20) {
    areas.push({
      id: 'risultati',
      area: 'Risultati e percorso',
      priorita: 'MEDIA',
      motivazione: `Il percorso professionale di ${nome} mostra risultati limitati. Approfondire le cause.`,
      domande: [
        `Qual è il risultato professionale di cui vai più ${sesso === 'F' ? 'fiera' : 'fiero'}? Dammi i numeri.`,
        `C'è stato un momento in cui hai capito che qualcosa doveva cambiare nel tuo percorso?`,
      ],
    });
  }

  // Sort: ALTA first, then MEDIA
  areas.sort((a, b) => {
    if (a.priorita === 'ALTA' && b.priorita === 'MEDIA') return -1;
    if (a.priorita === 'MEDIA' && b.priorita === 'ALTA') return 1;
    return 0;
  });

  return areas;
}

export function ColloquioTabV3({ candidatoNome, candidatoSesso, traits, syndromes }: ColloquioTabV3Props) {
  const { toast } = useToast();
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set());

  const areas = useMemo(
    () => generateColloquioAreasV3(traits, candidatoNome, candidatoSesso),
    [traits, candidatoNome, candidatoSesso]
  );

  // Start with all areas open
  const effectiveOpenAreas = useMemo(() => {
    if (openAreas.size === 0 && areas.length > 0) {
      return new Set(areas.map(a => a.id));
    }
    return openAreas;
  }, [openAreas, areas]);

  const toggleArea = (id: string) => {
    setOpenAreas(prev => {
      const initial = prev.size === 0 ? new Set(areas.map(a => a.id)) : new Set(prev);
      if (initial.has(id)) {
        initial.delete(id);
      } else {
        initial.add(id);
      }
      return initial;
    });
  };

  const toggleQuestion = (areaId: string, qIndex: number) => {
    const key = `${areaId}-${qIndex}`;
    setCheckedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyQuestions = (area: ColloquioArea) => {
    const text = area.domande.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(`${area.area}\n\n${text}`);
    toast({ title: 'Domande copiate', description: `${area.domande.length} domande copiate negli appunti` });
  };

  const altaCount = areas.filter(a => a.priorita === 'ALTA').length;
  const mediaCount = areas.filter(a => a.priorita === 'MEDIA').length;
  const totalQuestions = areas.reduce((sum, a) => sum + a.domande.length, 0);

  return (
    <div className="space-y-4">
      {/* HEADER CARD */}
      <Card className="rounded-[14px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Domande per il Colloquio con {candidatoNome}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Seleziona le domande più rilevanti. Usa i checkbox per tracciare quelle già poste.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {altaCount > 0 && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                  {altaCount} priorità alta
                </Badge>
              )}
              {mediaCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                  {mediaCount} priorità media
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {areas.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Il profilo di {candidatoNome} non evidenzia aree che richiedano domande specifiche.</p>
              <p className="text-sm mt-1">Procedere con un colloquio standard.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {areas.map(area => {
                const isOpen = effectiveOpenAreas.has(area.id);
                const isAlta = area.priorita === 'ALTA';

                return (
                  <Collapsible key={area.id} open={isOpen} onOpenChange={() => toggleArea(area.id)}>
                    <div
                      className={`rounded-xl border transition-colors ${
                        isAlta ? 'border-destructive/30 bg-destructive/5' : 'border-amber-200 bg-amber-50/50'
                      }`}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between px-4 py-3 cursor-pointer" role="button" tabIndex={0}>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`text-[10px] font-extrabold ${
                                isAlta
                                  ? 'bg-destructive text-destructive-foreground'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {area.priorita}
                            </Badge>
                            <span className="text-sm font-semibold text-foreground">{area.area}</span>
                            <span className="text-xs text-muted-foreground">
                              {area.domande.length} domand{area.domande.length === 1 ? 'a' : 'e'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={e => {
                                e.stopPropagation();
                                copyQuestions(area);
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copia
                            </Button>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground italic mb-3 pl-1">
                            {area.motivazione}
                          </p>
                          <div className="space-y-2">
                            {area.domande.map((domanda, j) => {
                              const key = `${area.id}-${j}`;
                              const isChecked = checkedQuestions.has(key);

                              return (
                                <label
                                  key={j}
                                  className={`flex items-start gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors hover:bg-background/60 ${
                                    isChecked ? 'bg-background/80 opacity-60' : ''
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => toggleQuestion(area.id, j)}
                                    className="mt-0.5"
                                  />
                                  <span
                                    className={`text-sm text-foreground leading-relaxed ${
                                      isChecked ? 'line-through' : ''
                                    }`}
                                  >
                                    {j + 1}. "{domanda}"
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEGNALI D'ALLARME / POSITIVI */}
      <Card className="rounded-[14px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">
            🔍 Cosa Osservare Durante il Colloquio
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Segnali d'allarme */}
            <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">Segnali d'Allarme</span>
              </div>
              <div className="space-y-1.5">
                {SEGNALI_ALLARME.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-destructive text-xs mt-0.5">•</span>
                    <span className="text-xs text-destructive/80 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segnali positivi */}
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 dark:bg-green-950/20 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">Segnali Positivi</span>
              </div>
              <div className="space-y-1.5">
                {SEGNALI_POSITIVI.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 text-xs mt-0.5">•</span>
                    <span className="text-xs text-green-700 dark:text-green-300 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
