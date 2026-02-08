/**
 * InterviewSheetPDF.tsx - SEZIONE 10: Scheda Colloquio Stampabile
 * 
 * Layout PDF A4 compatto per stampare:
 * - Intestazione con nome, ruolo, data, badge attendibilità
 * - Profilo tipo con testo 1 riga
 * - Idoneità con motivazione 1 riga
 * - Max 3 sindromi (1 riga ciascuna)
 * - Mini-grafico a barre semplificato
 * - Forza/Miglioramento (1 riga ciascuno)
 * - 5-10 domande dalla Sezione 7
 * - Area note bianca per appunti
 */

import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { TraitCode, TRAIT_LABELS, ProfiloTipoV5, ReliabilityIndex } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';
import { RoleMatchResultV5 } from '@/lib/roleMatchingV5';
import { getTopStrengths, getTopWeaknesses } from '@/components/StrengthsWeaknessesCardV5';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface InterviewSheetPDFProps {
  candidato: {
    nome: string;
    cognome: string;
    sesso?: string | null;
    ruolo_attuale?: string | null;
    data_test?: string | null;
    funzione?: string | null;
  };
  traits: Record<TraitCode, number>;
  macroAreas: {
    essere: number;
    fare: number;
    avere: number;
  };
  profiloTipo: ProfiloTipoV5;
  reliabilityIndex: ReliabilityIndex;
  syndromes: SyndromeResult[];
  roleMatch?: RoleMatchResultV5;
  interviewQuestions: string[];
}

// Testi brevi per profilo tipo
const PROFILE_TYPE_SHORT: Record<ProfiloTipoV5, string> = {
  LEADER: 'Profilo completo con eccellenza in tutte le aree. Pronto per ruoli di responsabilità.',
  STRATEGIST: 'Forte visione e pensiero strategico. Necessita supporto nell\'esecuzione.',
  EXECUTOR: 'Eccellente nell\'azione e nei risultati. Potrebbe beneficiare di sviluppo strategico.',
  SPECIALIST: 'Competenze verticali di alto livello. Ideale per ruoli tecnici specialistici.',
  GROWTH_POTENTIAL: 'Profilo equilibrato con margini di crescita in tutte le aree.',
  IN_TRANSIZIONE: 'Profilo in evoluzione. Richiede attenzione e supporto specifico.',
  CRITICAL: 'Profilo critico. Verificare attentamente sindromi e pattern rilevati.'
};

// Etichette brevi per profilo tipo
const PROFILE_TYPE_LABEL: Record<ProfiloTipoV5, string> = {
  LEADER: 'Leader',
  STRATEGIST: 'Strategist',
  EXECUTOR: 'Executor',
  SPECIALIST: 'Specialist',
  GROWTH_POTENTIAL: 'Growth Potential',
  IN_TRANSIZIONE: 'In Transizione',
  CRITICAL: 'Critico'
};

// Colori per badge attendibilità
const RELIABILITY_COLORS: Record<ReliabilityIndex, string> = {
  YES: 'bg-green-100 text-green-800 border-green-300',
  CAUTION: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  NO: 'bg-orange-100 text-orange-800 border-orange-300',
  ZERO: 'bg-red-100 text-red-800 border-red-300',
  FORCED: 'bg-purple-100 text-purple-800 border-purple-300'
};

const RELIABILITY_LABELS: Record<ReliabilityIndex, string> = {
  YES: 'Attendibile',
  CAUTION: 'Attenzione',
  NO: 'Non Attendibile',
  ZERO: 'Non Utilizzabile',
  FORCED: 'Risposte Forzate'
};

