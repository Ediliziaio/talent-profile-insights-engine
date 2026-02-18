import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Abbonamento, StatoAbbonamento } from '@/types/database';

interface Candidato {
  azienda_id: string;
  test_completato: boolean | null;
}

interface PagamentoRecord {
  importo: number;
  stato: string;
  data_pagamento: string;
  azienda_id: string;
}

interface Azienda {
  id: string;
  nome: string;
}

interface Props {
  abbonamenti: Abbonamento[];
  pagamentiAll: PagamentoRecord[];
  candidatiAll: Candidato[];
  aziende: Azienda[];
}

const STATO_BADGE: Record<StatoAbbonamento, { label: string; className: string }> = {
  attivo: { label: 'Attivo', className: 'bg-green-100 text-green-800 border-green-200' },
  trial: { label: 'Trial', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  scaduto: { label: 'Scaduto', className: 'bg-red-100 text-red-800 border-red-200' },
  sospeso: { label: 'Sospeso', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const PIE_COLORS_ABBONAMENTI: Record<string, string> = {
  attivo: 'hsl(142, 71%, 45%)',
  trial: 'hsl(48, 96%, 53%)',
  scaduto: 'hsl(0, 84%, 60%)',
  sospeso: 'hsl(220, 9%, 46%)',
};

const PIE_COLORS_PAGAMENTI: Record<string, string> = {
  completato: 'hsl(142, 71%, 45%)',
  fallito: 'hsl(0, 84%, 60%)',
  in_attesa: 'hsl(48, 96%, 53%)',
  rimborsato: 'hsl(217, 91%, 60%)',
};

const LABELS_PAGAMENTI: Record<string, string> = {
  completato: 'Completato',
  fallito: 'Fallito',
  in_attesa: 'In attesa',
  rimborsato: 'Rimborsato',
};

export function PagamentiReportistica({ abbonamenti, pagamentiAll, candidatiAll, aziende }: Props) {
  // --- KPI aggiuntivi ---
  const extraMetrics = useMemo(() => {
    const totalAbb = abbonamenti.length;
    const attivi = abbonamenti.filter(a => a.stato === 'attivo').length;
    const trial = abbonamenti.filter(a => a.stato === 'trial').length;
    const tassoConversione = (attivi + trial) > 0 ? Math.round((attivi / (attivi + trial)) * 100) : 0;
    const importoMedio = totalAbb > 0
      ? abbonamenti.reduce((s, a) => s + Number(a.importo_mensile), 0) / totalAbb
      : 0;
    const pagamentiFalliti = pagamentiAll.filter(p => p.stato === 'fallito').length;
    return { totalAbb, tassoConversione, importoMedio, pagamentiFalliti };
  }, [abbonamenti, pagamentiAll]);

  // --- Distribuzione stato abbonamenti ---
  const statoAbbonamentiData = useMemo(() => {
    const counts: Record<string, number> = {};
    abbonamenti.forEach(a => { counts[a.stato] = (counts[a.stato] || 0) + 1; });
    return Object.entries(counts).map(([stato, value]) => ({
      name: STATO_BADGE[stato as StatoAbbonamento]?.label || stato,
      value,
      fill: PIE_COLORS_ABBONAMENTI[stato] || 'hsl(220, 9%, 46%)',
    }));
  }, [abbonamenti]);

  // --- Incassi mensili (ultimi 6 mesi) ---
  const incassiMensiliData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = i > 0 ? startOfMonth(subMonths(now, i - 1)) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'MMM yyyy', { locale: it }),
        start,
        end,
      });
    }
    return months.map(m => {
      const totale = pagamentiAll
        .filter(p => p.stato === 'completato')
        .filter(p => {
          const dp = new Date(p.data_pagamento);
          return dp >= m.start && dp < m.end;
        })
        .reduce((s, p) => s + Number(p.importo), 0);
      return { name: m.label, totale };
    });
  }, [pagamentiAll]);

  // --- Stato pagamenti ---
  const statoPagamentiData = useMemo(() => {
    const counts: Record<string, number> = {};
    pagamentiAll.forEach(p => { counts[p.stato] = (counts[p.stato] || 0) + 1; });
    return Object.entries(counts).map(([stato, value]) => ({
      name: LABELS_PAGAMENTI[stato] || stato,
      value,
      fill: PIE_COLORS_PAGAMENTI[stato] || 'hsl(220, 9%, 46%)',
    }));
  }, [pagamentiAll]);

  // --- Utilizzo per azienda ---
  const utilizzoAziendeData = useMemo(() => {
    return aziende.map(az => {
      const cands = candidatiAll.filter(c => c.azienda_id === az.id);
      return { name: az.nome.length > 18 ? az.nome.slice(0, 18) + '…' : az.nome, candidati: cands.length };
    }).sort((a, b) => b.candidati - a.candidati).slice(0, 10);
  }, [aziende, candidatiAll]);

  // --- Tabella riepilogo ---
  const riepilogoData = useMemo(() => {
    return aziende.map(az => {
      const abb = abbonamenti.find(a => a.azienda_id === az.id);
      const cands = candidatiAll.filter(c => c.azienda_id === az.id);
      const completati = cands.filter(c => c.test_completato).length;
      const pagCompletati = pagamentiAll.filter(p => p.azienda_id === az.id && p.stato === 'completato');
      const totalePagato = pagCompletati.reduce((s, p) => s + Number(p.importo), 0);
      return {
        id: az.id,
        nome: az.nome,
        stato: abb?.stato as StatoAbbonamento | undefined,
        candidatiTotali: cands.length,
        candidatiCompletati: completati,
        tassoCompletamento: cands.length > 0 ? Math.round((completati / cands.length) * 100) : 0,
        importoMensile: abb ? Number(abb.importo_mensile) : 0,
        totalePagato,
      };
    }).sort((a, b) => b.candidatiTotali - a.candidatiTotali);
  }, [aziende, abbonamenti, candidatiAll, pagamentiAll]);

  return (
    <div className="space-y-6">
      {/* KPI aggiuntivi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversione Trial→Attivo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extraMetrics.tassoConversione}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abbonamenti Totali</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extraMetrics.totalAbb}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Importo Medio</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.importoMedio.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagamenti Falliti</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{extraMetrics.pagamentiFalliti}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici riga 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Distribuzione Abbonamenti</CardTitle></CardHeader>
          <CardContent>
            {statoAbbonamentiData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nessun dato</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statoAbbonamentiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {statoAbbonamentiData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Incassi Mensili (6 mesi)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incassiMensiliData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, 'Incassi']} />
                <Bar dataKey="totale" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grafici riga 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Stato Pagamenti</CardTitle></CardHeader>
          <CardContent>
            {statoPagamentiData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nessun dato</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statoPagamentiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {statoPagamentiData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Utilizzo per Azienda (Top 10)</CardTitle></CardHeader>
          <CardContent>
            {utilizzoAziendeData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nessun dato</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilizzoAziendeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="candidati" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} name="Candidati" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabella riepilogo */}
      <Card>
        <CardHeader><CardTitle className="text-base">Riepilogo Utilizzo per Azienda</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Azienda</TableHead>
                <TableHead>Stato Abb.</TableHead>
                <TableHead className="text-right">Candidati</TableHead>
                <TableHead className="text-right">Completati</TableHead>
                <TableHead className="text-right">% Compl.</TableHead>
                <TableHead className="text-right">€/mese</TableHead>
                <TableHead className="text-right">Tot. Pagato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riepilogoData.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nessun dato</TableCell></TableRow>
              ) : riepilogoData.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>
                    {r.stato ? (
                      <Badge className={STATO_BADGE[r.stato].className} variant="outline">{STATO_BADGE[r.stato].label}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Nessuno</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{r.candidatiTotali}</TableCell>
                  <TableCell className="text-right">{r.candidatiCompletati}</TableCell>
                  <TableCell className="text-right">{r.tassoCompletamento}%</TableCell>
                  <TableCell className="text-right">€{r.importoMensile.toFixed(0)}</TableCell>
                  <TableCell className="text-right">€{r.totalePagato.toLocaleString('it-IT')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
