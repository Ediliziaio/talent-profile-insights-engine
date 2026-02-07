/**
 * PDFSyndromeReportLayout - Layout PDF per Report Sindromi V5
 * 
 * Report multi-pagina professionale con:
 * - Pagina 1: Riepilogo sindromi e livello criticità
 * - Pagine 2-N: Dettaglio per ogni sindrome RED/ORANGE
 * - Pagina finale: Sintesi e azioni
 */

import { SyndromeResult } from '@/lib/syndromes';
import { 
  getSyndromeExtendedData, 
  calculateCriticalityLevel,
  getCriticalityLabel,
  getSeverityTrafficLight,
  SyndromeExtendedData
} from '@/lib/syndromesV5Data';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, ClipboardList, FileText, Users, Ban, MessageCircle, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PDFSyndromeReportLayoutProps {
  candidatoNome: string;
  candidatoCognome: string;
  azienda?: string | null;
  ruoloRichiesto?: string;
  dataTest?: string | null;
  syndromes: SyndromeResult[];
}

// Stili inline per PDF (html2canvas non supporta Tailwind dinamico)
const styles = {
  page: {
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '11px',
    lineHeight: '1.4',
    color: '#1f2937',
    boxSizing: 'border-box' as const,
    pageBreakAfter: 'always' as const,
  },
  lastPage: {
    pageBreakAfter: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8mm',
    paddingBottom: '4mm',
    borderBottom: '2px solid #e5e7eb',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
  },
  candidatoInfo: {
    textAlign: 'right' as const,
    fontSize: '10px',
    color: '#6b7280',
  },
  section: {
    marginBottom: '6mm',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: '4mm',
    paddingBottom: '2mm',
    borderBottom: '1px solid #e5e7eb',
  },
  redBox: {
    backgroundColor: '#fef2f2',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '4mm',
  },
  orangeBox: {
    backgroundColor: '#fff7ed',
    border: '2px solid #ea580c',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '4mm',
  },
  yellowBox: {
    backgroundColor: '#fefce8',
    border: '2px solid #ca8a04',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '4mm',
  },
  syndromeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  syndromeCode: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
  },
  syndromeName: {
    fontSize: '13px',
    fontWeight: '600' as const,
    marginBottom: '8px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 'bold' as const,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  redBadge: {
    backgroundColor: '#fecaca',
    color: '#991b1b',
  },
  orangeBadge: {
    backgroundColor: '#fed7aa',
    color: '#9a3412',
  },
  yellowBadge: {
    backgroundColor: '#fef08a',
    color: '#854d0e',
  },
  paragraph: {
    marginBottom: '8px',
    textAlign: 'justify' as const,
  },
  list: {
    marginLeft: '16px',
    marginBottom: '8px',
  },
  listItem: {
    marginBottom: '4px',
    paddingLeft: '8px',
    position: 'relative' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '6mm',
    fontSize: '10px',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '8px',
    textAlign: 'left' as const,
    fontWeight: 'bold' as const,
    borderBottom: '2px solid #d1d5db',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
  criticalityMeter: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4mm',
  },
  meterSegment: {
    width: '20px',
    height: '24px',
    borderRadius: '4px',
  },
  footer: {
    position: 'absolute' as const,
    bottom: '10mm',
    left: '15mm',
    right: '15mm',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8px',
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '4mm',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '6px',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
  },
  notesArea: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px',
    minHeight: '80px',
    backgroundColor: '#ffffff',
  },
  noteLines: {
    borderBottom: '1px solid #e5e7eb',
    height: '24px',
    marginBottom: '2px',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  subsectionTitle: {
    fontSize: '11px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '4px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }
};

