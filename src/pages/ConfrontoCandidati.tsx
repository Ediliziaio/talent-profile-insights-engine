/**
 * Confronto fra candidati.
 *
 * La versione precedente descriveva: 15 tratti a codice (ORG, AUT, GP…),
 * punteggi grezzi da -100 a +100, sigle delle sindromi, "ESSERE/FARE/AVERE".
 * Chi apre questa pagina però non deve studiare un profilo: deve scegliere
 * fra due o tre persone. Qui si risponde a quella domanda — chi è il più
 * adatto, perché, e cosa chiedergli al colloquio.
 */

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Users,
  X,
  Trophy,
  AlertTriangle,
  HardHat,
  MessageSquareQuote,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { ReliabilityIndex, TRAIT_LABELS, TraitCode } from '@/types/database';
import {
  getVerdictLabelV5,
  getVerdictBadgeVariantV5,
  RUOLI_V5,
  RoleMatchResultV5,
} from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached } from '@/lib/roleMatchingV5Cache';
import { calcolaSafetyIndex } from '@/lib/safetyIndexV5';
import { TraitScores } from '@/lib/syndromes';

type Candidato = Tables<'candidati'>;
type ProfiloCandidato = Tables<'profili_candidato'>;

type CandidatoWithProfilo = Candidato & {
  profili_candidato: ProfiloCandidato | null;
  aziende: { nome: string } | null;
};

const MAX_CONFRONTO = 4;

const TRAIT_CODES: TraitCode[] = [
  'ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM',
  'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI',
];

/** I traits arrivano come JSON: qui si normalizzano nella forma attesa dal matching. */
function toTraitScores(raw: unknown): TraitScores | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, number>;
  const out = {} as TraitScores;
  for (const code of TRAIT_CODES) out[code] = t[code] ?? 0;
  return out;
}

/* I motivi del motore arrivano prefissati dalla sigla interna della sindrome
   ("PSP: non regge la pressione lavorativa"). La sigla non dice niente a chi
   assume e fa sembrare il testo un messaggio d'errore: qui si toglie. */
function senzaSigla(testo: string): string {
  // Copre sia le sigle delle sindromi ("PSP:", "S04:") sia i verdetti in
  // maiuscolo che il motore antepone alla motivazione ("DA_VALUTARE:").
  const pulito = testo.replace(/^[A-Z][A-Z_]{1,24}\d{0,2}:\s*/, '');
  return pulito.charAt(0).toUpperCase() + pulito.slice(1);
}

/** Riga del confronto: stessa etichetta a sinistra, un valore per candidato. */
function Riga({
  titolo,
  children,
}: {
  titolo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titolo}
      </h4>
      {children}
    </div>
  );
}

