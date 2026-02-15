import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sparkles, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Info,
  Heart, MessageCircle, Target, ChevronDown, Brain, Flame, Shield, Zap, Key,
  Search,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceArea,
  Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { TraitCode } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import {
  calculateMappaInteriore,
  MappaInterioreResult,
  ATTACCAMENTO_FRONTEND,
  getIdentitaLabel,
  getRegolazioneLabel,
  getDimensioniChartData,
  DimensioneChartItem,
} from '@/lib/mappaInteriore';

interface MappaInterioreTabProps {
  traits: Record<TraitCode, number>;
  candidatoNome: string;
  candidatoSesso: string | null;
  eta?: number;
  syndromes: SyndromeResult[];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function DimensioneTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DimensioneChartItem }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-xl max-w-[260px]">
      <p className="font-semibold text-sm mb-1">{d.name}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{d.tooltip}</p>
    </div>
  );
}

// ─── Custom Y-Axis Tick ───────────────────────────────────────────────────────

function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text x={(x ?? 0) - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-foreground text-[11px] font-medium">
      {payload?.value}
    </text>
  );
}

// ─── Candle Chart Component ───────────────────────────────────────────────────

function DimensioniCandleChart({ data }: { data: DimensioneChartItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          Panoramica Dimensioni Profonde
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 120 }}>
              {/* Background zones */}
              <ReferenceArea x1={0} x2={3} fill="#fecaca" fillOpacity={0.15} />
              <ReferenceArea x1={3} x2={7} fill="#fef08a" fillOpacity={0.12} />
              <ReferenceArea x1={7} x2={10} fill="#bbf7d0" fillOpacity={0.15} />

              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 5, 6, 8, 10]} tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={115}
                tick={YAxisTick as any}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine x={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.5} />
              <RechartsTooltip content={<DimensioneTooltip />} cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.4 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22} label={{ position: 'right', fontSize: 11, fontWeight: 600, fill: 'hsl(var(--foreground))' }}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dimension Pill ───────────────────────────────────────────────────────────

