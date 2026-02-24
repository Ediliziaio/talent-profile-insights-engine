/**
 * PremiumReportPDF.tsx — Template HTML dedicato per generazione PDF premium
 * 
 * REDESIGN v2.0 — Report da consulenza strategica
 * Renderizzato off-screen, catturato sezione per sezione con html2canvas.
 * Tutti gli stili sono inline (necessario per html2canvas).
 */

import { TraitCode, TRAIT_LABELS, MACRO_AREA_TRAITS } from '@/types/database';
import type { ProfiloTipoV5, ReliabilityIndex } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import { RoleMatchResultV5, FitVerdictV5, AllRolesCompatibilityV5 } from '@/lib/roleMatchingV5';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { PROFILI_TIPO_V5_EXTENDED } from '@/lib/profiloTipoV5Extended';
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';
import { MappaInterioreResult, ATTACCAMENTO_FRONTEND, getDimensioniChartData } from '@/lib/mappaInteriore';
import { getPersonalizedManagementTips, getPersonalizedClosingText } from '@/lib/managementTipsV5';
import { personalizzaTesto, getFascia, getTraitNarrative, getGPSpecialNarrative, TRAIT_NARRATIVES } from '@/lib/traitNarrativesV5';

// ═══════════════════════════════════════════════════
// DESIGN SYSTEM v2.0 — Premium Consulting Report
// ═══════════════════════════════════════════════════

// Colors
const BRAND_BLUE = '#1e3a5f';
const BRAND_ORANGE = '#f09133';
const COLOR_GREEN = '#16A34A';
const COLOR_AMBER = '#D97706';
const COLOR_RED = '#DC2626';
const TEXT_BODY = '#374151';
const TEXT_CAPTION = '#9ca3af';
const BORDER_LIGHT = '#e5e7eb';
const BG_SUBTLE = '#fafbfc'; // Very subtle, used sparingly

// Typography
const FONT_BODY = 11;
const FONT_CAPTION = 9;
const LINE_HEIGHT = 1.65;
const FONT_FAMILY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Margins — premium spacing
const PAGE_PADDING = '25mm 20mm';
const PAGE_PADDING_NARROW = '20mm 20mm';

// ─── Types ──────────────────────────────────────────

interface ColloquioArea {
  id: string;
  area: string;
  priorita: 'ALTA' | 'MEDIA';
  motivazione: string;
  domande: string[];
}

interface ActionItem {
  priority: string;
  area: string;
  action: string;
  timeline: string;
  responsible: string;
  trigger?: string;
}

interface GrowthPlan {
  rootCause: string;
  hiddenResource: string;
  viciouscircles: string[];
  phases: { name: string; description: string }[];
}