export const InterviewSheetPDF = forwardRef<HTMLDivElement, InterviewSheetPDFProps>(
  ({ candidato, traits, macroAreas, profiloTipo, reliabilityIndex, syndromes, roleMatch, interviewQuestions }, ref) => {
    const nomeCompleto = `${candidato.nome} ${candidato.cognome}`;
    const dataTest = candidato.data_test 
      ? format(new Date(candidato.data_test), 'd MMMM yyyy', { locale: it })
      : format(new Date(), 'd MMMM yyyy', { locale: it });

    // Prendi solo top 3 sindromi ordinate per severità
    const topSyndromes = [...syndromes]
      .sort((a, b) => {
        const severityOrder: Record<string, number> = { RED: 1, ORANGE: 2, YELLOW: 3 };
        return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
      })
      .slice(0, 3);

    // Top 3 forze e debolezze
    const strengths = getTopStrengths(traits);
    const weaknesses = getTopWeaknesses(traits);

    // Seleziona 8-10 domande chiave
    const selectedQuestions = interviewQuestions.slice(0, 10);

    // Mini barra per visualizzare un valore
    const MiniBar = ({ value, label, color }: { value: number; label: string; color: string }) => (
      <div className="flex items-center gap-2">
        <span className="text-xs w-16 text-right">{label}</span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full`}
            style={{ width: `${Math.min(100, value)}%` }}
          />
        </div>
        <span className="text-xs w-8">{value}%</span>
      </div>
    );

    return (
      <div 
        ref={ref}
        className="bg-white text-black p-6 w-[210mm] min-h-[297mm] font-sans text-sm"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{nomeCompleto}</h1>
              <p className="text-gray-600">
                {candidato.ruolo_attuale || 'Ruolo non specificato'}
                {candidato.funzione && ` • ${candidato.funzione}`}
              </p>
            </div>
            <div className="text-right">
              <Badge className={RELIABILITY_COLORS[reliabilityIndex]}>
                {RELIABILITY_LABELS[reliabilityIndex]}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Test: {dataTest}</p>
            </div>
          </div>
        </div>

        {/* Profilo Tipo */}
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold">Profilo:</span>
            <Badge variant="outline" className="font-medium">
              {PROFILE_TYPE_LABEL[profiloTipo]}
            </Badge>
          </div>
          <p className="text-xs text-gray-700">{PROFILE_TYPE_SHORT[profiloTipo]}</p>
        </div>

        {/* Idoneità al Ruolo */}
        {roleMatch && (
          <div className="mb-4 p-3 border rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold">Idoneità {roleMatch.ruolo}:</span>
              <Badge className={
                roleMatch.verdict === 'IDONEO' ? 'bg-green-100 text-green-800' :
                roleMatch.verdict === 'IDONEO_CON_RISERVA' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {roleMatch.verdict === 'IDONEO_CON_RISERVA' ? 'CON RISERVA' : roleMatch.verdict.replace('_', ' ')}
              </Badge>
              <span className="text-sm ml-auto font-medium">{roleMatch.compatibilitaPct}%</span>
            </div>
            <p className="text-xs text-gray-700">{roleMatch.motivazione}</p>
          </div>
        )}

        {/* Sindromi (max 3) */}
        {topSyndromes.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-sm mb-2">⚠️ Alert Rilevati</h3>
            <div className="space-y-1">
              {topSyndromes.map((syndrome, idx) => {
                const data = SYNDROMES_V5_DATA[syndrome.code];
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Badge className={
                      syndrome.severity === 'RED' ? 'bg-red-100 text-red-800' :
                      syndrome.severity === 'ORANGE' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {syndrome.code}
                    </Badge>
                    <span className="font-medium">{data?.name || syndrome.name}</span>
                    <span className="text-gray-500 truncate">- {data?.shortDescription || syndrome.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mini Grafico Macro-Aree */}
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <h3 className="font-bold text-sm mb-2">Macro-Aree</h3>
          <div className="space-y-2">
            <MiniBar value={macroAreas.essere} label="ESSERE" color="bg-blue-500" />
            <MiniBar value={macroAreas.fare} label="FARE" color="bg-green-500" />
            <MiniBar value={macroAreas.avere} label="AVERE" color="bg-purple-500" />
          </div>
        </div>

        {/* Forza e Miglioramento in colonne */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <h3 className="font-bold text-sm text-green-800 mb-2">✓ Punti di Forza</h3>
            <ol className="list-decimal list-inside text-xs space-y-1">
              {strengths.slice(0, 3).map((s, idx) => (
                <li key={idx}>
                  <span className="font-medium">{TRAIT_LABELS[s.trait]}</span>
                  <span className="text-gray-600"> ({s.value})</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="p-3 bg-orange-50 rounded border border-orange-200">
            <h3 className="font-bold text-sm text-orange-800 mb-2">△ Aree di Miglioramento</h3>
            <ol className="list-decimal list-inside text-xs space-y-1">
              {weaknesses.slice(0, 3).map((w, idx) => (
                <li key={idx}>
                  <span className="font-medium">{TRAIT_LABELS[w.trait]}</span>
                  <span className="text-gray-600"> ({w.value})</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Domande per il Colloquio */}
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-2">📋 Domande Suggerite per il Colloquio</h3>
          <ol className="list-decimal list-inside text-xs space-y-1.5">
            {selectedQuestions.map((question, idx) => (
              <li key={idx} className="text-gray-700">{question}</li>
            ))}
          </ol>
        </div>

        {/* Spazio Note */}
        <div className="border-2 border-gray-300 rounded p-3 min-h-[120px]">
          <h3 className="font-bold text-sm mb-2 text-gray-600">📝 Spazio Note</h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="border-b border-gray-200 h-5" />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t text-xs text-gray-500 flex justify-between">
          <span>TalentProfile 360° v2.0</span>
          <span>Scheda Colloquio - {nomeCompleto}</span>
          <span>{format(new Date(), 'dd/MM/yyyy')}</span>
        </div>
      </div>
    );
  }
);

InterviewSheetPDF.displayName = 'InterviewSheetPDF';
