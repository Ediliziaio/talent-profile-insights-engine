import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sparkles, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Info, Heart, MessageCircle, Target, ChevronDown } from 'lucide-react';
import { TraitCode } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import {
  calculateMappaInteriore,
  MappaInterioreResult,
  ATTACCAMENTO_FRONTEND,
  getIdentitaLabel,
  getRegolazioneLabel,
} from '@/lib/mappaInteriore';

interface MappaInterioreTabProps {
  traits: Record<TraitCode, number>;
  candidatoNome: string;
  candidatoSesso: string | null;
  eta?: number;
  syndromes: SyndromeResult[];
}

// ─── Score Bar Component ──────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  sublabel,
  inverted = false,
}: {
  label: string;
  score: number;
  sublabel: string;
  inverted?: boolean;
}) {
  const pct = (score / 10) * 100;

  // inverted: green 0-3, amber 4-6, orange 7-10 (for Identità-Risultato where LOW is good)
  // normal: red 0-3, amber 4-6, green 7-10
  let barColor: string;
  if (inverted) {
    if (score <= 3) barColor = 'bg-emerald-500';
    else if (score <= 6) barColor = 'bg-amber-500';
    else barColor = 'bg-orange-500';
  } else {
    if (score <= 3) barColor = 'bg-red-500';
    else if (score <= 6) barColor = 'bg-amber-500';
    else barColor = 'bg-emerald-500';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{sublabel}</span>
          <span className="font-bold text-base">{score}/10</span>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Narrative Card ───────────────────────────────────────────────────────────

function NarrativeCard({
  title,
  icon,
  text,
  borderColor,
}: {
  title: string;
  icon: string;
  text: string;
  borderColor: string;
}) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardContent className="py-4 px-5">
        <h4 className="font-semibold text-sm mb-2">
          {icon} {title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MappaInterioreTab({
  traits,
  candidatoNome,
  candidatoSesso,
  eta,
  syndromes,
}: MappaInterioreTabProps) {
  const result = useMemo(
    () => calculateMappaInteriore(traits, candidatoNome, candidatoSesso, syndromes, eta),
    [traits, candidatoNome, candidatoSesso, syndromes, eta]
  );
  const [attaccamentoOpen, setAttaccamentoOpen] = useState(false);

  // Profilo bilanciato → messaggio positivo
  if (!result) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profilo Bilanciato</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {candidatoNome} presenta un profilo psicologico equilibrato. Le dimensioni profonde sono
            nella norma, senza pattern di attenzione significativi. Un punto di forza raro.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { dimensioni, profiloNarrativoLabel, narrativa, cosa_motiva, cosa_blocca, cosa_teme, errori_da_evitare, pattern_combinatori, domande_colloquio_aggiuntive, override_piano_crescita } = result;

  const difesaLabel = dimensioni.difesa.dominante
    ? dimensioni.difesa.dominante.frontend
    : 'Equilibrate';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <h2 className="text-lg font-bold">La Mappa Interiore di {candidatoNome}</h2>
      </div>

      {/* Dimension Bars */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <ScoreBar
            label="Identità-Risultato"
            score={dimensioni.identitaRisultato}
            sublabel={getIdentitaLabel(dimensioni.identitaRisultato)}
            inverted
          />
          <ScoreBar
            label="Regolazione Emotiva"
            score={dimensioni.regolazioneEmotiva}
            sublabel={getRegolazioneLabel(dimensioni.regolazioneEmotiva)}
          />
        </CardContent>
      </Card>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Collapsible open={attaccamentoOpen} onOpenChange={setAttaccamentoOpen}>
          <CollapsibleTrigger asChild>
            <Badge variant="outline" className="text-xs px-3 py-1.5 cursor-pointer hover:bg-muted transition-colors">
              <Heart className="h-3 w-3 mr-1.5" />
              Stile relazionale: {ATTACCAMENTO_FRONTEND[dimensioni.attaccamento.dominante]}
              <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${attaccamentoOpen ? 'rotate-180' : ''}`} />
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-xs font-medium mb-2">Punteggi Attaccamento dettagliati</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                  <span>Sicuro: <strong className="text-foreground">{dimensioni.attaccamento.scores.sicuro}/10</strong></span>
                  <span>Ansioso: <strong className="text-foreground">{dimensioni.attaccamento.scores.ansioso}/10</strong></span>
                  <span>Evitante: <strong className="text-foreground">{dimensioni.attaccamento.scores.evitante}/10</strong></span>
                  <span>Disorganizzato: <strong className="text-foreground">{dimensioni.attaccamento.scores.disorganizzato}/10</strong></span>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <AlertCircle className="h-3 w-3 mr-1.5" />
          Reazione alla pressione: {difesaLabel}
        </Badge>
        <Badge variant="outline" className="text-xs px-3 py-1.5">
          <Sparkles className="h-3 w-3 mr-1.5" />
          Motore primario: {dimensioni.bisogno.primario.frontend}
        </Badge>
      </div>

      {/* Profilo Narrativo label */}
      {result.profiloNarrativo !== 'equilibrato' && (
        <div className="text-sm text-muted-foreground italic">
          Profilo narrativo: {profiloNarrativoLabel}
        </div>
      )}

      {/* 4 Narrative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NarrativeCard
          title={`Chi è ${candidatoNome} nel profondo`}
          icon="🧠"
          text={narrativa.chi_e_nel_profondo}
          borderColor="border-l-blue-500"
        />
        <NarrativeCard
          title={`Cosa ${candidatoSesso === 'F' ? 'la' : 'lo'} guida`}
          icon="🔥"
          text={narrativa.cosa_lo_guida}
          borderColor="border-l-orange-500"
        />
        <NarrativeCard
          title={`Cosa ${candidatoSesso === 'F' ? 'la' : 'lo'} blocca`}
          icon="🧊"
          text={narrativa.cosa_lo_blocca}
          borderColor="border-l-cyan-500"
        />
        <NarrativeCard
          title="Potenziale inespresso"
          icon="💎"
          text={narrativa.potenziale_inespresso}
          borderColor="border-l-violet-500"
        />
      </div>

      {/* LA CHIAVE */}
      <Card className="border-2 border-violet-300 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-800">
        <CardContent className="py-5 px-6 text-center">
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2">🗝️ LA CHIAVE</p>
          <p className="text-base font-semibold text-violet-900 dark:text-violet-100 leading-relaxed">
            "{narrativa.la_chiave}"
          </p>
        </CardContent>
      </Card>

      {/* Motiva / Blocca / Teme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Cosa motiva
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-1.5">
              {cosa_motiva.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500" />
              Cosa blocca
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-1.5">
              {cosa_blocca.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-red-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Cosa teme
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-1.5">
              {cosa_teme.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 3 Errori da Non Fare Mai */}
      <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm flex items-center gap-1.5 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            I 3 Errori da Non Fare Mai con {candidatoNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <ol className="space-y-2">
            {errori_da_evitare.map((errore, i) => (
              <li key={i} className="text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                <span className="font-bold text-red-600 dark:text-red-400 shrink-0">{i + 1}.</span>
                {errore}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Pattern Combinatori */}
      {pattern_combinatori.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            ⚡ Pattern Combinatori Rilevati
          </h3>
          {pattern_combinatori.map((p) => (
            <Card key={p.codice} className={p.positivo ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}>
              <CardContent className="py-4 px-5">
                <h4 className="font-semibold text-sm mb-1">{p.frontend}</h4>
                <p className="text-xs text-muted-foreground">{p.azione}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Domande Colloquio di Secondo Livello */}
      {domande_colloquio_aggiuntive.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            Domande Colloquio di Secondo Livello
          </h3>
          {domande_colloquio_aggiuntive.map((gruppo, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{gruppo.area}</CardTitle>
                  <Badge
                    variant={gruppo.priorita === 'CRITICA' ? 'destructive' : gruppo.priorita === 'ALTA' ? 'default' : 'secondary'}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {gruppo.priorita}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <ul className="space-y-2">
                  {gruppo.domande.map((domanda, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">→</span>
                      <span className="italic">"{domanda}"</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Azioni per il Piano di Crescita */}
      {override_piano_crescita.length > 0 && (
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              Azioni per il Piano di Crescita
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <ul className="space-y-2">
              {override_piano_crescita.map((override, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                  {override}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Questa analisi offre indicazioni per la crescita professionale. Non sostituisce una
          valutazione psicologica clinica. In caso di difficoltà significative, consigliamo il supporto
          di un professionista qualificato.
        </p>
      </div>
    </div>
  );
}