export default function ConfrontoCandidati() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ruoloConfronto, setRuoloConfronto] = useState<string | null>(null);

  const selectedIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').filter(Boolean).slice(0, MAX_CONFRONTO) : [];
  }, [searchParams]);

  // Elenco per il selettore "aggiungi": solo chi ha finito il test.
  const { data: allCandidati } = useQuery({
    queryKey: ['candidati-confronto-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidati')
        .select('id, nome, cognome, ruolo_attuale, funzione, profili_candidato(assessment_version)')
        .eq('test_completato', true)
        .order('cognome')
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: candidatiSelezionati, isLoading } = useQuery({
    queryKey: ['candidati-confronto', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      const { data, error } = await supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .in('id', selectedIds);
      if (error) throw error;
      // L'ordine di `in()` non è garantito: si rispetta quello scelto dall'utente.
      const rows = data as CandidatoWithProfilo[];
      return selectedIds
        .map((id) => rows.find((r) => r.id === id))
        .filter((r): r is CandidatoWithProfilo => !!r);
    },
    enabled: selectedIds.length > 0,
  });

  /* Il ruolo di confronto era fisso su "Venditore/Commerciale": se confronti
     tre capicantiere, ogni numero in pagina è sbagliato. Qui si parte dal
     ruolo che i candidati hanno in comune, e resta modificabile. */
  useEffect(() => {
    if (ruoloConfronto || !candidatiSelezionati?.length) return;

    // Prima scelta: il ruolo che i candidati dichiarano di ricoprire.
    const dichiarati = candidatiSelezionati
      .flatMap((c) => [c.funzione, c.ruolo_attuale])
      .filter((v): v is string => !!v);
    const daiDati = RUOLI_V5.find((r) =>
      dichiarati.some(
        (v) =>
          v.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(v.toLowerCase())
      )
    );
    if (daiDati) {
      setRuoloConfronto(daiDati);
      return;
    }

    // Altrimenti si apre sul ruolo su cui il gruppo va meglio: partire dal
    // primo dell'elenco alfabetico mostrerebbe numeri a caso.
    const traitsPerCandidato = candidatiSelezionati
      .map((c) => ({ traits: toTraitScores(c.profili_candidato?.traits_v5), eta: c.eta ?? undefined }))
      .filter((x): x is { traits: TraitScores; eta: number | undefined } => !!x.traits);
    if (!traitsPerCandidato.length) {
      setRuoloConfronto(RUOLI_V5[0]);
      return;
    }
    let migliore = RUOLI_V5[0];
    let migliorMedia = -1;
    for (const ruolo of RUOLI_V5) {
      const media =
        traitsPerCandidato.reduce(
          (somma, x) => somma + calculateRoleMatchingV5Cached(ruolo, x.traits, x.eta).compatibilitaPct,
          0
        ) / traitsPerCandidato.length;
      if (media > migliorMedia) {
        migliorMedia = media;
        migliore = ruolo;
      }
    }
    setRuoloConfronto(migliore);
  }, [candidatiSelezionati, ruoloConfronto]);

  const schede = useMemo(() => {
    if (!candidatiSelezionati || !ruoloConfronto) return [];
    return candidatiSelezionati.map((c) => {
      const profilo = c.profili_candidato;
      const traits = toTraitScores(profilo?.traits_v5);
      const match: RoleMatchResultV5 | null = traits
        ? calculateRoleMatchingV5Cached(ruoloConfronto, traits, c.eta ?? undefined)
        : null;
      const sicurezza = traits
        ? calcolaSafetyIndex(traits, profilo?.reliability_index as ReliabilityIndex | null)
        : null;
      return { c, profilo, match, sicurezza };
    });
  }, [candidatiSelezionati, ruoloConfronto]);

  /* Il "migliore" non è semplicemente chi ha la percentuale più alta: un
     disqualifier bloccante toglie dalla corsa a prescindere dal punteggio. */
  const migliori = useMemo(() => {
    const ammessi = schede.filter(
      (s) => s.match && !s.match.disqualifiersAttivi.some((d) => d.severity === 'blocking')
    );
    if (!ammessi.length) return [];
    const max = Math.max(...ammessi.map((s) => s.match!.compatibilitaPct));
    // A parità di punteggio non ha senso incoronare il primo dell'elenco:
    // sono davvero pari, e chi legge deve saperlo.
    return ammessi.filter((s) => s.match!.compatibilitaPct === max);
  }, [schede]);

  const migliore = migliori[0] ?? null;
  const pariMerito = migliori.length > 1;

  const addCandidato = (id: string) => {
    if (selectedIds.length >= MAX_CONFRONTO || selectedIds.includes(id)) return;
    setSearchParams({ ids: [...selectedIds, id].join(',') });
  };

  const removeCandidato = (id: string) => {
    const rimasti = selectedIds.filter((i) => i !== id);
    if (rimasti.length) setSearchParams({ ids: rimasti.join(',') });
    else setSearchParams({});
  };

  const candidatiDisponibili = useMemo(() => {
    if (!allCandidati) return [];
    return allCandidati.filter(
      (c) => !selectedIds.includes(c.id) && c.profili_candidato?.assessment_version === 'v5'
    );
  }, [allCandidati, selectedIds]);

  const pronti = schede.length >= 2;

  return (
    <NotionLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Intestazione */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/candidati')} aria-label="Torna ai candidati">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" /> Chi scelgo?
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Metti fianco a fianco fino a {MAX_CONFRONTO} persone e vedi chi regge meglio il ruolo.
              </p>
            </div>
          </div>

          {pronti && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Per il ruolo di</span>
              <Select value={ruoloConfronto ?? undefined} onValueChange={setRuoloConfronto}>
                <SelectTrigger className="w-[230px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {RUOLI_V5.map((ruolo) => (
                    <SelectItem key={ruolo} value={ruolo}>
                      {ruolo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Chi sto confrontando */}
        <div className="flex flex-wrap items-center gap-2">
          {candidatiSelezionati?.map((c) => (
            <Badge key={c.id} variant="secondary" className="px-3 py-1.5 text-sm gap-2">
              {c.nome} {c.cognome}
              <button onClick={() => removeCandidato(c.id)} aria-label={`Togli ${c.nome} ${c.cognome}`}>
                <X className="h-3 w-3 hover:text-destructive" />
              </button>
            </Badge>
          ))}
          {selectedIds.length < MAX_CONFRONTO && candidatiDisponibili.length > 0 && (
            <Select onValueChange={addCandidato} value="">
              <SelectTrigger className="w-[230px] h-8 text-sm">
                <SelectValue placeholder="+ Aggiungi una persona" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {candidatiDisponibili.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome} {c.cognome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading && (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        )}

        {!isLoading && !pronti && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">Scegli almeno due persone</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Dalla lista candidati spunta le caselle di chi vuoi confrontare e premi
                “Confronta”, oppure aggiungile qui sopra.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/candidati')}>
                Vai ai candidati
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Verdetto */}
        {pronti && migliore?.match && (
          <Card className="border-green-300 bg-green-50/60">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <Trophy className="h-6 w-6 text-green-700 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold">
                  {pariMerito ? (
                    <>
                      Per fare il {ruoloConfronto?.toLowerCase()} sono pari:{' '}
                      {migliori.map((m) => `${m.c.nome} ${m.c.cognome}`).join(' e ')} — entrambi al{' '}
                      {migliore.match.compatibilitaPct}%.
                    </>
                  ) : (
                    <>
                      Per fare il {ruoloConfronto?.toLowerCase()}, il più adatto è{' '}
                      {migliore.c.nome} {migliore.c.cognome} — {migliore.match.compatibilitaPct}% di
                      compatibilità.
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{senzaSigla(migliore.match.motivazione)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {pronti && !migliore && (
          <Card className="border-amber-300 bg-amber-50/60">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0" />
              <p className="text-sm">
                Nessuna di queste persone regge il ruolo di{' '}
                <strong>{ruoloConfronto?.toLowerCase()}</strong>: su tutte c’è almeno un motivo
                bloccante. Prova a confrontarle su un ruolo diverso, o allarga la ricerca.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Confronto */}
        {pronti && (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {schede.map(({ c, profilo, match, sicurezza }) => {
                const isMigliore = migliori.some((m) => m.c.id === c.id);
                const bloccanti = match?.disqualifiersAttivi.filter((d) => d.severity === 'blocking') ?? [];
                const avvisi = match?.disqualifiersAttivi.filter((d) => d.severity === 'warning') ?? [];

                return (
                  <Card
                    key={c.id}
                    className={cn(
                      'flex-1 min-w-[290px] max-w-[360px] shrink-0',
                      isMigliore && 'border-green-400 ring-1 ring-green-200'
                    )}
                  >
                    <CardContent className="p-4 space-y-4">
                      {/* Chi è */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold leading-snug truncate">
                            {c.nome} {c.cognome}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.ruolo_attuale || c.funzione || 'Ruolo non indicato'}
                            {c.eta ? ` · ${c.eta} anni` : ''}
                          </p>
                        </div>
                        {isMigliore && (
                          <Badge className="bg-green-600 hover:bg-green-600 shrink-0 text-[11px]">
                            {pariMerito ? 'Pari merito' : 'Più adatto'}
                          </Badge>
                        )}
                      </div>

                      {!match ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                          Test non ancora elaborato.
                        </p>
                      ) : (
                        <>
                          {/* Compatibilità */}
                          <div className="rounded-lg bg-muted/60 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">Compatibilità</span>
                              <Badge variant={getVerdictBadgeVariantV5(match.verdict)} className="text-[11px]">
                                {getVerdictLabelV5(match.verdict)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilitaPct} className="h-2 flex-1" />
                              <span className="text-xl font-bold">{match.compatibilitaPct}%</span>
                            </div>
                          </div>

                          {/* Motivi bloccanti */}
                          {bloccanti.length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-xs font-semibold text-red-800 flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3.5 w-3.5" /> Perché non va bene
                              </p>
                              <ul className="text-xs text-red-900 space-y-0.5 list-disc pl-4">
                                {bloccanti.map((d, i) => (
                                  <li key={i}>{senzaSigla(d.reason)}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <Riga titolo="Va bene su">
                            {match.requisitiSoddisfatti.length ? (
                              <ul className="space-y-1">
                                {match.requisitiSoddisfatti.slice(0, 4).map((r) => (
                                  <li key={r.trait} className="text-sm flex items-start gap-1.5">
                                    <ThumbsUp className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                                    {/* r.label è la soglia del motore ("Organizzazione > 40") */}
                                    {TRAIT_LABELS[r.trait] ?? r.label}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">Niente di rilevante.</p>
                            )}
                          </Riga>

                          <Riga titolo="Dove è scoperto">
                            {match.requisitiMancanti.length ? (
                              <ul className="space-y-1">
                                {match.requisitiMancanti.slice(0, 4).map((r) => (
                                  <li key={r.trait} className="text-sm flex items-start gap-1.5">
                                    <ThumbsDown className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                                    {TRAIT_LABELS[r.trait] ?? r.label}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">Niente da segnalare.</p>
                            )}
                          </Riga>

                          <Riga titolo="Sicurezza in cantiere">
                            {sicurezza?.indice != null ? (
                              <div className="flex items-center gap-2">
                                <HardHat className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Progress value={sicurezza.indice} className="h-2 flex-1" />
                                <span className="text-sm font-semibold w-14 text-right">
                                  {sicurezza.indice}/100
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Non calcolabile: le risposte non sono abbastanza attendibili.
                              </p>
                            )}
                          </Riga>

                          {avvisi.length > 0 && (
                            <Riga titolo="Da tenere d’occhio">
                              <ul className="text-sm text-amber-800 space-y-0.5 list-disc pl-4">
                                {avvisi.map((d, i) => (
                                  <li key={i}>{senzaSigla(d.reason)}</li>
                                ))}
                              </ul>
                            </Riga>
                          )}

                          {match.domandeColloquio.length > 0 && (
                            <Riga titolo="Cosa chiedergli al colloquio">
                              <ul className="space-y-1.5">
                                {match.domandeColloquio.slice(0, 3).map((d, i) => (
                                  <li key={i} className="text-sm flex items-start gap-1.5">
                                    <MessageSquareQuote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </Riga>
                          )}
                        </>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/candidati/${c.id}`)}
                      >
                        Apri la scheda
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </NotionLayout>
  );
}
