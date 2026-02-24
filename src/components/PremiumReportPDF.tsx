/**
 * PremiumReportPDF.tsx — Template HTML dedicato per generazione PDF premium
 * 
 * Renderizzato off-screen, catturato sezione per sezione con html2canvas.
 * Tutti gli stili sono inline (necessario per html2canvas).
 * Grafici come barre HTML pure — niente Recharts.
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
import { personalizzaTesto, getFascia } from '@/lib/traitNarrativesV5';

// ─── Colors ─────────────────────────────────────────
const BRAND_BLUE = '#1e3a5f';
const BRAND_ORANGE = '#f09133';
const COLOR_GREEN = '#16A34A';
const COLOR_AMBER = '#D97706';
const COLOR_RED = '#DC2626';
const BG_LIGHT = '#f8f9fa';
const TEXT_BODY = '#444444';
const TEXT_CAPTION = '#888888';
const BORDER_LIGHT = '#e5e7eb';

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

// ─── Helpers ────────────────────────────────────────

function getTraitColor(value: number): string {
  if (value >= 40) return COLOR_GREEN;
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

const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── Section wrapper ────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div data-section={id} style={{ pageBreakInside: 'avoid', marginBottom: 20 }}>
      {children}
    </div>
  );
}

function PageBreak() {
  return <div style={{ pageBreakBefore: 'always', height: 1 }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: BRAND_BLUE, margin: '18px 0 10px 0', paddingBottom: 6, borderBottom: `2px solid ${BRAND_ORANGE}` }}>
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '14px 0 6px 0' }}>{children}</h3>;
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 10, color: TEXT_BODY, lineHeight: 1.6, margin: '4px 0' }}>{children}</p>;
}

// ─── Horizontal bar component ───────────────────────

function HBar({ label, value, max = 100, color, showThreshold, threshold }: {
  label: string; value: number; max?: number; color?: string; showThreshold?: boolean; threshold?: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value + (max === 100 ? 0 : 100)) / (max === 100 ? 100 : 200)) * 100));
  const barColor = color || getTraitColor(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5, fontSize: 9 }}>
      <div style={{ width: 120, flexShrink: 0, color: '#333', fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, height: 14, background: '#eee', borderRadius: 7, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 7, transition: 'width 0.3s' }} />
        {showThreshold && threshold !== undefined && (
          <div style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, ((threshold + 100) / 200) * 100))}%`, top: 0, bottom: 0, width: 2, background: '#000', opacity: 0.4 }} />
        )}
      </div>
      <div style={{ width: 40, textAlign: 'right', fontWeight: 600, color: barColor, flexShrink: 0 }}>{value}</div>
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

  return (
    <div style={{ width: '210mm', fontFamily: 'Helvetica, Arial, sans-serif', color: TEXT_BODY, background: '#fff' }}>

      {/* ═══════════════ PAGE 1: COVER ═══════════════ */}
      <Section id="cover">
        <div style={{ minHeight: '287mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30mm 25mm', position: 'relative' }}>
          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }} />
          
          {/* Logo placeholder */}
          <div style={{ position: 'absolute', top: 20, left: 25 }}>
            <img src="/talentprofile_logo_v3.png" alt="TalentProfile" style={{ height: 40 }} crossOrigin="anonymous" />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: BRAND_ORANGE, fontWeight: 600, textTransform: 'uppercase', marginBottom: 20 }}>
              Analisi Strategica
            </div>
            <div style={{ fontSize: 14, color: TEXT_CAPTION, marginBottom: 30 }}>Profilo Candidato</div>

            <div style={{ fontSize: 36, fontWeight: 800, color: BRAND_BLUE, lineHeight: 1.2, marginBottom: 15 }}>
              {fullName}
            </div>

            {candidato.funzione && (
              <div style={{ fontSize: 16, color: TEXT_BODY, marginBottom: 8 }}>{candidato.funzione}</div>
            )}
            {candidato.azienda && (
              <div style={{ fontSize: 14, color: TEXT_CAPTION, marginBottom: 20 }}>{candidato.azienda}</div>
            )}

            {profiloExt && (
              <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 24, background: BRAND_BLUE, color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 30 }}>
                {profiloExt.emoji} {profiloExt.label}
              </div>
            )}

            <div style={{ width: 80, height: 2, background: BRAND_ORANGE, margin: '30px auto' }} />

            <div style={{ fontSize: 11, color: TEXT_CAPTION }}>
              Report generato il {today}
              {candidato.data_test && <> — Test eseguito il {new Date(candidato.data_test).toLocaleDateString('it-IT')}</>}
            </div>
            <div style={{ fontSize: 10, color: TEXT_CAPTION, marginTop: 6 }}>
              Assessment TalentProfile 360° — v5.0
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BLUE})` }} />
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGE 2: INDEX ═══════════════ */}
      <Section id="index">
        <div style={{ padding: '20mm 25mm', minHeight: '260mm' }}>
          <SectionTitle>Indice</SectionTitle>
          <div style={{ marginTop: 20 }}>
            {[
              { n: '1', title: 'Executive Summary', sub: 'Sintesi del profilo e indicatori chiave' },
              { n: '2', title: 'Profilo Comportamentale', sub: 'Analisi dei 15 tratti, narrativa, sindromi e ruoli compatibili' },
              { n: '3', title: 'Area Gestione', sub: 'Consigli di management, piano d\'azione, quadro psicologico' },
              { n: '4', title: 'Mappa Interiore', sub: 'Dimensioni profonde, pattern, narrative e colloquio' },
              { n: '5', title: 'Colloquio', sub: 'Domande personalizzate, segnali d\'allarme e positivi' },
              { n: '6', title: 'Metodologia', sub: 'Spiegazione del metodo e dati tecnici' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', alignItems: 'baseline', padding: '12px 0', borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ width: 30, fontSize: 18, fontWeight: 700, color: BRAND_ORANGE }}>{item.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND_BLUE }}>{item.title}</div>
                  <div style={{ fontSize: 9, color: TEXT_CAPTION, marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGE 3: EXECUTIVE SUMMARY ═══════════════ */}
      <Section id="executive-summary">
        <div style={{ padding: '15mm 18mm' }}>
          <SectionTitle>1. Executive Summary</SectionTitle>

          {/* Verdict */}
          {roleMatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: BG_LIGHT, borderRadius: 8, marginBottom: 16, border: `1px solid ${BORDER_LIGHT}` }}>
              <div style={{ padding: '6px 16px', borderRadius: 16, background: getVerdictColor(roleMatch.verdict), color: '#fff', fontWeight: 700, fontSize: 12 }}>
                {getVerdictLabel(roleMatch.verdict)}
              </div>
              <div style={{ fontSize: 10, color: TEXT_BODY, flex: 1 }}>{roleMatch.motivazione}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: getVerdictColor(roleMatch.verdict) }}>{roleMatch.compatibilitaPct}%</div>
            </div>
          )}

          {/* Macro Areas */}
          <SubTitle>Macro-Aree</SubTitle>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'ESSERE', value: macroAreas.essere, desc: 'Concentrazione sugli obiettivi' },
              { label: 'FARE', value: macroAreas.fare, desc: 'Azioni concrete' },
              { label: 'AVERE', value: macroAreas.avere, desc: 'Relazioni di valore' },
            ].map(ma => (
              <div key={ma.label} style={{ flex: 1, padding: 12, background: BG_LIGHT, borderRadius: 8, textAlign: 'center', border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 9, color: TEXT_CAPTION, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{ma.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: getTraitColor(ma.value), margin: '4px 0' }}>{ma.value}%</div>
                <div style={{ fontSize: 8, color: TEXT_CAPTION }}>{ma.desc}</div>
                <div style={{ height: 4, background: '#eee', borderRadius: 2, marginTop: 6 }}>
                  <div style={{ width: `${ma.value}%`, height: '100%', background: getTraitColor(ma.value), borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <SubTitle>✅ Top 3 Punti di Forza</SubTitle>
              {strengths.map(([code, val]) => (
                <div key={code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 10 }}>
                  <span>{TRAIT_LABELS[code]}</span>
                  <span style={{ fontWeight: 700, color: COLOR_GREEN }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
              <SubTitle>⚠️ Top 3 Aree di Miglioramento</SubTitle>
              {weaknesses.map(([code, val]) => (
                <div key={code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 10 }}>
                  <span>{TRAIT_LABELS[code]}</span>
                  <span style={{ fontWeight: 700, color: COLOR_RED }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Type + Reliability + Alerts */}
          <div style={{ display: 'flex', gap: 12 }}>
            {profiloExt && (
              <div style={{ flex: 1, padding: 12, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 9, color: TEXT_CAPTION, fontWeight: 600, marginBottom: 4 }}>PROFILO TIPO</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: BRAND_BLUE }}>{profiloExt.emoji} {profiloExt.label}</div>
                <div style={{ fontSize: 9, color: TEXT_BODY, marginTop: 4 }}>{profiloExt.descrizioneBreve}</div>
              </div>
            )}
            <div style={{ width: 140, padding: 12, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
              <div style={{ fontSize: 9, color: TEXT_CAPTION, fontWeight: 600, marginBottom: 4 }}>ATTENDIBILITÀ</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: getReliabilityColor(reliabilityIndex) }}>
                {getReliabilityLabel(reliabilityIndex)}
              </div>
            </div>
          </div>

          {/* Active alerts */}
          {activeSyndromes.length > 0 && (
            <div style={{ marginTop: 14, padding: 12, background: redSyndromes.length > 0 ? '#fef2f2' : '#fffbeb', borderRadius: 8, border: `1px solid ${redSyndromes.length > 0 ? '#fecaca' : '#fde68a'}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: redSyndromes.length > 0 ? COLOR_RED : COLOR_AMBER, marginBottom: 6 }}>
                ⚡ Alert Attivi ({activeSyndromes.length})
              </div>
              {activeSyndromes.slice(0, 5).map(s => {
                const data = SYNDROMES_V5_DATA[s.code];
                return (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, marginBottom: 3 }}>
                    <Badge2
                      text={s.severity}
                      color={s.severity === 'RED' ? '#fff' : '#92400e'}
                      bg={s.severity === 'RED' ? COLOR_RED : s.severity === 'ORANGE' ? '#fed7aa' : '#fef9c3'}
                    />
                    <span>{data?.name || s.code}: {data?.shortDescription || ''}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGES 4-5: PROFILO COMPLETO ═══════════════ */}
      <Section id="profilo-tratti">
        <div style={{ padding: '15mm 18mm' }}>
          <SectionTitle>2. Profilo Comportamentale</SectionTitle>

          {/* Trait bars */}
          <SubTitle>Grafico Tratti Comportamentali</SubTitle>
          <div style={{ background: BG_LIGHT, padding: 14, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
            {/* Macro ESSERE */}
            <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4, letterSpacing: 1 }}>ESSERE — Concentrazione sugli obiettivi</div>
            {MACRO_AREA_TRAITS.ESSERE.map(t => (
              <HBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            <div style={{ height: 10 }} />

            <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4, letterSpacing: 1 }}>FARE — Azioni concrete</div>
            {MACRO_AREA_TRAITS.FARE.map(t => (
              <HBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            <div style={{ height: 10 }} />

            <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4, letterSpacing: 1 }}>AVERE — Relazioni di valore</div>
            {(['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[]).map(t => (
              <HBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200}
                showThreshold={!!roleMatch} threshold={roleMatch?.requisitiSoddisfatti.find(r => r.trait === t)?.soglia ?? roleMatch?.requisitiMancanti.find(r => r.trait === t)?.soglia} />
            ))}
            <div style={{ height: 10 }} />

            <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4, letterSpacing: 1 }}>INDICATORI</div>
            {(['RC', 'FIN', 'SUC', 'PRI'] as TraitCode[]).map(t => (
              <HBar key={t} label={TRAIT_LABELS[t]} value={traits[t] || 0} max={200} />
            ))}
          </div>

          {/* Sindromi */}
          {activeSyndromes.length > 0 && (
            <>
              <SubTitle>Segnalazioni Sindromi</SubTitle>
              <div style={{ background: BG_LIGHT, padding: 12, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                {activeSyndromes.map(s => {
                  const data = SYNDROMES_V5_DATA[s.code];
                  return (
                    <div key={s.code} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <Badge2
                          text={s.severity}
                          color={s.severity === 'RED' ? '#fff' : '#92400e'}
                          bg={s.severity === 'RED' ? COLOR_RED : s.severity === 'ORANGE' ? '#fed7aa' : '#fef9c3'}
                        />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{data?.name || s.code}</span>
                      </div>
                      <BodyText>{data?.extendedDescription || ''}</BodyText>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Top 5 Compatible Roles */}
          {topRoles.length > 0 && (
            <>
              <SubTitle>Ruoli Compatibili (Top 5)</SubTitle>
              <div style={{ background: BG_LIGHT, padding: 12, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                {topRoles.map((r, i) => (
                  <div key={r.ruolo} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < topRoles.length - 1 ? `1px solid ${BORDER_LIGHT}` : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: BRAND_BLUE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 10, fontWeight: 500 }}>{r.ruolo}</div>
                    <div style={{ width: 80 }}>
                      <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
                        <div style={{ width: `${r.compatibilita}%`, height: '100%', background: getVerdictColor(r.verdict), borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ width: 35, textAlign: 'right', fontSize: 10, fontWeight: 700, color: getVerdictColor(r.verdict) }}>{r.compatibilita}%</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Profilo Tipo Esteso */}
          {profiloExt && (
            <>
              <SubTitle>Profilo Tipo: {profiloExt.emoji} {profiloExt.label}</SubTitle>
              <div style={{ background: BG_LIGHT, padding: 14, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <BodyText>{profiloExt.descrizioneEstesa}</BodyText>
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_GREEN, marginBottom: 4 }}>PUNTI DI FORZA</div>
                    {profiloExt.puntiForza.map((p, i) => (
                      <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 2 }}>• {p}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_AMBER, marginBottom: 4 }}>AREE DI ATTENZIONE</div>
                    {profiloExt.areeAttenzione.map((p, i) => (
                      <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 2 }}>• {p}</div>
                    ))}
                  </div>
                </div>
                {profiloExt.comeGestirlo.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4 }}>COME GESTIRLO</div>
                    {profiloExt.comeGestirlo.map((p, i) => (
                      <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 2 }}>• {p}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ PAGES 6-7: GESTIONE ═══════════════ */}
      <Section id="gestione">
        <div style={{ padding: '15mm 18mm' }}>
          <SectionTitle>3. Area Gestione</SectionTitle>

          {/* Management Tips */}
          {managementTips && managementTips.length > 0 && (
            <>
              <SubTitle>Consigli di Management</SubTitle>
              {managementTips.map((tip, i) => (
                <div key={i} style={{
                  padding: 10, marginBottom: 8, borderRadius: 8,
                  background: tip.isPriorityOne ? '#fef2f2' : BG_LIGHT,
                  border: `1px solid ${tip.isPriorityOne ? '#fecaca' : BORDER_LIGHT}`
                }}>
                  {tip.isPriorityOne && (
                    <Badge2 text="PRIORITÀ ASSOLUTA" color="#fff" bg={COLOR_RED} />
                  )}
                  <BodyText>{tip.testo}</BodyText>
                </div>
              ))}
              {managementClosingText && (
                <div style={{ padding: 10, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}`, marginTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: BRAND_BLUE, marginBottom: 4 }}>Nota Importante</div>
                  <BodyText>{managementClosingText}</BodyText>
                </div>
              )}
            </>
          )}

          {/* Action Plan */}
          {actionPlan && actionPlan.length > 0 && (
            <>
              <SubTitle>Piano d'Azione</SubTitle>
              <div style={{ border: `1px solid ${BORDER_LIGHT}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', background: BRAND_BLUE, color: '#fff', fontSize: 8, fontWeight: 700, padding: '6px 10px' }}>
                  <div style={{ width: 35 }}>P</div>
                  <div style={{ width: 90 }}>Area</div>
                  <div style={{ flex: 1 }}>Azione</div>
                  <div style={{ width: 70 }}>Timeline</div>
                  <div style={{ width: 60 }}>Resp.</div>
                </div>
                {actionPlan.map((a, i) => (
                  <div key={i} style={{ display: 'flex', fontSize: 8, padding: '5px 10px', borderBottom: `1px solid ${BORDER_LIGHT}`, background: i % 2 === 0 ? '#fff' : BG_LIGHT }}>
                    <div style={{ width: 35 }}>
                      <Badge2 text={a.priority} color={a.priority === 'P1' ? '#fff' : '#333'} bg={a.priority === 'P1' ? COLOR_RED : a.priority === 'P2' ? '#fed7aa' : '#e5e7eb'} />
                    </div>
                    <div style={{ width: 90, fontWeight: 500 }}>{a.area}</div>
                    <div style={{ flex: 1, color: TEXT_BODY }}>{a.action}</div>
                    <div style={{ width: 70, color: TEXT_CAPTION }}>{a.timeline}</div>
                    <div style={{ width: 60, color: TEXT_CAPTION }}>{a.responsible}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Growth Plan */}
          {growthPlan && (
            <>
              <SubTitle>Quadro Psicologico</SubTitle>
              <div style={{ background: BG_LIGHT, padding: 14, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_RED, marginBottom: 4 }}>RADICE DEL PROBLEMA</div>
                <BodyText>{growthPlan.rootCause}</BodyText>

                <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_GREEN, marginBottom: 4, marginTop: 10 }}>RISORSA NASCOSTA</div>
                <BodyText>{growthPlan.hiddenResource}</BodyText>

                {growthPlan.viciouscircles.length > 0 && (
                  <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_AMBER, marginBottom: 4, marginTop: 10 }}>CIRCOLI VIZIOSI</div>
                    {growthPlan.viciouscircles.map((c, i) => (
                      <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 2 }}>• {c}</div>
                    ))}
                  </>
                )}
              </div>

              {growthPlan.phases.length > 0 && (
                <>
                  <SubTitle>Piano di Crescita 4 Fasi</SubTitle>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {growthPlan.phases.map((phase, i) => (
                      <div key={i} style={{ flex: 1, padding: 10, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 4 }}>FASE {i + 1}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: BRAND_BLUE, marginBottom: 4 }}>{phase.name}</div>
                        <div style={{ fontSize: 8, color: TEXT_BODY, lineHeight: 1.5 }}>{phase.description}</div>
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

      {/* ═══════════════ PAGES 8-9: MAPPA INTERIORE ═══════════════ */}
      {mappaInteriore && (
        <Section id="mappa-interiore">
          <div style={{ padding: '15mm 18mm' }}>
            <SectionTitle>4. Mappa Interiore</SectionTitle>

            {/* Dimensions chart */}
            <SubTitle>Panoramica Dimensioni</SubTitle>
            <div style={{ background: BG_LIGHT, padding: 14, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}`, marginBottom: 14 }}>
              {getDimensioniChartData(mappaInteriore).map(dim => (
                <div key={dim.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 9 }}>
                  <div style={{ width: 130, fontWeight: 500, color: '#333' }}>{dim.name}</div>
                  <div style={{ flex: 1, height: 16, background: '#eee', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${dim.value * 10}%`, height: '100%', background: dim.color, borderRadius: 8 }} />
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontWeight: 600, color: dim.color }}>{dim.value}/10</div>
                  <div style={{ width: 160, paddingLeft: 8, color: TEXT_CAPTION, fontSize: 8 }}>{dim.label}</div>
                </div>
              ))}
            </div>

            {/* Pillole */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, padding: 10, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4 }}>STILE RELAZIONALE</div>
                <div style={{ fontSize: 10, color: TEXT_BODY }}>{ATTACCAMENTO_FRONTEND[mappaInteriore.dimensioni.attaccamento.dominante]}</div>
              </div>
              <div style={{ flex: 1, padding: 10, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4 }}>MECCANISMO DI DIFESA</div>
                <div style={{ fontSize: 10, color: TEXT_BODY }}>
                  {mappaInteriore.dimensioni.difesa.dominante?.frontend || 'Equilibrate'}
                </div>
              </div>
              <div style={{ flex: 1, padding: 10, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: BRAND_BLUE, marginBottom: 4 }}>BISOGNO PRIMARIO</div>
                <div style={{ fontSize: 10, color: TEXT_BODY }}>{mappaInteriore.dimensioni.bisogno.primario.frontend}</div>
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

            {/* La Chiave */}
            <div style={{ marginTop: 12, padding: 14, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_ORANGE, marginBottom: 6 }}>🔑 LA CHIAVE</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#333', fontStyle: 'italic' }}>{mappaInteriore.narrativa.la_chiave}</div>
            </div>

            {/* Motiva / Blocca / Teme */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{ flex: 1, padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_GREEN, marginBottom: 6 }}>COSA LO MOTIVA</div>
                {mappaInteriore.cosa_motiva.map((m, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 10, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_RED, marginBottom: 6 }}>COSA LO BLOCCA</div>
                {mappaInteriore.cosa_blocca.map((m, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 10, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLOR_AMBER, marginBottom: 6 }}>COSA TEME</div>
                {mappaInteriore.cosa_teme.map((m, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
            </div>

            {/* Errori da Non Fare */}
            {mappaInteriore.errori_da_evitare.length > 0 && (
              <div style={{ marginTop: 14, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_RED, marginBottom: 6 }}>🚫 3 Errori da Non Fare Mai</div>
                {mappaInteriore.errori_da_evitare.map((e, i) => (
                  <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 4 }}>{i + 1}. {e}</div>
                ))}
              </div>
            )}

            {/* Pattern Combinatori */}
            {mappaInteriore.pattern_combinatori.length > 0 && (
              <>
                <SubTitle>Pattern Combinatori</SubTitle>
                {mappaInteriore.pattern_combinatori.map((p, i) => (
                  <div key={i} style={{ padding: 10, marginBottom: 6, background: p.positivo ? '#f0fdf4' : '#fffbeb', borderRadius: 8, border: `1px solid ${p.positivo ? '#bbf7d0' : '#fde68a'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: p.positivo ? COLOR_GREEN : COLOR_AMBER, marginBottom: 3 }}>{p.frontend}</div>
                    <BodyText>{p.azione}</BodyText>
                  </div>
                ))}
              </>
            )}
          </div>
        </Section>
      )}

      <PageBreak />

      {/* ═══════════════ PAGES 10-11: COLLOQUIO ═══════════════ */}
      <Section id="colloquio">
        <div style={{ padding: '15mm 18mm' }}>
          <SectionTitle>5. Colloquio</SectionTitle>

          {colloquioAreas && colloquioAreas.length > 0 ? (
            <>
              <SubTitle>Domande Personalizzate per Area</SubTitle>
              {colloquioAreas.map(area => (
                <div key={area.id} style={{
                  padding: 12, marginBottom: 10, borderRadius: 8,
                  background: area.priorita === 'ALTA' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${area.priorita === 'ALTA' ? '#fecaca' : '#fde68a'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Badge2
                      text={area.priorita}
                      color={area.priorita === 'ALTA' ? '#fff' : '#92400e'}
                      bg={area.priorita === 'ALTA' ? COLOR_RED : COLOR_AMBER}
                    />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{area.area}</span>
                  </div>
                  <div style={{ fontSize: 9, color: TEXT_CAPTION, fontStyle: 'italic', marginBottom: 6 }}>{area.motivazione}</div>
                  {area.domande.map((d, j) => (
                    <div key={j} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3, paddingLeft: 8 }}>
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
          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <div style={{ flex: 1, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_RED, marginBottom: 6 }}>⚠️ Segnali d'Allarme</div>
              {['Parla male di colleghi o superiori precedenti', 'Non sa dare numeri concreti sui risultati',
                'Dice "sì" a tutto senza approfondire', 'Si agita quando chiedi dettagli specifici',
                'Racconta solo successi, mai fallimenti', 'Non fa domande alla fine del colloquio'
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3 }}>• {s}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLOR_GREEN, marginBottom: 6 }}>✅ Segnali Positivi</div>
              {['Racconta fallimenti e cosa ha imparato', 'Dà numeri concreti senza esitazione',
                'Ammette aree di miglioramento', 'Fa domande sulla cultura aziendale',
                'Parla bene dei colleghi precedenti', 'Ha un piano chiaro per il futuro'
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 9, color: TEXT_BODY, marginBottom: 3 }}>• {s}</div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <PageBreak />

      {/* ═══════════════ LAST PAGE: METHODOLOGY ═══════════════ */}
      <Section id="metodologia">
        <div style={{ padding: '15mm 18mm' }}>
          <SectionTitle>6. Metodologia e Dati Tecnici</SectionTitle>

          <div style={{ background: BG_LIGHT, padding: 16, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}`, marginBottom: 14 }}>
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {[
                { range: '> 40', label: 'Eccellente', color: COLOR_GREEN },
                { range: '20 - 40', label: 'Adeguato', color: COLOR_AMBER },
                { range: '0 - 20', label: 'Mediocre', color: BRAND_ORANGE },
                { range: '< 0', label: 'Critico', color: COLOR_RED },
              ].map(s => (
                <div key={s.range} style={{ flex: 1, padding: 8, background: '#fff', borderRadius: 6, textAlign: 'center', border: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.range}</div>
                  <div style={{ fontSize: 8, color: TEXT_CAPTION }}>{s.label}</div>
                </div>
              ))}
            </div>
            <BodyText>
              I punteggi dei tratti vanno da -100 a +100. Le macro-aree (ESSERE, FARE, AVERE) sono espresse
              in percentuale (0-100%). L'attendibilità del test viene calcolata dalle domande di controllo (CTRL).
            </BodyText>

            <SubTitle>Scale e Macro-Aree</SubTitle>
            <div style={{ fontSize: 9, color: TEXT_BODY, lineHeight: 1.6 }}>
              <strong>ESSERE</strong> (Concentrazione sugli obiettivi): ORG, AUT, GP<br />
              <strong>FARE</strong> (Azioni concrete): ADS, DET, VEN, HRM<br />
              <strong>AVERE</strong> (Relazioni di valore): LDR, PRO, COM, ESP<br />
              <strong>Indicatori</strong>: RC (Resistenza al Cambiamento), FIN (Finanze), SUC (Successo), PRI (Principi)
            </div>
          </div>

          {/* Technical data */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, padding: 12, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 8 }}>DATI TECNICI</div>
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
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 9, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <span style={{ color: TEXT_CAPTION }}>{k}</span>
                  <span style={{ fontWeight: 500, color: '#333' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20, padding: 14, background: BG_LIGHT, borderRadius: 8, border: `1px solid ${BORDER_LIGHT}` }}>
            <div style={{ fontSize: 8, color: TEXT_CAPTION, lineHeight: 1.5 }}>
              <strong>Disclaimer:</strong> Questo report è generato automaticamente dal sistema TalentProfile 360° ed è destinato
              esclusivamente ad uso interno dell'azienda richiedente. I risultati del test rappresentano una fotografia comportamentale
              del candidato al momento della compilazione e non costituiscono un giudizio definitivo sulla persona. Si raccomanda
              di utilizzare questo report come uno degli strumenti di valutazione, integrandolo con colloqui e verifiche dirette.
              La distribuzione non autorizzata di questo documento è vietata.
            </div>
          </div>

          {/* Logo watermark */}
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <img src="/talentprofile_logo_v3.png" alt="TalentProfile" style={{ height: 30, opacity: 0.6 }} crossOrigin="anonymous" />
            <div style={{ fontSize: 8, color: TEXT_CAPTION, marginTop: 4 }}>
              © {new Date().getFullYear()} TalentProfile — Tutti i diritti riservati
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