// Componente per la pagina di riepilogo
function SummaryPage({ 
  candidatoNome, 
  candidatoCognome, 
  azienda, 
  ruoloRichiesto,
  dataTest,
  syndromes 
}: PDFSyndromeReportLayoutProps) {
  const activeSyndromes = syndromes.filter(s => s.isActive);
  const criticalityLevel = calculateCriticalityLevel(activeSyndromes.map(s => s.code));
  const criticalityInfo = getCriticalityLabel(criticalityLevel);
  
  const redSyndromes = activeSyndromes.filter(s => s.severity === 'RED');
  const orangeSyndromes = activeSyndromes.filter(s => s.severity === 'ORANGE');
  const yellowSyndromes = activeSyndromes.filter(s => s.severity === 'YELLOW');

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>📋 REPORT SINDROMI COMPORTAMENTALI V5</div>
          <div style={styles.subtitle}>Analisi approfondita dei pattern comportamentali rilevati</div>
        </div>
        <div style={styles.candidatoInfo}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#111827' }}>
            {candidatoCognome} {candidatoNome}
          </div>
          {azienda && <div>{azienda}</div>}
          {ruoloRichiesto && <div>Ruolo: {ruoloRichiesto}</div>}
          {dataTest && <div>Data test: {format(new Date(dataTest), 'dd/MM/yyyy', { locale: it })}</div>}
        </div>
      </div>

      {/* Livello di Criticità */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🚦 LIVELLO DI CRITICITÀ GLOBALE</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          {/* Meter visivo */}
          <div style={styles.criticalityMeter}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
              <div 
                key={level}
                style={{
                  ...styles.meterSegment,
                  backgroundColor: level <= criticalityLevel
                    ? level <= 2 ? '#22c55e'
                    : level <= 4 ? '#eab308'
                    : level <= 6 ? '#f97316'
                    : '#dc2626'
                    : '#e5e7eb',
                  border: level === criticalityLevel ? '2px solid #111827' : 'none',
                }}
              />
            ))}
          </div>
          
          <div>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>LIV {criticalityLevel}</span>
            <span style={{ 
              marginLeft: '12px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: criticalityLevel >= 6 ? '#dc2626' 
                : criticalityLevel >= 4 ? '#f97316'
                : criticalityLevel >= 2 ? '#eab308'
                : '#22c55e'
            }}>
              {criticalityInfo.label}
            </span>
          </div>
        </div>

        {/* Statistiche rapide */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: redSyndromes.length > 0 ? '#fef2f2' : '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {redSyndromes.length}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>CRITICHE (RED)</div>
          </div>
          <div style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: orangeSyndromes.length > 0 ? '#fff7ed' : '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
              {orangeSyndromes.length}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>ATTENZIONE (ORANGE)</div>
          </div>
          <div style={{ 
            flex: 1, 
            padding: '12px', 
            backgroundColor: yellowSyndromes.length > 0 ? '#fefce8' : '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ca8a04' }}>
              {yellowSyndromes.length}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>MONITORARE (YELLOW)</div>
          </div>
        </div>
      </div>

      {/* Tabella Riepilogo Sindromi */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📊 RIEPILOGO SINDROMI RILEVATE</div>
        
        {activeSyndromes.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #86efac'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534' }}>
              ✅ NESSUNA SINDROME RILEVATA
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', marginTop: '8px' }}>
              Il profilo non presenta pattern comportamentali problematici significativi.
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Codice</th>
                <th style={styles.th}>Nome Sindrome</th>
                <th style={styles.th}>Severità</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Sintesi</th>
              </tr>
            </thead>
            <tbody>
              {activeSyndromes.map((syndrome) => {
                const trafficLight = getSeverityTrafficLight(syndrome.severity);
                return (
                  <tr key={syndrome.code}>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{syndrome.code}</td>
                    <td style={styles.td}>{syndrome.name}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(syndrome.severity === 'RED' ? styles.redBadge 
                          : syndrome.severity === 'ORANGE' ? styles.orangeBadge 
                          : styles.yellowBadge)
                      }}>
                        {trafficLight.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {syndrome.category === 'primary' ? 'Primaria' : 'Secondaria'}
                    </td>
                    <td style={{ ...styles.td, fontSize: '9px' }}>{syndrome.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legenda */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📖 LEGENDA SEVERITÀ</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '10px' }}>🔴 RED - CRITICA</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>NON IDONEO nella maggioranza dei casi</div>
          </div>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#fff7ed', borderRadius: '4px', borderLeft: '4px solid #ea580c' }}>
            <div style={{ fontWeight: 'bold', color: '#ea580c', fontSize: '10px' }}>🟠 ORANGE - ATTENZIONE</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>Richiede approfondimento specifico</div>
          </div>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#fefce8', borderRadius: '4px', borderLeft: '4px solid #ca8a04' }}>
            <div style={{ fontWeight: 'bold', color: '#ca8a04', fontSize: '10px' }}>🟡 YELLOW - MONITORARE</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>Da considerare nella valutazione</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div>Report generato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</div>
        <div>DOCUMENTO RISERVATO - TalentProfile V5</div>
        <div>Pagina 1</div>
      </div>
    </div>
  );
}

// Componente per pagina dettaglio sindrome
function SyndromeDetailPage({ 
  syndrome, 
  candidatoNome, 
  candidatoCognome,
  pageNumber
}: { 
  syndrome: SyndromeResult; 
  candidatoNome: string;
  candidatoCognome: string;
  pageNumber: number;
}) {
  const extendedData = getSyndromeExtendedData(syndrome.code);
  if (!extendedData) return null;

  const boxStyle = syndrome.severity === 'RED' ? styles.redBox
    : syndrome.severity === 'ORANGE' ? styles.orangeBox
    : styles.yellowBox;

  const badgeStyle = syndrome.severity === 'RED' ? styles.redBadge
    : syndrome.severity === 'ORANGE' ? styles.orangeBadge
    : styles.yellowBadge;

  return (
    <div style={styles.page}>
      {/* Mini header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '6mm',
        paddingBottom: '3mm',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <div>Report Sindromi V5 - {candidatoCognome} {candidatoNome}</div>
        <div>Dettaglio Sindrome</div>
      </div>

      {/* Box principale sindrome */}
      <div style={boxStyle}>
        <div style={styles.syndromeHeader}>
          <div>
            <span style={{ ...styles.syndromeCode, marginRight: '12px' }}>{syndrome.code}</span>
            <span style={{ ...styles.badge, ...badgeStyle }}>
              {getSeverityTrafficLight(syndrome.severity).label}
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#6b7280' }}>
            {syndrome.category === 'primary' ? 'Sindrome Primaria' : 'Sindrome Secondaria'}
          </span>
        </div>
        <div style={styles.syndromeName}>{extendedData.name}</div>
        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4b5563' }}>
          {extendedData.shortDescription}
        </div>
      </div>

      {/* Descrizione Estesa */}
      <div style={styles.section}>
        <div style={styles.subsectionTitle}>
          <span>📝</span> DESCRIZIONE DETTAGLIATA
        </div>
        <p style={styles.paragraph}>{extendedData.extendedDescription}</p>
      </div>

      {/* Impatto Organizzativo */}
      <div style={styles.section}>
        <div style={styles.subsectionTitle}>
          <span>🏢</span> IMPATTO ORGANIZZATIVO
        </div>
        <p style={styles.paragraph}>{extendedData.organizationalImpact}</p>
      </div>

      {/* Segnali da Osservare */}
      <div style={styles.section}>
        <div style={styles.subsectionTitle}>
          <span>👁️</span> SEGNALI DA OSSERVARE IN COLLOQUIO
        </div>
        <ul style={styles.list}>
          {extendedData.warningSignals.map((signal, idx) => (
            <li key={idx} style={styles.listItem}>• {signal}</li>
          ))}
        </ul>
      </div>

      {/* Domande Specifiche */}
      <div style={styles.section}>
        <div style={styles.subsectionTitle}>
          <span>❓</span> DOMANDE SPECIFICHE DA PORRE
        </div>
        <ol style={{ ...styles.list, listStyleType: 'decimal' }}>
          {extendedData.interviewQuestions.map((question, idx) => (
            <li key={idx} style={{ ...styles.listItem, marginBottom: '6px' }}>
              {idx + 1}. {question}
            </li>
          ))}
        </ol>
      </div>

      {/* Raccomandazioni Gestionali */}
      <div style={styles.section}>
        <div style={styles.subsectionTitle}>
          <span>💡</span> RACCOMANDAZIONI GESTIONALI
        </div>
        <ul style={styles.list}>
          {extendedData.managementTips.map((tip, idx) => (
            <li key={idx} style={styles.listItem}>• {tip}</li>
          ))}
        </ul>
      </div>

      {/* Ruoli Controindicati */}
      <div style={{ 
        ...styles.section, 
        backgroundColor: '#fef2f2', 
        padding: '12px', 
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ ...styles.subsectionTitle, color: '#dc2626' }}>
          <span>🚫</span> RUOLI CONTROINDICATI
        </div>
        <ul style={{ ...styles.list, marginBottom: 0 }}>
          {extendedData.contraindicatedRoles.map((role, idx) => (
            <li key={idx} style={{ ...styles.listItem, color: '#991b1b' }}>✗ {role}</li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div>Report generato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</div>
        <div>DOCUMENTO RISERVATO - TalentProfile V5</div>
        <div>Pagina {pageNumber}</div>
      </div>
    </div>
  );
}

// Componente per pagina finale - Sintesi e Azioni
function ActionPage({ 
  syndromes, 
  candidatoNome, 
  candidatoCognome,
  ruoloRichiesto,
  pageNumber
}: { 
  syndromes: SyndromeResult[];
  candidatoNome: string;
  candidatoCognome: string;
  ruoloRichiesto?: string;
  pageNumber: number;
}) {
  const activeSyndromes = syndromes.filter(s => s.isActive);
  const redSyndromes = activeSyndromes.filter(s => s.severity === 'RED');
  const orangeSyndromes = activeSyndromes.filter(s => s.severity === 'ORANGE');
  const criticalityLevel = calculateCriticalityLevel(activeSyndromes.map(s => s.code));

  return (
    <div style={{ ...styles.page, ...styles.lastPage }}>
      {/* Mini header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '6mm',
        paddingBottom: '3mm',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <div>Report Sindromi V5 - {candidatoCognome} {candidatoNome}</div>
        <div>Sintesi e Azioni</div>
      </div>

      {/* Titolo */}
      <div style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '8mm' }}>
        📋 SINTESI DECISIONALE E AZIONI RACCOMANDATE
      </div>

      {/* Checklist Decisionale */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>✅ CHECKLIST DECISIONALE</div>
        
        <div style={styles.checklistItem}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Sindromi RED presenti: {redSyndromes.length}</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>
              {redSyndromes.length > 0 
                ? `⚠️ ATTENZIONE: ${redSyndromes.map(s => s.code).join(', ')} - Valutare attentamente prima di procedere`
                : '✓ Nessuna sindrome critica rilevata'}
            </div>
          </div>
        </div>

        <div style={styles.checklistItem}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Sindromi ORANGE presenti: {orangeSyndromes.length}</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>
              {orangeSyndromes.length > 0 
                ? `Approfondire: ${orangeSyndromes.map(s => s.code).join(', ')}`
                : '✓ Nessuna sindrome da approfondire'}
            </div>
          </div>
        </div>

        <div style={styles.checklistItem}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Livello criticità globale: LIV {criticalityLevel}</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>
              {criticalityLevel >= 6 ? '⚠️ Livello alto - procedere con cautela'
                : criticalityLevel >= 4 ? '⚡ Livello medio - approfondimenti necessari'
                : '✓ Livello accettabile'}
            </div>
          </div>
        </div>

        {ruoloRichiesto && (
          <div style={styles.checklistItem}>
            <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Compatibilità con ruolo: {ruoloRichiesto}</div>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>
                Verificare che i ruoli controindicati non includano questa posizione
              </div>
            </div>
          </div>
        )}

        <div style={styles.checklistItem}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Domande specifiche poste in colloquio</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>
              Assicurarsi di aver posto tutte le domande elencate per le sindromi rilevate
            </div>
          </div>
        </div>

        <div style={styles.checklistItem}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #9ca3af', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Referenze verificate</div>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>
              Contattare referenze per verificare pattern comportamentali segnalati
            </div>
          </div>
        </div>
      </div>

      {/* Matrice Rischio/Opportunità */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>⚖️ MATRICE RISCHIO / OPPORTUNITÀ</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '8px', fontSize: '12px' }}>
              ⚠️ RISCHI IDENTIFICATI
            </div>
            {activeSyndromes.length === 0 ? (
              <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
                Nessun rischio significativo rilevato
              </div>
            ) : (
              <ul style={{ ...styles.list, fontSize: '10px', marginBottom: 0 }}>
                {activeSyndromes.slice(0, 4).map(s => (
                  <li key={s.code} style={styles.listItem}>• {s.code}: {s.name}</li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ flex: 1, padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
            <div style={{ fontWeight: 'bold', color: '#166534', marginBottom: '8px', fontSize: '12px' }}>
              ✅ OPPORTUNITÀ / MITIGAZIONI
            </div>
            <ul style={{ ...styles.list, fontSize: '10px', marginBottom: 0 }}>
              <li style={styles.listItem}>• Coaching mirato sui pattern rilevati</li>
              <li style={styles.listItem}>• Supervisione iniziale intensiva</li>
              <li style={styles.listItem}>• Obiettivi chiari e misurabili</li>
              <li style={styles.listItem}>• Periodo di prova strutturato</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Piano Onboarding Condizionato */}
      {activeSyndromes.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📋 PIANO ONBOARDING CONDIZIONATO</div>
          <div style={{ backgroundColor: '#fefce8', padding: '12px', borderRadius: '8px', border: '1px solid #fef08a' }}>
            <div style={{ fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Se si decide di procedere con l'assunzione:</div>
              <ol style={{ ...styles.list, listStyleType: 'decimal' }}>
                <li style={styles.listItem}>1. Periodo di prova: 6 mesi con valutazioni mensili</li>
                <li style={styles.listItem}>2. Supervisione: Check settimanali nelle prime 4 settimane</li>
                <li style={styles.listItem}>3. Feedback: Sessioni strutturate ogni 2 settimane</li>
                <li style={styles.listItem}>4. Obiettivi: KPI specifici legati alle aree di rischio</li>
                <li style={styles.listItem}>5. Supporto: Coaching o mentoring se disponibile</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Spazio Note */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📝 SPAZIO NOTE COLLOQUIO</div>
        <div style={styles.notesArea}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={styles.noteLines} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div>Report generato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</div>
        <div>DOCUMENTO RISERVATO - TalentProfile V5</div>
        <div>Pagina {pageNumber}</div>
      </div>
    </div>
  );
}

// Componente principale
export function PDFSyndromeReportLayout(props: PDFSyndromeReportLayoutProps) {
  const { syndromes, candidatoNome, candidatoCognome, ruoloRichiesto } = props;
  const activeSyndromes = syndromes.filter(s => s.isActive);
  
  // Solo sindromi RED e ORANGE hanno pagine dettaglio dedicate
  const syndromesWithDetailPages = activeSyndromes.filter(
    s => s.severity === 'RED' || s.severity === 'ORANGE'
  );

  let currentPage = 2; // Pagina 1 è il riepilogo

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Pagina 1: Riepilogo */}
      <SummaryPage {...props} />

      {/* Pagine 2-N: Dettaglio per ogni RED/ORANGE */}
      {syndromesWithDetailPages.map((syndrome) => {
        const page = currentPage;
        currentPage++;
        return (
          <SyndromeDetailPage 
            key={syndrome.code}
            syndrome={syndrome}
            candidatoNome={candidatoNome}
            candidatoCognome={candidatoCognome}
            pageNumber={page}
          />
        );
      })}

      {/* Pagina Finale: Sintesi e Azioni */}
      <ActionPage 
        syndromes={syndromes}
        candidatoNome={candidatoNome}
        candidatoCognome={candidatoCognome}
        ruoloRichiesto={ruoloRichiesto}
        pageNumber={currentPage}
      />
    </div>
  );
}

export default PDFSyndromeReportLayout;