export interface PremiumReportPDFProps {
  candidato: {
    nome: string;
    cognome: string;
    sesso?: string | null;
    ruolo_attuale?: string | null;
    data_test?: string | null;
    funzione?: string | null;
    eta?: number | null;
    azienda?: string | null;
  };
  traits: Record<TraitCode, number>;
  macroAreas: { essere: number; fare: number; avere: number };
  profiloTipo?: ProfiloTipoV5;
  reliabilityIndex?: ReliabilityIndex;
  syndromes: SyndromeResult[];
  roleMatch?: RoleMatchResultV5;
  allRolesCompatibility?: AllRolesCompatibilityV5;
  mappaInteriore?: MappaInterioreResult;
  colloquioAreas?: ColloquioArea[];
  actionPlan?: ActionItem[];
  growthPlan?: GrowthPlan;
  managementTips?: { testo: string; isPriorityOne?: boolean }[];
  managementClosingText?: string;
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function getTraitColor(value: number): string {
  if (value >= 40) return COLOR_GREEN;
  if (value >= 20) return COLOR_AMBER;
  return COLOR_RED;
}

function getQualityLabel(value: number): string {
  if (value >= 70) return 'Eccellente';
  if (value >= 55) return 'Ottimo';
  if (value >= 40) return 'Buono';
  if (value >= 25) return 'Discreto';
  if (value >= 10) return 'Mediocre';
  return 'Critico';
}

function getMacroAreaColor(value: number): string {
  if (value >= 60) return COLOR_GREEN;
  if (value >= 40) return BRAND_ORANGE;
  if (value >= 20) return COLOR_AMBER;
  return COLOR_RED;
}

function getVerdictColor(v: FitVerdictV5): string {
  if (v === 'IDONEO') return COLOR_GREEN;
  if (v === 'IDONEO_CON_RISERVA') return COLOR_AMBER;
  if (v === 'DA_VALUTARE') return BRAND_ORANGE;
  return COLOR_RED;
}

function getVerdictLabel(v: FitVerdictV5): string {
  const m: Record<FitVerdictV5, string> = {
    IDONEO: 'IDONEO', IDONEO_CON_RISERVA: 'IDONEO CON RISERVA',
    DA_VALUTARE: 'DA VALUTARE', NON_IDONEO: 'NON IDONEO'
  };
  return m[v] || v;
}

function getReliabilityLabel(r?: ReliabilityIndex): string {
  const m: Record<string, string> = {
    YES: 'Alta', CAUTION: 'Moderata', NO: 'Bassa', ZERO: 'Non attendibile', FORCED: 'Forzata'
  };
  return m[r || ''] || 'N/D';
}

function getReliabilityColor(r?: ReliabilityIndex): string {
  if (r === 'YES') return COLOR_GREEN;
  if (r === 'CAUTION') return COLOR_AMBER;
  return COLOR_RED;
}

function getReliabilitySegment(r?: ReliabilityIndex): number {
  if (r === 'YES') return 4;
  if (r === 'CAUTION') return 3;
  if (r === 'NO') return 2;
  return 1;
}

const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── Dynamic text generators ────────────────────────

function getMacroAreaInterpretation(label: string, value: number, nome: string): string {
  if (label === 'ESSERE') {
    if (value >= 60) return `${nome} ha una chiara visione dei propri obiettivi e la capacità di restare focalizzato. La sua concentrazione strategica è un asset di valore.`;
    if (value >= 40) return `${nome} mostra una discreta capacità di focalizzazione, ma sotto pressione può perdere la bussola. Beneficerebbe di supporto strutturale nella definizione delle priorità.`;
    if (value >= 20) return `${nome} fatica a mantenere focus e direzione. Necessita di struttura esterna e obiettivi chiari per esprimere il proprio potenziale.`;
    return `${nome} è in una fase di forte dispersione mentale. Intervento urgente sulla definizione di obiettivi e gestione delle priorità.`;
  }
  if (label === 'FARE') {
    if (value >= 60) return `${nome} traduce le intenzioni in azioni concrete con efficacia e costanza. È una persona affidabile nell'esecuzione operativa.`;
    if (value >= 40) return `${nome} agisce con discreta efficacia nella routine, ma la costanza cala sotto pressione. Strutturare checklist e scadenze intermedie.`;
    if (value >= 20) return `${nome} ha un gap significativo tra intenzioni e azioni. La disciplina operativa necessita di rinforzo sistematico con strumenti esterni.`;
    return `${nome} fatica seriamente a passare dal pensiero all'azione. Priorità assoluta: costruire abitudini operative minime e monitorarle quotidianamente.`;
  }
  // AVERE
  if (value >= 60) return `${nome} costruisce relazioni di valore e sa gestire le dinamiche interpersonali con naturalezza. Forte capacità di influenza positiva.`;
  if (value >= 40) return `${nome} ha relazioni funzionali ma potrebbe sviluppare maggiore profondità nei rapporti. Buona base su cui costruire.`;
  if (value >= 20) return `${nome} ha un approccio selettivo alle relazioni che può limitare la collaborazione. Lavorare sull'apertura graduale verso gli altri.`;
  return `${nome} ha difficoltà significative nelle relazioni interpersonali. Intervento prioritario sulla comunicazione e la gestione dei conflitti.`;
}

function getStrategicSummary(
  traits: Record<TraitCode, number>,
  syndromes: SyndromeResult[],
  profiloTipo: ProfiloTipoV5 | undefined,
  macroAreas: { essere: number; fare: number; avere: number },
  nome: string,
  sesso: string | null
): string {
  const profiloExt = profiloTipo ? PROFILI_TIPO_V5_EXTENDED[profiloTipo] : null;
  const traitEntries = (Object.entries(traits) as [TraitCode, number][]).filter(([k]) => k !== 'CTRL').sort((a, b) => b[1] - a[1]);
  const topStrength = traitEntries[0];
  const topWeakness = [...traitEntries].sort((a, b) => a[1] - b[1])[0];
  const activeSyndromes = syndromes.filter(s => s.isActive);
  const redSyndromes = activeSyndromes.filter(s => s.severity === 'RED');

  let summary = '';
  
  if (profiloExt) {
    summary += `${nome} presenta un profilo di tipo "${profiloExt.label}": ${profiloExt.descrizioneBreve} `;
  }
  
  const strongArea = macroAreas.essere >= macroAreas.fare && macroAreas.essere >= macroAreas.avere ? 'strategica (ESSERE)' :
    macroAreas.fare >= macroAreas.avere ? 'operativa (FARE)' : 'relazionale (AVERE)';
  summary += `La sua area più forte è quella ${strongArea}. `;
  
  if (topStrength) {
    summary += `Il punto di forza più marcato è ${TRAIT_LABELS[topStrength[0]]} (${topStrength[1]}), che rappresenta una risorsa concreta su cui costruire. `;
  }
  
  if (topWeakness && topWeakness[1] < 20) {
    summary += `L'area di maggiore attenzione è ${TRAIT_LABELS[topWeakness[0]]} (${topWeakness[1]}), che richiede un intervento mirato. `;
  }
  
  if (redSyndromes.length > 0) {
    const synName = SYNDROMES_V5_DATA[redSyndromes[0].code]?.name || redSyndromes[0].code;
    summary += `È stata rilevata una segnalazione critica ("${synName}") che merita attenzione prioritaria nella gestione. `;
  }
  
  summary += `Nel complesso, ${nome} è una persona che può esprimere valore significativo se inserita nel contesto giusto e con il supporto adeguato.`;
  
  return summary;
}

function getStrategicReading(macroArea: string, areaTraits: TraitCode[], traits: Record<TraitCode, number>): { impatto: string; rischio: string; opportunita: string } {
  const avg = areaTraits.reduce((s, t) => s + (traits[t] || 0), 0) / areaTraits.length;
  
  if (macroArea === 'ESSERE') {
    return {
      impatto: avg >= 40 ? 'Forte capacità di visione e pianificazione. Può guidare processi complessi con autonomia.' : 'La capacità di pianificazione richiede supporto. Rischio di dispersione in contesti non strutturati.',
      rischio: avg >= 40 ? 'Possibile rigidità se la pianificazione diventa ossessione. Monitorare la flessibilità.' : 'Senza intervento, la disorganizzazione può impattare tutto il team. Priorità immediata.',
      opportunita: avg >= 40 ? 'Affidare progetti complessi e ruoli di coordinamento. Valorizzare la sua visione strategica.' : 'Con strumenti e affiancamento giusti, può fare un salto di qualità significativo in 3-6 mesi.',
    };
  }
  if (macroArea === 'FARE') {
    return {
      impatto: avg >= 40 ? 'Esecuzione operativa affidabile. Trasforma le strategie in risultati concreti.' : 'Gap tra intenzioni e risultati. Necessita di monitoraggio e struttura per garantire l\'esecuzione.',
      rischio: avg >= 40 ? 'Potrebbe frustarsi se il contesto non permette azione. Evitare ruoli troppo teorici.' : 'L\'inaffidabilità percepita può danneggiare la fiducia del team. Intervenire con sistemi di accountability.',
      opportunita: avg >= 40 ? 'Inserire in ruoli operativi chiave. Può diventare il "motore" del team.' : 'Con coaching mirato sulla disciplina, i miglioramenti possono essere rapidi e visibili.',
    };
  }
  // AVERE
  return {
    impatto: avg >= 40 ? 'Buona capacità relazionale. Costruisce ponti tra team e facilita la collaborazione.' : 'Le relazioni sono un\'area di sviluppo. Può sembrare distante o poco collaborativo.',
    rischio: avg >= 40 ? 'Rischio di sovra-investimento nelle relazioni a scapito dei risultati. Bilanciare.' : 'L\'isolamento può autoalimentarsi. Intervenire prima che diventi strutturale.',
    opportunita: avg >= 40 ? 'Valorizzare come facilitatore e mentore. Ruoli di interfaccia e gestione stakeholder.' : 'Introdurre gradualmente in contesti collaborativi sicuri. Evitare forzature.',
  };
}

function getTraitOperationalImpact(code: TraitCode, value: number): { impatto: string; osservare: string; seNonGestito: string } {
  const label = TRAIT_LABELS[code];
  if (value >= 40) {
    return {
      impatto: `${label} è un punto di forza consolidato. In ambito professionale, questa qualità permette performance superiori alla media nei contesti che la richiedono.`,
      osservare: `In colloquio, verificare che questa forza non diventi rigidità. Chiedere esempi di situazioni in cui ha dovuto adattarsi.`,
      seNonGestito: `Se non bilanciata, questa forza può diventare un punto cieco: eccesso di sicurezza, sottovalutazione dei rischi, impazienza verso chi non è allo stesso livello.`,
    };
  }
  if (value >= 20) {
    return {
      impatto: `${label} è nella norma. Non rappresenta né un vantaggio competitivo né un rischio. Funziona adeguatamente nella maggior parte dei contesti.`,
      osservare: `In colloquio, esplorare come si comporta quando questo aspetto viene messo sotto pressione. Cercare la soglia.`,
      seNonGestito: `Senza sviluppo, resterà un'area neutra. Non è urgente ma merita attenzione nel piano di crescita a medio termine.`,
    };
  }
  return {
    impatto: `${label} è un'area critica. In ambito professionale, questa debolezza può generare problemi ricorrenti, tensioni nel team e performance sotto le aspettative.`,
    osservare: `In colloquio, indagare con delicatezza. Evitare domande dirette che mettano in difensiva. Usare scenari ipotetici.`,
    seNonGestito: `Se non affrontato, questo deficit tenderà a peggiorare sotto pressione e a contaminare le aree adiacenti del profilo. Intervento prioritario.`,
  };
}

// ═══════════════════════════════════════════════════
// LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div data-section={id} style={{ pageBreakInside: 'avoid', marginBottom: 0 }}>
      {children}
    </div>
  );
}

function PageBreak() {
  return <div style={{ pageBreakBefore: 'always', height: 1 }} />;
}

function SectionTitle({ children, number }: { children: React.ReactNode; number?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {number && (
        <div style={{ fontSize: 11, fontWeight: 600, color: BRAND_ORANGE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          SEZIONE {number}
        </div>
      )}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND_BLUE, margin: 0, paddingBottom: 10, borderBottom: `3px solid ${BRAND_ORANGE}` }}>
        {children}
      </h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 14, fontWeight: 600, color: BRAND_BLUE, margin: '20px 0 8px 0' }}>{children}</h3>;
}

