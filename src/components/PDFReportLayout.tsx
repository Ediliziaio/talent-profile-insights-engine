/**
 * PDFReportLayout - Layout ottimizzato per stampa PDF
 * 
 * Componente specifico per generazione PDF professionale:
 * - Header brandizzato
 * - Executive Summary
 * - Sintesi profilo
 * - Tabella 9 ruoli
 * - Raccomandazioni condizionali
 * - Domande colloquio con checkbox
 * - Spazio note
 * - Prossimi passi
 */

import { forwardRef } from 'react';
import { ProfiloTipo, SCALE_LABELS } from '@/types/database';
import { getProfiloDetailedDescription } from '@/lib/profiloDetailedDescriptions';
import { 
  calculateAllRolesCompatibility, 
  getVerdictLabel,
  ROLE_PROFILES,
  FitVerdict 
} from '@/lib/roleMatching';
import { calculateStressZoneSeverity, getStressZoneSeverityLabel } from '@/lib/stressZone';
import { generateInterpretazione } from '@/lib/interpretazioneProfile';

interface PDFReportLayoutProps {
  candidatoNome: string;
  candidatoCognome: string;
  eta?: number | null;
  email?: string | null;
  telefono?: string | null;
  azienda?: string | null;
  ruoloRichiesto: string;
  profiloTipo: ProfiloTipo | null;
  scalePunteggi: Record<string, number>;
  stressZone?: boolean;
  dataTest?: string | null;
}

/**
 * Calcola probabilità successo 12 mesi
 */
function calculateSuccessProbability(
  scalePunteggi: Record<string, number>,
  stressZone: boolean,
  profiloTipo: ProfiloTipo | null,
  ruolo: string
): number {
  const matching = calculateAllRolesCompatibility(ruolo, scalePunteggi);
  let base = matching.ruoloRichiesto.compatibilitaPct;
  
  // Bonus/Malus
  if (stressZone) base -= 15;
  if (matching.ruoloRichiesto.verdict === 'IDONEO') base += 10;
  if (matching.ruoloRichiesto.verdict === 'NON_IDONEO') base -= 15;
  
  const cf = scalePunteggi['CF'] || 100;
  const ec = scalePunteggi['EC'] || 100;
  if (cf >= 130) base += 5;
  if (ec >= 160) base += 5;
  
  return Math.max(20, Math.min(95, base));
}

/**
 * Genera domande colloquio basate su pattern e criticità
 */
function generateInterviewQuestions(
  scalePunteggi: Record<string, number>,
  matching: ReturnType<typeof calculateAllRolesCompatibility>
): string[] {
  const questions: string[] = [];
  
  const qr = scalePunteggi['QR'] || 100;
  const cf = scalePunteggi['CF'] || 100;
  const sc = scalePunteggi['SC'] || 100;
  const sv = scalePunteggi['SV'] || 100;
  const sp = scalePunteggi['SP'] || 100;
  const mo = scalePunteggi['MO'] || 100;
  const pa = scalePunteggi['PA'] || 100;
  
  // Domande basate su aree critiche
  if (qr < 100) {
    questions.push('Mi racconti di una situazione in cui ha dovuto assumersi una responsabilità importante. Come l\'ha gestita?');
    questions.push('Quando le cose vanno male in un progetto, qual è la sua prima reazione? Chi considera responsabile?');
  }
  
  if (cf < 100) {
    questions.push('Come reagisce quando i piani cambiano improvvisamente e senza preavviso?');
    questions.push('Mi descriva un momento in cui ha dovuto gestire più pressioni contemporaneamente. Come ne è uscito?');
  }
  
  if (sc > 160) {
    questions.push('Mi racconti di quando ha dovuto cambiare completamente approccio a un problema. Come si è sentito?');
    questions.push('In un ambiente dove le regole cambiano spesso, come si troverebbe?');
  }
  
  if (sv < 90) {
    questions.push('Come sta gestendo l\'equilibrio tra vita personale e professionale in questo periodo?');
    questions.push('Di quale tipo di supporto avrebbe bisogno nei primi mesi?');
  }
  
  if (sp < 100 && mo > 130) {
    questions.push('Quali sono i suoi obiettivi economici e di carriera per i prossimi 3 anni?');
    questions.push('Cosa la spinge a lavorare con intensità? Quali risultati concreti si aspetta?');
  }
  
  if (pa < 100) {
    questions.push('Come preferisce lavorare: in team o in autonomia? Perché?');
    questions.push('Mi racconti di un conflitto con un collega. Come lo ha risolto?');
  }
  
  // Domande standard sempre utili
  questions.push('Cosa l\'ha attratta di questa posizione specifica?');
  questions.push('Dove si vede tra un anno in questa azienda?');
  
  // Aggiungi domande dai pattern rilevati
  matching.ruoloRichiesto.domandeColloquio.forEach(d => {
    if (!questions.includes(d) && questions.length < 10) {
      questions.push(d);
    }
  });
  
  return questions.slice(0, 8); // Max 8 domande
}