function DimensionPill({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${color}`}>
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Narrative Card ───────────────────────────────────────────────────────────

function NarrativeCard({ title, icon, text, bgClass }: { title: string; icon: string; text: string; bgClass: string }) {
  return (
    <Card className={`overflow-hidden ${bgClass}`}>
      <CardContent className="py-5 px-5">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground leading-[1.7]">{text}</p>
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
  const chartData = getDimensioniChartData(result);

  const difesaLabel = dimensioni.difesa.dominante
    ? dimensioni.difesa.dominante.frontend
    : 'Equilibrate';

  // Profilo badge color
  const profiloBgMap: Record<string, string> = {
    compresso: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    performante_identitario: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    protettore_ferito: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    rigido_difensivo: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    ambizioso_frustrato: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    creativo_frammentato: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    esecutore_invisibile: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    equilibrato: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h2 className="text-xl font-bold">La Mappa Interiore di {candidatoNome}</h2>
        </div>
        <p className="text-xs text-muted-foreground ml-7.5 mb-3">Report di Psicologia Profonda</p>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase ${profiloBgMap[result.profiloNarrativo] ?? profiloBgMap.equilibrato}`}>
          {profiloNarrativoLabel}
        </div>
      </div>

      {/* ─── Candle Chart ──────────────────────────────────── */}
      <DimensioniCandleChart data={chartData} />

      {/* ─── Dimension Pills ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Collapsible open={attaccamentoOpen} onOpenChange={setAttaccamentoOpen} className="col-span-1">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-2.5 rounded-xl border px-4 py-2.5 bg-rose-50/60 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100/80 dark:hover:bg-rose-950/50 transition-colors text-left">
              <Heart className="h-4.5 w-4.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 leading-none mb-0.5">Stile relazionale</p>
                <p className="text-sm font-semibold leading-tight truncate">{ATTACCAMENTO_FRONTEND[dimensioni.attaccamento.dominante]}</p>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${attaccamentoOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card className="border-l-4 border-l-rose-400">
              <CardContent className="py-3 px-4">
                <p className="text-xs font-semibold mb-2.5">Punteggi Attaccamento</p>
                <div className="space-y-2">
                  {(['sicuro', 'ansioso', 'evitante', 'disorganizzato'] as const).map(stile => {
                    const score = dimensioni.attaccamento.scores[stile];
                    const pct = (score / 10) * 100;
                    const isActive = dimensioni.attaccamento.dominante === stile;
                    return (
                      <div key={stile} className="flex items-center gap-2">
                        <span className={`text-xs capitalize w-24 ${isActive ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{stile}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isActive ? 'bg-rose-500' : 'bg-muted-foreground/30'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs w-8 text-right ${isActive ? 'font-bold' : 'text-muted-foreground'}`}>{score}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <DimensionPill
          icon={Shield}
          label="Reazione alla pressione"
          value={difesaLabel}
          color="bg-amber-50/60 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        />
        <DimensionPill
          icon={Sparkles}
          label="Motore primario"
          value={dimensioni.bisogno.primario.frontend}
          color="bg-violet-50/60 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 border-violet-200 dark:border-violet-800"
        />
      </div>

      {/* ─── Narrative Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NarrativeCard
          title={`Chi è ${candidatoNome} nel profondo`}
          icon="🧠"
          text={narrativa.chi_e_nel_profondo}
          bgClass="bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40"
        />
        <NarrativeCard
          title={`Cosa ${candidatoSesso === 'F' ? 'la' : 'lo'} guida`}
          icon="🔥"
          text={narrativa.cosa_lo_guida}
          bgClass="bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/40"
        />
        <NarrativeCard
          title={`Cosa ${candidatoSesso === 'F' ? 'la' : 'lo'} blocca`}
          icon="🧊"
          text={narrativa.cosa_lo_blocca}
          bgClass="bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-200/60 dark:border-cyan-800/40"
        />
        <NarrativeCard
          title="Potenziale inespresso"
          icon="💎"
          text={narrativa.potenziale_inespresso}
          bgClass="bg-violet-50/40 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-800/40"
        />
      </div>

      {/* ─── LA CHIAVE ─────────────────────────────────────── */}
      <Card className="border-2 border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-violet-950/50 shadow-lg shadow-violet-100/50 dark:shadow-violet-950/30">
        <CardContent className="py-6 px-7 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-violet-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">La Chiave</span>
          </div>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-100 leading-relaxed max-w-lg mx-auto">
            "{narrativa.la_chiave}"
          </p>
        </CardContent>
      </Card>

      {/* ─── Motiva / Blocca / Teme ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Cosa motiva
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {cosa_motiva.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/40">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Cosa blocca
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {cosa_blocca.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Cosa teme
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {cosa_teme.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ─── Errori da Non Fare Mai ─────────────────────────── */}
      <Card className="bg-red-50/70 dark:bg-red-950/20 border-l-4 border-l-red-500 border-red-200 dark:border-red-900">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            I 3 Errori da Non Fare Mai con {candidatoNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <ol className="space-y-3">
            {errori_da_evitare.map((errore, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-3">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                <span className="leading-relaxed">{errore}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* ─── Pattern Combinatori ────────────────────────────── */}
      {pattern_combinatori.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Pattern Combinatori Rilevati
          </h3>
          {pattern_combinatori.map((p) => (
            <Card key={p.codice} className={p.positivo ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'}>
              <CardContent className="py-4 px-5">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Zap className={`h-4 w-4 ${p.positivo ? 'text-emerald-500' : 'text-amber-500'}`} />
                  {p.frontend}
                </h4>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.azione}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Domande Colloquio ──────────────────────────────── */}
      {domande_colloquio_aggiuntive.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Domande Colloquio di Secondo Livello
          </h3>
          {domande_colloquio_aggiuntive.map((gruppo, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{gruppo.area}</CardTitle>
                  <Badge
                    className={`text-[10px] px-2.5 py-0.5 font-bold ${
                      gruppo.priorita === 'CRITICA' ? 'bg-red-500 text-white border-red-500' :
                      gruppo.priorita === 'ALTA' ? 'bg-amber-500 text-white border-amber-500' :
                      'bg-muted text-muted-foreground border-muted'
                    }`}
                  >
                    {gruppo.priorita}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <ul className="space-y-2.5">
                  {gruppo.domande.map((domanda, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                      <MessageCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="italic leading-relaxed border-l-2 border-primary/20 pl-2">"{domanda}"</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Azioni Piano di Crescita ──────────────────────── */}
      {override_piano_crescita.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Azioni per il Piano di Crescita
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-primary/20 rounded-full" />
              <ul className="space-y-4">
                {override_piano_crescita.map((override, i) => (
                  <li key={i} className="relative flex items-start gap-3">
                    <span className="absolute -left-6 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 z-10">{i + 1}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{override}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Disclaimer ────────────────────────────────────── */}
      <div className="rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground/70 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          Questa analisi offre indicazioni per la crescita professionale. Non sostituisce una
          valutazione psicologica clinica. In caso di difficoltà significative, consigliamo il supporto
          di un professionista qualificato.
        </p>
      </div>
    </div>
  );
}