function BodyText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: FONT_BODY, color: TEXT_BODY, lineHeight: LINE_HEIGHT, margin: '6px 0', ...style }}>{children}</p>;
}

// ─── SVG Circle Gauge ───────────────────────────────

function CircleGauge({ value, label, color, size = 130 }: { value: number; label: string; color: string; size?: number }) {
  const radius = 48;
  const stroke = 10;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - progress / 100);
  const quality = getQualityLabel(value);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#eef1f5" strokeWidth={stroke} />
        {/* Progress circle */}
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Percentage */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>
          {Math.round(value)}%
        </text>
        {/* Label */}
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={BRAND_BLUE} letterSpacing="1">
          {label}
        </text>
        {/* Quality */}
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="9" fill={TEXT_CAPTION}>
          {quality}
        </text>
      </svg>
    </div>
  );
}

// ─── Reliability Indicator (4 segments) ─────────────

function ReliabilityIndicator({ reliability }: { reliability?: ReliabilityIndex }) {
  const activeSegments = getReliabilitySegment(reliability);
  const colors = [COLOR_RED, COLOR_AMBER, BRAND_ORANGE, COLOR_GREEN];
  return (
    <div>
      <div style={{ fontSize: FONT_CAPTION, fontWeight: 600, color: TEXT_CAPTION, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Attendibilità</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 8, borderRadius: 4,
            background: i <= activeSegments ? colors[activeSegments - 1] : '#eef1f5',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: getReliabilityColor(reliability) }}>
        {getReliabilityLabel(reliability)}
      </div>
    </div>
  );
}

// ─── Premium Horizontal Bar ─────────────────────────

function PremiumBar({ label, value, max = 100, color, showThreshold, threshold }: {
  label: string; value: number; max?: number; color?: string; showThreshold?: boolean; threshold?: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value + (max === 100 ? 0 : 100)) / (max === 100 ? 100 : 200)) * 100));
  const barColor = color || getTraitColor(value);
  const barHeight = 20;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
      <div style={{ width: 130, flexShrink: 0, fontSize: 10, color: TEXT_BODY, fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, height: barHeight, background: '#eef1f5', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.max(pct, 8)}%`, height: '100%', background: barColor, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{value}</span>
        </div>
        {showThreshold && threshold !== undefined && (
          <div style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, ((threshold + 100) / 200) * 100))}%`, top: 0, bottom: 0, width: 2, background: BRAND_BLUE, opacity: 0.5 }} />
        )}
      </div>
    </div>
  );
}

// ─── Badge component ────────────────────────────────

function Badge2({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 9, fontWeight: 700, color, background: bg, marginRight: 6, marginBottom: 4 }}>
      {text}
    </span>
  );
}

// ─── Left-bordered box ──────────────────────────────