/**
 * Genera raccomandazioni condizionali
 */
function generateConditionalRecommendations(
  scalePunteggi: Record<string, number>,
  verdict: FitVerdict,
  profiloTipo: ProfiloTipo | null
): { condizione: string; azione: string }[] {
  const raccomandazioni: { condizione: string; azione: string }[] = [];
  
  const sc = scalePunteggi['SC'] || 100;
  const cf = scalePunteggi['CF'] || 100;
  const ec = scalePunteggi['EC'] || 100;
  const pa = scalePunteggi['PA'] || 100;
  const sp = scalePunteggi['SP'] || 100;
  const mo = scalePunteggi['MO'] || 100;
  
  if (sc > 160 && cf < 100) {
    raccomandazioni.push({
      condizione: "l'azienda ha bisogno di STABILITÀ e CONTINUITÀ",
      azione: "PROCEDERE con colloquio approfondito su capacità di adattamento"
    });
    raccomandazioni.push({
      condizione: "l'azienda ha bisogno di TRASFORMAZIONE RADICALE",
      azione: "VALUTARE CON CAUTELA - profilo più esecutivo che trasformativo"
    });
  } else if (ec > 160 && pa > 160) {
    raccomandazioni.push({
      condizione: "l'azienda cerca LEADERSHIP e RISULTATI",
      azione: "PROCEDERE con fast-track - profilo ad alto potenziale"
    });
    raccomandazioni.push({
      condizione: "l'azienda ha struttura rigida con poca autonomia",
      azione: "VALUTARE rischio frustrazione - profilo richiede spazio decisionale"
    });
  } else if (mo > 140 && sp < 100) {
    raccomandazioni.push({
      condizione: "il ruolo richiede VENDITA o OBIETTIVI ECONOMICI",
      azione: "NON PROCEDERE - pattern 'Motore a vuoto', manca direzione"
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
  }
  
  return raccomandazioni.slice(0, 3);
}

/**
 * Genera prossimi passi
 */
function generateNextSteps(
  scalePunteggi: Record<string, number>,
  verdict: FitVerdict
): string[] {
  const steps: string[] = [];
  
  const qr = scalePunteggi['QR'] || 100;
  const cf = scalePunteggi['CF'] || 100;
  const sv = scalePunteggi['SV'] || 100;
  
  if (qr < 100) steps.push('Colloquio su esempi di assunzione responsabilità');
  if (cf < 100) steps.push('Verifica gestione stress e imprevisti');
  if (sv < 90) steps.push('Assessment situazione personale');
  
  if (verdict === 'IDONEO') {
    steps.push('Verifica aspettative economiche');
    steps.push('Proposta e negoziazione');
  } else if (verdict === 'IDONEO_CON_RISERVA') {
    steps.push('Secondo colloquio con responsabile diretto');
    steps.push('Piano onboarding con milestones');
  } else if (verdict === 'DA_VALUTARE') {
    steps.push('Assessment approfondito criticità');
    steps.push('Valutazione ruoli alternativi');
  } else {
    steps.push('Comunicazione trasparente motivazioni');
  }
  
  return steps.slice(0, 4);
}

export const PDFReportLayout = forwardRef<HTMLDivElement, PDFReportLayoutProps>(
  function PDFReportLayout(props, ref) {
    const {
      candidatoNome,
      candidatoCognome,
      eta,
      email,
      telefono,
      azienda,
      ruoloRichiesto,
      profiloTipo,
      scalePunteggi,
      stressZone = false,
      dataTest
    } = props;
    
    const profiloInfo = profiloTipo ? getProfiloDetailedDescription(profiloTipo) : null;
    const matching = calculateAllRolesCompatibility(ruoloRichiesto, scalePunteggi);
    const verdict = matching.ruoloRichiesto.verdict;
    const successProb = calculateSuccessProbability(scalePunteggi, stressZone, profiloTipo, ruoloRichiesto);
    
    // Eccellenze e criticità
    const eccellenze = Object.entries(scalePunteggi)
      .filter(([_, v]) => v >= 160)
      .map(([scala, valore]) => ({
        scala,
        label: SCALE_LABELS[scala as keyof typeof SCALE_LABELS] || scala,
        valore
      }));
      
    const criticita = Object.entries(scalePunteggi)
      .filter(([_, v]) => v < 80)
      .map(([scala, valore]) => ({
        scala,
        label: SCALE_LABELS[scala as keyof typeof SCALE_LABELS] || scala,
        valore
      }));
    
    // Genera contenuti
    const interviewQuestions = generateInterviewQuestions(scalePunteggi, matching);
    const recommendations = generateConditionalRecommendations(scalePunteggi, verdict, profiloTipo);
    const nextSteps = generateNextSteps(scalePunteggi, verdict);
    
    // Tutti i ruoli ordinati per compatibilità
    const allRoles = Object.keys(ROLE_PROFILES).map(ruolo => {
      const roleMatching = calculateAllRolesCompatibility(ruolo, scalePunteggi);
      return {
        ruolo,
        compatibilita: roleMatching.ruoloRichiesto.compatibilitaPct,
        verdict: roleMatching.ruoloRichiesto.verdict,
        isRequested: ruolo === ruoloRichiesto,
        isIdeal: matching.ruoloIdeale?.ruolo === ruolo
      };
    }).sort((a, b) => b.compatibilita - a.compatibilita);
    
    const today = new Date().toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    const testDate = dataTest 
      ? new Date(dataTest).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : today;

    return (
      <div 
        ref={ref} 
        className="pdf-report bg-white text-black p-8 w-[210mm] min-h-[297mm]"
        style={{ 
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.5',
          color: '#000'
        }}
      >
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/talentprofile_logo_v3.png" 
              alt="TalentProfile" 
              className="h-10 object-contain"
              crossOrigin="anonymous"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight">REPORT CANDIDATO</h1>
              <p className="text-xs text-gray-600">Analisi Psicometrica V5</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Data Report: {today}</p>
            <p>Data Test: {testDate}</p>
          </div>
        </div>

        {/* ========== ANAGRAFICA ========== */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-bold mb-1">
            {candidatoCognome.toUpperCase()} {candidatoNome}
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
            {eta && <span>Età: {eta} anni</span>}
            <span>Posizione: <strong>{ruoloRichiesto}</strong></span>
            {azienda && <span>Azienda: {azienda}</span>}
            {email && <span>Email: {email}</span>}
            {telefono && <span>Tel: {telefono}</span>}
          </div>
        </div>

        {/* ========== EXECUTIVE SUMMARY ========== */}
        <div className="border-2 border-black rounded-lg p-4 mb-6">
          <div className="flex items-center gap-6">
            {/* Verdict Box */}
            <div 
              className="w-40 h-24 flex flex-col items-center justify-center rounded-lg text-white font-bold"
              style={{ 
                backgroundColor: 
                  verdict === 'IDONEO' ? '#16a34a' :
                  verdict === 'IDONEO_CON_RISERVA' ? '#2563eb' :
                  verdict === 'DA_VALUTARE' ? '#d97706' : '#dc2626'
              }}
            >
              <span className="text-lg leading-tight text-center">
                {getVerdictLabel(verdict)}
              </span>
            </div>
            
            {/* KPIs */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{matching.ruoloRichiesto.compatibilitaPct}%</p>
                <p className="text-xs text-gray-600">Compatibilità Ruolo</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{successProb}%</p>
                <p className="text-xs text-gray-600">Prob. Successo 12m</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {matching.ruoloRichiesto.requisitiSoddisfatti.length}/
                  {matching.ruoloRichiesto.requisitiSoddisfatti.length + matching.ruoloRichiesto.requisitiMancanti.length}
                </p>
                <p className="text-xs text-gray-600">Requisiti OK</p>
              </div>
            </div>
          </div>
          
          {/* Profilo */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-sm">
              <strong>Profilo:</strong> {profiloInfo?.titolo || 'In valutazione'}
              {stressZone && <span className="ml-2 text-red-600 font-bold">⚠ STRESS ZONE ATTIVA</span>}
            </p>
          </div>
        </div>

        {/* ========== SINTESI PROFILO ========== */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            📊 SINTESI DEL PROFILO
          </h3>
          
          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-sm leading-relaxed">
              {candidatoCognome} {candidatoNome}
              {eta ? `, ${eta} anni` : ''}, candidato/a per {ruoloRichiesto}.
              {profiloInfo && (
                <> Profilo: <strong>{profiloInfo.titolo.toUpperCase()}</strong>
                  {eccellenze.length > 0 && (
                    <> con eccellente {eccellenze.slice(0, 2).map(e => e.label.toLowerCase()).join(' e ')}</>
                  )}
                  {criticita.length > 0 && (
                    <>. Limiti: {criticita.slice(0, 2).map(c => c.label.toLowerCase()).join(', ')}</>
                  )}
                  .
                </>
              )}
            </p>
          </div>
          
          {/* Punti di forza e debolezze */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-green-700 mb-2">✓ PUNTI DI FORZA</h4>
              {eccellenze.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {eccellenze.map((e, i) => (
                    <li key={i} className="flex justify-between">
                      <span>✓ {e.label}</span>
                      <span className="font-bold">{e.valore}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nessuna eccellenza rilevata</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-700 mb-2">⚠ AREE DI ATTENZIONE</h4>
              {criticita.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {criticita.map((c, i) => (
                    <li key={i} className="flex justify-between">
                      <span>⚠ {c.label}</span>
                      <span className="font-bold text-amber-700">{c.valore}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nessuna criticità rilevata</p>
              )}
            </div>
          </div>
        </div>

        {/* ========== TABELLA 9 RUOLI ========== */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            📋 COMPATIBILITÀ PER RUOLO
          </h3>
          
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-2 border border-gray-300">Ruolo</th>
                <th className="text-center p-2 border border-gray-300 w-24">%</th>
                <th className="text-center p-2 border border-gray-300 w-36">Verdetto</th>
                <th className="text-center p-2 border border-gray-300 w-20">Note</th>
              </tr>
            </thead>
            <tbody>
              {allRoles.map((role, idx) => (
                <tr 
                  key={idx} 
                  className={role.isRequested ? 'bg-blue-50 font-bold' : role.isIdeal ? 'bg-green-50' : ''}
                >
                  <td className="p-2 border border-gray-300">{role.ruolo}</td>
                  <td className="text-center p-2 border border-gray-300">{role.compatibilita}%</td>
                  <td className="text-center p-2 border border-gray-300">
                    {getVerdictLabel(role.verdict)}
                  </td>
                  <td className="text-center p-2 border border-gray-300 text-xs">
                    {role.isRequested && '◀ RICHIESTO'}
                    {role.isIdeal && !role.isRequested && '★ IDEALE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGE BREAK */}
        <div style={{ pageBreakBefore: 'always' }} />

        {/* ========== RACCOMANDAZIONE OPERATIVA ========== */}
        <div className="mb-6 mt-8">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            📋 RACCOMANDAZIONE OPERATIVA
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((r, idx) => (
              <div key={idx} className="bg-gray-50 rounded p-3">
                <p className="text-xs font-bold text-gray-600 uppercase mb-1">
                  SE {r.condizione}:
                </p>
                <p className="text-sm font-medium">
                  → {r.azione}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== DOMANDE COLLOQUIO ========== */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            💬 DOMANDE SUGGERITE PER IL COLLOQUIO
          </h3>
          
          <div className="space-y-2">
            {interviewQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 border-2 border-gray-400 rounded inline-block mt-0.5" />
                <span>{idx + 1}. {q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== SPAZIO NOTE ========== */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            📝 NOTE COLLOQUIO
          </h3>
          
          <div 
            className="border-2 border-gray-300 rounded-lg p-4 min-h-[120px]"
            style={{ background: 'linear-gradient(#fff 0px, #fff 24px, #e5e7eb 24px, #e5e7eb 25px)', backgroundSize: '100% 25px' }}
          >
            {/* Spazio vuoto per note manuali */}
          </div>
        </div>

        {/* ========== PROSSIMI PASSI ========== */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">
            ✅ PROSSIMI PASSI
          </h3>
          
          <div className="space-y-2">
            {nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 border-2 border-gray-400 rounded inline-block mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex items-center justify-between text-xs text-gray-500">
          <p>Report generato automaticamente - TalentProfile V5</p>
          <img 
            src="/talentprofile_logo_v3.png" 
            alt="TalentProfile" 
            className="h-6 opacity-50"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    );
  }
);