function AccentBox({ borderColor, children, style }: { borderColor: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ borderLeft: `4px solid ${borderColor}`, paddingLeft: 16, paddingTop: 8, paddingBottom: 8, marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export function PremiumReportPDF(props: PremiumReportPDFProps) {
  const {
    candidato, traits, macroAreas, profiloTipo, reliabilityIndex,
    syndromes, roleMatch, allRolesCompatibility, mappaInteriore,
    colloquioAreas, actionPlan, growthPlan, managementTips, managementClosingText
  } = props;

  const fullName = `${candidato.cognome} ${candidato.nome}`;
  const profiloExt = profiloTipo ? PROFILI_TIPO_V5_EXTENDED[profiloTipo] : null;

  // Derive strengths & weaknesses
  const traitEntries = (Object.entries(traits) as [TraitCode, number][])
    .filter(([k]) => k !== 'CTRL')
    .sort((a, b) => b[1] - a[1]);
  const strengths = traitEntries.slice(0, 3);
  const weaknesses = [...traitEntries].sort((a, b) => a[1] - b[1]).slice(0, 3);

  const activeSyndromes = syndromes.filter(s => s.isActive);
  const redSyndromes = activeSyndromes.filter(s => s.severity === 'RED');
  const orangeSyndromes = activeSyndromes.filter(s => s.severity === 'ORANGE');

  // Top 5 compatible roles
  const topRoles = allRolesCompatibility?.tuttiRuoli
    .filter(r => r.verdict === 'IDONEO' || r.verdict === 'IDONEO_CON_RISERVA')
    .slice(0, 5) || [];

  // Strategic summary
  const strategicSummary = getStrategicSummary(traits, syndromes, profiloTipo, macroAreas, candidato.nome, candidato.sesso || null);

  return (
    <div style={{ width: '210mm', fontFamily: FONT_FAMILY, color: TEXT_BODY, background: '#fff' }}>

      {/* ═══════════════ PAGE 1: COVER ═══════════════ */}
      <Section id="cover">
        <div style={{ minHeight: '287mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30mm 25mm', position: 'relative' }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }} />
          
          {/* Logo */}
          <div style={{ position: 'absolute', top: 25, left: 25 }}>
            <img src="/talentprofile_logo_v3.png" alt="TalentProfile" style={{ height: 36 }} crossOrigin="anonymous" />
          </div>

          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <div style={{ fontSize: 12, letterSpacing: 5, color: BRAND_ORANGE, fontWeight: 600, textTransform: 'uppercase', marginBottom: 16 }}>
              Analisi Strategica
            </div>
            <div style={{ fontSize: 13, color: TEXT_CAPTION, marginBottom: 8 }}>
              Profilo Comportamentale & Assessment 360°
            </div>

            <div style={{ width: 60, height: 2, background: BRAND_ORANGE, margin: '20px auto' }} />

            <div style={{ fontSize: 38, fontWeight: 800, color: BRAND_BLUE, lineHeight: 1.15, marginBottom: 16 }}>
              {fullName}
            </div>

            {candidato.funzione && (
              <div style={{ fontSize: 16, color: TEXT_BODY, fontWeight: 400, marginBottom: 6 }}>{candidato.funzione}</div>
            )}
            {candidato.azienda && (
              <div style={{ fontSize: 14, color: TEXT_CAPTION, marginBottom: 24 }}>{candidato.azienda}</div>
            )}

            {profiloExt && (
              <div style={{
                display: 'inline-block', padding: '10px 28px', borderRadius: 28,
                border: `2px solid ${BRAND_BLUE}`, color: BRAND_BLUE,
                fontSize: 14, fontWeight: 600, marginBottom: 30, background: '#fff',
              }}>
                {profiloExt.emoji} {profiloExt.label}
              </div>
            )}

            <div style={{ width: 60, height: 2, background: BRAND_ORANGE, margin: '30px auto' }} />

            <div style={{ fontSize: FONT_BODY, color: TEXT_CAPTION }}>
              Report generato il {today}
              {candidato.data_test && <> — Test eseguito il {new Date(candidato.data_test).toLocaleDateString('it-IT')}</>}
            </div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginTop: 6 }}>
              Assessment TalentProfile 360° — v5.0
            </div>
          </div>

          {/* Bottom accent bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BLUE})` }} />
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGE 2: INDEX ═══════════════ */}
      <Section id="index">
        <div style={{ padding: PAGE_PADDING, minHeight: '260mm' }}>
          <SectionTitle>Indice del Report</SectionTitle>
          <div style={{ marginTop: 24 }}>
            {[
              { n: '1', title: 'Executive Summary', sub: 'Sintesi del profilo, macro-aree e indicatori chiave' },
              { n: '2', title: 'Profilo Comportamentale', sub: 'Analisi dei 15 tratti, narrativa, sindromi e ruoli compatibili', children: [
                { n: '2.1', title: 'Grafico tratti comportamentali' },
                { n: '2.2', title: `Chi è ${candidato.nome} — Narrative personalizzate` },
                { n: '2.3', title: 'Segnalazioni e sindromi' },
                { n: '2.4', title: 'Ruoli compatibili' },
                { n: '2.5', title: 'Profilo tipo esteso' },
              ] },
              { n: '3', title: 'Area Gestione', sub: 'Consigli di management, piano d\'azione, quadro psicologico' },
              { n: '4', title: 'Mappa Interiore', sub: 'Dimensioni profonde, pattern, narrative e colloquio' },
              { n: '5', title: 'Colloquio', sub: 'Domande personalizzate, segnali d\'allarme e positivi' },
              { n: '6', title: 'Metodologia', sub: 'Spiegazione del metodo e dati tecnici' },
            ].map(item => (
              <div key={item.n}>
                <div style={{ display: 'flex', alignItems: 'baseline', padding: '14px 0', borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ width: 36, fontSize: 20, fontWeight: 700, color: BRAND_ORANGE }}>{item.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: BRAND_BLUE }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: TEXT_CAPTION, marginTop: 3 }}>{item.sub}</div>
                  </div>
                </div>
                {item.children && item.children.map(child => (
                  <div key={child.n} style={{ display: 'flex', alignItems: 'baseline', padding: '7px 0', paddingLeft: 36 }}>
                    <div style={{ width: 32, fontSize: FONT_BODY, color: TEXT_CAPTION, fontWeight: 600 }}>{child.n}</div>
                    <div style={{ fontSize: FONT_BODY, color: TEXT_BODY }}>{child.title}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGE 3: EXECUTIVE SUMMARY ═══════════════ */}
      <Section id="executive-summary">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle number="01">Executive Summary</SectionTitle>

          {/* Verdict */}
          {roleMatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, marginBottom: 24, borderLeft: `4px solid ${getVerdictColor(roleMatch.verdict)}`, background: '#fafbfc' }}>
              <div style={{ padding: '8px 20px', borderRadius: 20, background: getVerdictColor(roleMatch.verdict), color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {getVerdictLabel(roleMatch.verdict)}
              </div>
              <div style={{ fontSize: FONT_BODY, color: TEXT_BODY, flex: 1, lineHeight: LINE_HEIGHT }}>{roleMatch.motivazione}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: getVerdictColor(roleMatch.verdict) }}>{roleMatch.compatibilitaPct}%</div>
            </div>
          )}

          {/* Macro Areas — Circle Gauges */}
          <SubTitle>Macro-Aree Strategiche</SubTitle>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'ESSERE', value: macroAreas.essere, desc: 'Concentrazione sugli obiettivi' },
              { label: 'FARE', value: macroAreas.fare, desc: 'Azioni concrete' },
              { label: 'AVERE', value: macroAreas.avere, desc: 'Relazioni di valore' },
            ].map(ma => (
              <div key={ma.label} style={{ flex: 1, textAlign: 'center', padding: '16px 12px' }}>
                <CircleGauge value={ma.value} label={ma.label} color={getMacroAreaColor(ma.value)} />
                <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginTop: 4, marginBottom: 6 }}>{ma.desc}</div>
                <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.5 }}>
                  {getMacroAreaInterpretation(ma.label, ma.value, candidato.nome)}
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses — Left-bordered elegant design */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <AccentBox borderColor={COLOR_GREEN}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLOR_GREEN, marginBottom: 8 }}>Top 3 Punti di Forza</div>
                {strengths.map(([code, val]) => (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', border: `2px solid ${COLOR_GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLOR_GREEN }}>{val}</div>
                    <div>
                      <div style={{ fontSize: FONT_BODY, fontWeight: 600, color: TEXT_BODY }}>{TRAIT_LABELS[code]}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION }}>{getQualityLabel(val)}</div>
                    </div>
                  </div>
                ))}
              </AccentBox>
            </div>
            <div style={{ flex: 1 }}>
              <AccentBox borderColor={COLOR_RED}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLOR_RED, marginBottom: 8 }}>Top 3 Aree di Attenzione</div>
                {weaknesses.map(([code, val]) => (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef2f2', border: `2px solid ${COLOR_RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLOR_RED }}>{val}</div>
                    <div>
                      <div style={{ fontSize: FONT_BODY, fontWeight: 600, color: TEXT_BODY }}>{TRAIT_LABELS[code]}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION }}>{getQualityLabel(val)}</div>
                    </div>
                  </div>
                ))}
              </AccentBox>
            </div>
          </div>

          {/* Profile Type + Reliability */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {profiloExt && (
              <div style={{ flex: 1, padding: 16, border: `2px solid ${BRAND_BLUE}`, borderRadius: 8 }}>
                <div style={{ fontSize: FONT_CAPTION, fontWeight: 600, color: TEXT_CAPTION, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Profilo Tipo</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>{profiloExt.emoji} {profiloExt.label}</div>
                <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.5 }}>{profiloExt.descrizioneBreve}</div>
              </div>
            )}
            <div style={{ width: 160, padding: 16, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8 }}>
              <ReliabilityIndicator reliability={reliabilityIndex} />
            </div>
          </div>

          {/* Active alerts summary */}
          {activeSyndromes.length > 0 && (
            <AccentBox borderColor={redSyndromes.length > 0 ? COLOR_RED : COLOR_AMBER}>
              <div style={{ fontSize: 12, fontWeight: 700, color: redSyndromes.length > 0 ? COLOR_RED : COLOR_AMBER, marginBottom: 8 }}>
                Segnalazioni Attive ({activeSyndromes.length})
              </div>
              {activeSyndromes.slice(0, 4).map(s => {
                const data = SYNDROMES_V5_DATA[s.code];
                return (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge2
                      text={s.severity}
                      color={s.severity === 'RED' ? '#fff' : '#92400e'}
                      bg={s.severity === 'RED' ? COLOR_RED : s.severity === 'ORANGE' ? '#fed7aa' : '#fef9c3'}
                    />
                    <span style={{ fontSize: 10, color: TEXT_BODY }}>{data?.name || s.code}</span>
                  </div>
                );
              })}
            </AccentBox>
          )}

          {/* Strategic Synthesis */}
          <div style={{ marginTop: 20, padding: 20, background: BG_SUBTLE, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BRAND_BLUE, marginBottom: 10 }}>Sintesi Strategica</div>
            <div style={{ fontSize: FONT_BODY, color: TEXT_BODY, lineHeight: 1.7 }}>
              {strategicSummary}
            </div>
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGES 4-5: PROFILO COMPLETO ═══════════════ */}
      <Section id="profilo-tratti">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle number="02">Profilo Comportamentale</SectionTitle>

          {/* ESSERE */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND_BLUE, marginBottom: 2 }}>ESSERE — Concentrazione sugli obiettivi</div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginBottom: 4 }}>Come pensa, pianifica e gestisce le pressioni</div>
            <div style={{ fontSize: 10, color: TEXT_BODY, fontStyle: 'italic', marginBottom: 12 }}>
              {getMacroAreaInterpretation('ESSERE', macroAreas.essere, candidato.nome)}
            </div>
            {MACRO_AREA_TRAITS.ESSERE.map(t => (
              <PremiumBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            {/* Strategic Reading */}
            {(() => {
              const sr = getStrategicReading('ESSERE', MACRO_AREA_TRAITS.ESSERE, traits);
              return (
                <div style={{ marginTop: 10, padding: 14, borderLeft: `3px solid ${BRAND_BLUE}`, background: BG_SUBTLE }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BRAND_BLUE, marginBottom: 8 }}>Lettura Strategica</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Impatto:</strong> {sr.impatto}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Rischio:</strong> {sr.rischio}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6 }}>▸ <strong>Opportunità:</strong> {sr.opportunita}</div>
                </div>
              );
            })()}
          </div>

          {/* FARE */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND_BLUE, marginBottom: 2 }}>FARE — Azioni concrete</div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginBottom: 4 }}>Come agisce, decide e affronta le sfide</div>
            <div style={{ fontSize: 10, color: TEXT_BODY, fontStyle: 'italic', marginBottom: 12 }}>
              {getMacroAreaInterpretation('FARE', macroAreas.fare, candidato.nome)}
            </div>
            {MACRO_AREA_TRAITS.FARE.map(t => (
              <PremiumBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            {(() => {
              const sr = getStrategicReading('FARE', MACRO_AREA_TRAITS.FARE, traits);
              return (
                <div style={{ marginTop: 10, padding: 14, borderLeft: `3px solid ${BRAND_ORANGE}`, background: BG_SUBTLE }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 8 }}>Lettura Strategica</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Impatto:</strong> {sr.impatto}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Rischio:</strong> {sr.rischio}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6 }}>▸ <strong>Opportunità:</strong> {sr.opportunita}</div>
                </div>
              );
            })()}
          </div>

          {/* AVERE */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND_BLUE, marginBottom: 2 }}>AVERE — Relazioni di valore</div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginBottom: 4 }}>Come si relaziona, comunica e influenza gli altri</div>
            <div style={{ fontSize: 10, color: TEXT_BODY, fontStyle: 'italic', marginBottom: 12 }}>
              {getMacroAreaInterpretation('AVERE', macroAreas.avere, candidato.nome)}
            </div>
            {(['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[]).map(t => (
              <PremiumBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            {(() => {
              const sr = getStrategicReading('AVERE', ['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[], traits);
              return (
                <div style={{ marginTop: 10, padding: 14, borderLeft: `3px solid #8b5cf6`, background: BG_SUBTLE }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Lettura Strategica</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Impatto:</strong> {sr.impatto}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, marginBottom: 4 }}>▸ <strong>Rischio:</strong> {sr.rischio}</div>
                  <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6 }}>▸ <strong>Opportunità:</strong> {sr.opportunita}</div>
                </div>
              );
            })()}
          </div>

          {/* INDICATORI */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND_BLUE, marginBottom: 2 }}>INDICATORI</div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginBottom: 12 }}>Resilienza, focus finanziario, orientamento al successo e valori</div>
            {(['RC', 'FIN', 'SUC', 'PRI'] as TraitCode[]).map(t => (
              <PremiumBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200} />
            ))}
          </div>

          {/* Sindromi */}
          {activeSyndromes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <SubTitle>Segnalazioni e Sindromi</SubTitle>
              {activeSyndromes.map(s => {
                const data = SYNDROMES_V5_DATA[s.code];
                return (
                  <AccentBox key={s.code} borderColor={s.severity === 'RED' ? COLOR_RED : s.severity === 'ORANGE' ? COLOR_AMBER : '#fbbf24'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge2
                        text={s.severity}
                        color={s.severity === 'RED' ? '#fff' : '#92400e'}
                        bg={s.severity === 'RED' ? COLOR_RED : s.severity === 'ORANGE' ? '#fed7aa' : '#fef9c3'}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_BODY }}>{data?.name || s.code}</span>
                    </div>
                    <BodyText>{data?.extendedDescription || ''}</BodyText>
                  </AccentBox>
                );
              })}
            </div>
          )}

          {/* Top 5 Compatible Roles */}
          {topRoles.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <SubTitle>Ruoli Compatibili</SubTitle>
              {topRoles.map((r, i) => (
                <div key={r.ruolo} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < topRoles.length - 1 ? `1px solid ${BORDER_LIGHT}` : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BRAND_BLUE}`, color: BRAND_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: FONT_BODY, fontWeight: 500, color: TEXT_BODY }}>{r.ruolo}</div>
                  <div style={{ width: 100 }}>
                    <div style={{ height: 8, background: '#eef1f5', borderRadius: 4 }}>
                      <div style={{ width: `${r.compatibilita}%`, height: '100%', background: getVerdictColor(r.verdict), borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ width: 40, textAlign: 'right', fontSize: FONT_BODY, fontWeight: 700, color: getVerdictColor(r.verdict) }}>{r.compatibilita}%</div>
                </div>
              ))}
            </div>
          )}

          {/* Profilo Tipo Esteso */}
          {profiloExt && (
            <div style={{ marginTop: 24 }}>
              <SubTitle>Profilo Tipo: {profiloExt.emoji} {profiloExt.label}</SubTitle>
              <BodyText>{profiloExt.descrizioneEstesa}</BodyText>
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                <div style={{ flex: 1 }}>
                  <AccentBox borderColor={COLOR_GREEN}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_GREEN, marginBottom: 6 }}>PUNTI DI FORZA</div>
                    {profiloExt.puntiForza.map((p, i) => (
                      <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {p}</div>
                    ))}
                  </AccentBox>
                </div>
                <div style={{ flex: 1 }}>
                  <AccentBox borderColor={COLOR_AMBER}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_AMBER, marginBottom: 6 }}>AREE DI ATTENZIONE</div>
                    {profiloExt.areeAttenzione.map((p, i) => (
                      <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {p}</div>
                    ))}
                  </AccentBox>
                </div>
              </div>
              {profiloExt.comeGestirlo.length > 0 && (
                <AccentBox borderColor={BRAND_BLUE} style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>COME GESTIRLO</div>
                  {profiloExt.comeGestirlo.map((p, i) => (
                    <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {p}</div>
                  ))}
                </AccentBox>
              )}
            </div>
          )}
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ NARRATIVE: Chi è [Nome] — 2-Column Layout ═══════════════ */}
      <Section id="profilo-narrative">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle>Chi è {candidato.nome}</SectionTitle>
          <BodyText style={{ marginBottom: 20 }}>
            Analisi narrativa approfondita dei 15 tratti comportamentali. Per ogni tratto: interpretazione personalizzata, impatto professionale e indicazioni operative per il colloquio.
          </BodyText>

          {/* Chapter 1: Come Pensa */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧠</span> <span>Come Pensa</span>
            </div>
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginBottom: 16 }}>Area ESSERE — Concentrazione sugli obiettivi</div>
            
            {(['ORG', 'AUT', 'GP'] as TraitCode[]).map(code => {
              const val = traits[code] || 0;
              const narrative = getTraitNarrative(code, val, candidato.nome, candidato.sesso || null);
              const fasciaLabel = getFascia(val, TRAIT_NARRATIVES[code]);
              const impact = getTraitOperationalImpact(code, val);
              return (
                <div key={code} style={{ display: 'flex', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  {/* Left column: trait info */}
                  <div style={{ width: 110, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_BODY, marginBottom: 6 }}>{TRAIT_LABELS[code]}</div>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', margin: '0 auto 6px',
                      border: `3px solid ${getTraitColor(val)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: getTraitColor(val),
                    }}>{val}</div>
                    <div style={{ fontSize: FONT_CAPTION, color: getTraitColor(val), fontWeight: 600 }}>{fasciaLabel}</div>
                  </div>
                  {/* Right column: narrative + impact */}
                  <div style={{ flex: 1 }}>
                    {narrative && <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.65, marginBottom: 10 }}>{narrative}</div>}
                    <div style={{ padding: 10, background: BG_SUBTLE, borderLeft: `3px solid ${getTraitColor(val)}`, borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>Impatto Operativo</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>Professionale:</strong> {impact.impatto}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>In colloquio:</strong> {impact.osservare}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55 }}>▸ <strong>Se non gestito:</strong> {impact.seNonGestito}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* GP Special Note */}
            {(() => {
              const gpVal = traits.GP || 0;
              const maxTrait = Math.max(...(Object.entries(traits) as [TraitCode, number][]).filter(([k]) => k !== 'CTRL').map(([, v]) => v));
              const gpSpecial = getGPSpecialNarrative(gpVal, gpVal >= maxTrait, candidato.nome, candidato.sesso || null);
              if (!gpSpecial) return null;
              return (
                <AccentBox borderColor={COLOR_AMBER}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>⚠️ Nota Speciale — Gestione Pressioni</div>
                  <div style={{ fontSize: 10, color: '#78350f', lineHeight: 1.6 }}>{gpSpecial}</div>
                </AccentBox>
              );
            })()}
          </div>

          {/* Chapter 2: Come Agisce */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span> <span>Come Agisce</span>
            </div>
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginBottom: 16 }}>Area FARE — Azioni concrete</div>
            
            {(['ADS', 'DET', 'VEN', 'HRM'] as TraitCode[]).map(code => {
              const val = traits[code] || 0;
              const narrative = getTraitNarrative(code, val, candidato.nome, candidato.sesso || null);
              const fasciaLabel = getFascia(val, TRAIT_NARRATIVES[code]);
              const impact = getTraitOperationalImpact(code, val);
              return (
                <div key={code} style={{ display: 'flex', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ width: 110, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_BODY, marginBottom: 6 }}>{TRAIT_LABELS[code]}</div>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', margin: '0 auto 6px',
                      border: `3px solid ${getTraitColor(val)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: getTraitColor(val),
                    }}>{val}</div>
                    <div style={{ fontSize: FONT_CAPTION, color: getTraitColor(val), fontWeight: 600 }}>{fasciaLabel}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {narrative && <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.65, marginBottom: 10 }}>{narrative}</div>}
                    <div style={{ padding: 10, background: BG_SUBTLE, borderLeft: `3px solid ${getTraitColor(val)}`, borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>Impatto Operativo</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>Professionale:</strong> {impact.impatto}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>In colloquio:</strong> {impact.osservare}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55 }}>▸ <strong>Se non gestito:</strong> {impact.seNonGestito}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter 3: Come si Relaziona */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6d28d9', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👥</span> <span>Come si Relaziona</span>
            </div>
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginBottom: 16 }}>Area AVERE — Relazioni di valore</div>
            
            {(['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[]).map(code => {
              const val = traits[code] || 0;
              const narrative = getTraitNarrative(code, val, candidato.nome, candidato.sesso || null);
              const fasciaLabel = getFascia(val, TRAIT_NARRATIVES[code]);
              const impact = getTraitOperationalImpact(code, val);
              return (
                <div key={code} style={{ display: 'flex', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ width: 110, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_BODY, marginBottom: 6 }}>{TRAIT_LABELS[code]}</div>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', margin: '0 auto 6px',
                      border: `3px solid ${getTraitColor(val)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: getTraitColor(val),
                    }}>{val}</div>
                    <div style={{ fontSize: FONT_CAPTION, color: getTraitColor(val), fontWeight: 600 }}>{fasciaLabel}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {narrative && <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.65, marginBottom: 10 }}>{narrative}</div>}
                    <div style={{ padding: 10, background: BG_SUBTLE, borderLeft: `3px solid ${getTraitColor(val)}`, borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>Impatto Operativo</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>Professionale:</strong> {impact.impatto}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>In colloquio:</strong> {impact.osservare}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55 }}>▸ <strong>Se non gestito:</strong> {impact.seNonGestito}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter 4: Stabilità e Principi */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛡️</span> <span>Stabilità e Principi</span>
            </div>
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginBottom: 16 }}>Indicatori — Resilienza, focus e valori</div>
            
            {(['RC', 'FIN', 'SUC', 'PRI'] as TraitCode[]).map(code => {
              const val = traits[code] || 0;
              const narrative = getTraitNarrative(code, val, candidato.nome, candidato.sesso || null);
              const fasciaLabel = getFascia(val, TRAIT_NARRATIVES[code]);
              const impact = getTraitOperationalImpact(code, val);
              return (
                <div key={code} style={{ display: 'flex', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ width: 110, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_BODY, marginBottom: 6 }}>{TRAIT_LABELS[code]}</div>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', margin: '0 auto 6px',
                      border: `3px solid ${getTraitColor(val)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: getTraitColor(val),
                    }}>{val}</div>
                    <div style={{ fontSize: FONT_CAPTION, color: getTraitColor(val), fontWeight: 600 }}>{fasciaLabel}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {narrative && <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.65, marginBottom: 10 }}>{narrative}</div>}
                    <div style={{ padding: 10, background: BG_SUBTLE, borderLeft: `3px solid ${getTraitColor(val)}`, borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_BLUE, marginBottom: 6 }}>Impatto Operativo</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>Professionale:</strong> {impact.impatto}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55, marginBottom: 3 }}>▸ <strong>In colloquio:</strong> {impact.osservare}</div>
                      <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.55 }}>▸ <strong>Se non gestito:</strong> {impact.seNonGestito}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ GESTIONE ═══════════════ */}
      <Section id="gestione">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle number="03">Area Gestione</SectionTitle>

          {/* Management Tips */}
          {managementTips && managementTips.length > 0 && (
            <>
              <SubTitle>Consigli di Management</SubTitle>
              {managementTips.map((tip, i) => (
                <AccentBox key={i} borderColor={tip.isPriorityOne ? COLOR_RED : BRAND_BLUE}>
                  {tip.isPriorityOne && (
                    <Badge2 text="PRIORITÀ ASSOLUTA" color="#fff" bg={COLOR_RED} />
                  )}
                  <BodyText>{tip.testo}</BodyText>
                </AccentBox>
              ))}
              {managementClosingText && (
                <AccentBox borderColor={BRAND_BLUE} style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: BRAND_BLUE, marginBottom: 4 }}>Nota Importante</div>
                  <BodyText>{managementClosingText}</BodyText>
                </AccentBox>
              )}
            </>
          )}

          {/* Action Plan */}
          {actionPlan && actionPlan.length > 0 && (
            <>
              <SubTitle>Piano d'Azione</SubTitle>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ display: 'flex', borderBottom: `2px solid ${BRAND_BLUE}`, fontSize: FONT_CAPTION, fontWeight: 700, padding: '8px 12px', color: BRAND_BLUE }}>
                  <div style={{ width: 40 }}>P</div>
                  <div style={{ width: 100 }}>Area</div>
                  <div style={{ flex: 1 }}>Azione</div>
                  <div style={{ width: 80 }}>Timeline</div>
                  <div style={{ width: 65 }}>Resp.</div>
                </div>
                {actionPlan.map((a, i) => (
                  <div key={i} style={{ display: 'flex', fontSize: FONT_CAPTION, padding: '6px 12px', borderBottom: `1px solid ${BORDER_LIGHT}`, background: i % 2 === 0 ? '#fff' : BG_SUBTLE }}>
                    <div style={{ width: 40 }}>
                      <Badge2 text={a.priority} color={a.priority === 'P1' ? '#fff' : '#333'} bg={a.priority === 'P1' ? COLOR_RED : a.priority === 'P2' ? '#fed7aa' : '#e5e7eb'} />
                    </div>
                    <div style={{ width: 100, fontWeight: 500, color: TEXT_BODY }}>{a.area}</div>
                    <div style={{ flex: 1, color: TEXT_BODY, lineHeight: 1.5 }}>{a.action}</div>
                    <div style={{ width: 80, color: TEXT_CAPTION }}>{a.timeline}</div>
                    <div style={{ width: 65, color: TEXT_CAPTION }}>{a.responsible}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Growth Plan */}
          {growthPlan && (
            <>
              <SubTitle>Quadro Psicologico</SubTitle>
              <div style={{ marginBottom: 16 }}>
                <AccentBox borderColor={COLOR_RED}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_RED, marginBottom: 4 }}>RADICE DEL PROBLEMA</div>
                  <BodyText>{growthPlan.rootCause}</BodyText>
                </AccentBox>

                <AccentBox borderColor={COLOR_GREEN}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_GREEN, marginBottom: 4 }}>RISORSA NASCOSTA</div>
                  <BodyText>{growthPlan.hiddenResource}</BodyText>
                </AccentBox>

                {growthPlan.viciouscircles.length > 0 && (
                  <AccentBox borderColor={COLOR_AMBER}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_AMBER, marginBottom: 4 }}>CIRCOLI VIZIOSI</div>
                    {growthPlan.viciouscircles.map((c, i) => (
                      <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {c}</div>
                    ))}
                  </AccentBox>
                )}
              </div>

              {growthPlan.phases.length > 0 && (
                <>
                  <SubTitle>Piano di Crescita</SubTitle>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {growthPlan.phases.map((phase, i) => (
                      <div key={i} style={{ flex: 1, padding: 14, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, borderTop: `3px solid ${BRAND_ORANGE}` }}>
                        <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 4 }}>FASE {i + 1}</div>
                        <div style={{ fontSize: FONT_BODY, fontWeight: 600, color: BRAND_BLUE, marginBottom: 6 }}>{phase.name}</div>
                        <div style={{ fontSize: FONT_CAPTION, color: TEXT_BODY, lineHeight: 1.5 }}>{phase.description}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ MAPPA INTERIORE ═══════════════ */}
      {mappaInteriore && (
        <Section id="mappa-interiore">
          <div style={{ padding: PAGE_PADDING }}>
            <SectionTitle number="04">Mappa Interiore</SectionTitle>

            {/* Dimensions */}
            <SubTitle>Panoramica Dimensioni</SubTitle>
            <div style={{ marginBottom: 16 }}>
              {getDimensioniChartData(mappaInteriore).map(dim => (
                <div key={dim.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 140, fontSize: 10, fontWeight: 500, color: TEXT_BODY }}>{dim.name}</div>
                  <div style={{ flex: 1, height: 18, background: '#eef1f5', borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      width: `${dim.value * 10}%`, height: '100%', background: dim.color, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{dim.value}/10</span>
                    </div>
                  </div>
                  <div style={{ width: 170, paddingLeft: 10, color: TEXT_CAPTION, fontSize: FONT_CAPTION }}>{dim.label}</div>
                </div>
              ))}
            </div>

            {/* Pillole */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: 12, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, borderTop: `3px solid ${BRAND_BLUE}` }}>
                <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4 }}>STILE RELAZIONALE</div>
                <div style={{ fontSize: FONT_BODY, color: TEXT_BODY }}>{ATTACCAMENTO_FRONTEND[mappaInteriore.dimensioni.attaccamento.dominante]}</div>
              </div>
              <div style={{ flex: 1, padding: 12, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, borderTop: `3px solid ${BRAND_ORANGE}` }}>
                <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 4 }}>MECCANISMO DI DIFESA</div>
                <div style={{ fontSize: FONT_BODY, color: TEXT_BODY }}>
                  {mappaInteriore.dimensioni.difesa.dominante?.frontend || 'Equilibrate'}
                </div>
              </div>
              <div style={{ flex: 1, padding: 12, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, borderTop: `3px solid #8b5cf6` }}>
                <div style={{ fontSize: FONT_CAPTION, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>BISOGNO PRIMARIO</div>
                <div style={{ fontSize: FONT_BODY, color: TEXT_BODY }}>{mappaInteriore.dimensioni.bisogno.primario.frontend}</div>
              </div>
            </div>

            {/* Narratives */}
            <SubTitle>Chi è {candidato.nome} nel profondo</SubTitle>
            <BodyText>{mappaInteriore.narrativa.chi_e_nel_profondo}</BodyText>

            <SubTitle>Cosa lo guida</SubTitle>
            <BodyText>{mappaInteriore.narrativa.cosa_lo_guida}</BodyText>

            <SubTitle>Cosa lo blocca</SubTitle>
            <BodyText>{mappaInteriore.narrativa.cosa_lo_blocca}</BodyText>

            <SubTitle>Potenziale inespresso</SubTitle>
            <BodyText>{mappaInteriore.narrativa.potenziale_inespresso}</BodyText>

            {/* La Chiave — premium full-width */}
            <div style={{ marginTop: 20, padding: 20, borderLeft: `5px solid ${BRAND_ORANGE}`, background: '#fff', borderRadius: '0 8px 8px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 8, letterSpacing: 1 }}>🔑 LA CHIAVE</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: BRAND_BLUE, lineHeight: 1.6 }}>{mappaInteriore.narrativa.la_chiave}</div>
            </div>

            {/* Motiva / Blocca / Teme */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <div style={{ flex: 1 }}>
                <AccentBox borderColor={COLOR_GREEN}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_GREEN, marginBottom: 6 }}>COSA LO MOTIVA</div>
                  {mappaInteriore.cosa_motiva.map((m, i) => (
                    <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {m}</div>
                  ))}
                </AccentBox>
              </div>
              <div style={{ flex: 1 }}>
                <AccentBox borderColor={COLOR_RED}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_RED, marginBottom: 6 }}>COSA LO BLOCCA</div>
                  {mappaInteriore.cosa_blocca.map((m, i) => (
                    <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {m}</div>
                  ))}
                </AccentBox>
              </div>
              <div style={{ flex: 1 }}>
                <AccentBox borderColor={COLOR_AMBER}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_AMBER, marginBottom: 6 }}>COSA TEME</div>
                  {mappaInteriore.cosa_teme.map((m, i) => (
                    <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 3, lineHeight: 1.5 }}>• {m}</div>
                  ))}
                </AccentBox>
              </div>
            </div>

            {/* Errori da Non Fare */}
            {mappaInteriore.errori_da_evitare.length > 0 && (
              <AccentBox borderColor={COLOR_RED} style={{ marginTop: 16 }}>
                <div style={{ fontSize: FONT_BODY, fontWeight: 700, color: COLOR_RED, marginBottom: 6 }}>🚫 3 Errori da Non Fare Mai</div>
                {mappaInteriore.errori_da_evitare.map((e, i) => (
                  <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 4, lineHeight: 1.5 }}>{i + 1}. {e}</div>
                ))}
              </AccentBox>
            )}

            {/* Pattern Combinatori */}
            {mappaInteriore.pattern_combinatori.length > 0 && (
              <>
                <SubTitle>Pattern Combinatori</SubTitle>
                {mappaInteriore.pattern_combinatori.map((p, i) => (
                  <AccentBox key={i} borderColor={p.positivo ? COLOR_GREEN : COLOR_AMBER}>
                    <div style={{ fontSize: FONT_BODY, fontWeight: 600, color: p.positivo ? COLOR_GREEN : COLOR_AMBER, marginBottom: 4 }}>{p.frontend}</div>
                    <BodyText>{p.azione}</BodyText>
                  </AccentBox>
                ))}
              </>
            )}
          </div>
        </Section>
      )}

      <PageBreak />

      {/* ═══════════════ COLLOQUIO ═══════════════ */}
      <Section id="colloquio">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle number="05">Colloquio</SectionTitle>

          {colloquioAreas && colloquioAreas.length > 0 ? (
            <>
              <SubTitle>Domande Personalizzate per Area</SubTitle>
              {colloquioAreas.map(area => (
                <div key={area.id} style={{ marginBottom: 14, padding: 16, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, borderLeft: `4px solid ${area.priorita === 'ALTA' ? COLOR_RED : COLOR_AMBER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Badge2
                      text={area.priorita}
                      color={area.priorita === 'ALTA' ? '#fff' : '#92400e'}
                      bg={area.priorita === 'ALTA' ? COLOR_RED : COLOR_AMBER}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: BRAND_BLUE }}>{area.area}</span>
                  </div>
                  <div style={{ fontSize: 10, color: TEXT_CAPTION, fontStyle: 'italic', marginBottom: 10 }}>{area.motivazione}</div>
                  {area.domande.map((d, j) => (
                    <div key={j} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 4, paddingLeft: 10, lineHeight: 1.5 }}>
                      {j + 1}. "{d}"
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <BodyText>Il profilo non evidenzia aree che richiedano domande specifiche. Procedere con colloquio standard.</BodyText>
          )}

          {/* Segnali */}
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <AccentBox borderColor={COLOR_RED}>
                <div style={{ fontSize: FONT_BODY, fontWeight: 700, color: COLOR_RED, marginBottom: 8 }}>⚠️ Segnali d'Allarme</div>
                {['Parla male di colleghi o superiori precedenti', 'Non sa dare numeri concreti sui risultati',
                  'Dice "sì" a tutto senza approfondire', 'Si agita quando chiedi dettagli specifici',
                  'Racconta solo successi, mai fallimenti', 'Non fa domande alla fine del colloquio'
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 4, lineHeight: 1.5 }}>• {s}</div>
                ))}
              </AccentBox>
            </div>
            <div style={{ flex: 1 }}>
              <AccentBox borderColor={COLOR_GREEN}>
                <div style={{ fontSize: FONT_BODY, fontWeight: 700, color: COLOR_GREEN, marginBottom: 8 }}>✅ Segnali Positivi</div>
                {['Racconta fallimenti e cosa ha imparato', 'Dà numeri concreti senza esitazione',
                  'Ammette aree di miglioramento', 'Fa domande sulla cultura aziendale',
                  'Parla bene dei colleghi precedenti', 'Ha un piano chiaro per il futuro'
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: 10, color: TEXT_BODY, marginBottom: 4, lineHeight: 1.5 }}>• {s}</div>
                ))}
              </AccentBox>
            </div>
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ METODOLOGIA ═══════════════ */}
      <Section id="metodologia">
        <div style={{ padding: PAGE_PADDING }}>
          <SectionTitle number="06">Metodologia e Dati Tecnici</SectionTitle>

          <SubTitle>Il Metodo TalentProfile 360°</SubTitle>
          <BodyText>
            TalentProfile 360° è un sistema di assessment psicometrico proprietario che analizza 15 tratti comportamentali
            fondamentali + 1 indicatore di controllo (CTRL) attraverso un questionario strutturato di 260 domande a risposta multipla.
          </BodyText>
          <BodyText>
            Il sistema combina l'analisi dei singoli tratti con la rilevazione di pattern combinatori (cross-pattern),
            sindromi comportamentali e una mappa interiore che esplora le dimensioni psicologiche profonde del candidato.
          </BodyText>

          <SubTitle>Significato dei Punteggi</SubTitle>
          <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}` }}>
            {[
              { range: '> 40', label: 'Eccellente', color: COLOR_GREEN, bg: '#f0fdf4' },
              { range: '20 - 40', label: 'Adeguato', color: COLOR_AMBER, bg: '#fffbeb' },
              { range: '0 - 20', label: 'Mediocre', color: BRAND_ORANGE, bg: '#fff7ed' },
              { range: '< 0', label: 'Critico', color: COLOR_RED, bg: '#fef2f2' },
            ].map((s, i) => (
              <div key={s.range} style={{ flex: 1, padding: 12, textAlign: 'center', background: s.bg, borderRight: i < 3 ? `1px solid ${BORDER_LIGHT}` : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.range}</div>
                <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <BodyText>
            I punteggi dei tratti vanno da -100 a +100. Le macro-aree (ESSERE, FARE, AVERE) sono espresse
            in percentuale (0-100%). L'attendibilità del test viene calcolata dalle domande di controllo (CTRL).
          </BodyText>

          <SubTitle>Scale e Macro-Aree</SubTitle>
          <div style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.7 }}>
            <strong>ESSERE</strong> (Concentrazione sugli obiettivi): ORG, AUT, GP<br />
            <strong>FARE</strong> (Azioni concrete): ADS, DET, VEN, HRM<br />
            <strong>AVERE</strong> (Relazioni di valore): LDR, PRO, COM, ESP<br />
            <strong>Indicatori</strong>: RC (Resistenza al Cambiamento), FIN (Finanze), SUC (Successo), PRI (Principi)
          </div>

          {/* Technical data table */}
          <SubTitle>Dati Tecnici del Report</SubTitle>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}` }}>
            {[
              ['Assessment Version', 'V5.0'],
              ['Data Report', today],
              ['Data Test', candidato.data_test ? new Date(candidato.data_test).toLocaleDateString('it-IT') : 'N/D'],
              ['Candidato', fullName],
              ['Età', candidato.eta ? `${candidato.eta} anni` : 'N/D'],
              ['Funzione', candidato.funzione || 'N/D'],
              ['Azienda', candidato.azienda || 'N/D'],
              ['Attendibilità', getReliabilityLabel(reliabilityIndex)],
              ['Profilo Tipo', profiloExt?.label || 'N/D'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: 10, background: i % 2 === 0 ? '#fff' : BG_SUBTLE, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <span style={{ color: TEXT_CAPTION, fontWeight: 500 }}>{k}</span>
                <span style={{ fontWeight: 600, color: TEXT_BODY }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 24, padding: 16, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8 }}>
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, lineHeight: 1.6 }}>
              <strong>Disclaimer:</strong> Questo report è generato automaticamente dal sistema TalentProfile 360° ed è destinato
              esclusivamente ad uso interno dell'azienda richiedente. I risultati del test rappresentano una fotografia comportamentale
              del candidato al momento della compilazione e non costituiscono un giudizio definitivo sulla persona. Si raccomanda
              di utilizzare questo report come uno degli strumenti di valutazione, integrandolo con colloqui e verifiche dirette.
              La distribuzione non autorizzata di questo documento è vietata.
            </div>
          </div>

          {/* Logo watermark */}
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <img src="/talentprofile_logo_v3.png" alt="TalentProfile" style={{ height: 30, opacity: 0.5 }} crossOrigin="anonymous" />
            <div style={{ fontSize: FONT_CAPTION, color: TEXT_CAPTION, marginTop: 4 }}>
              © {new Date().getFullYear()} TalentProfile — Tutti i diritti riservati
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
