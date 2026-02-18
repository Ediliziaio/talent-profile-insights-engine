import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, AlertCircle, TrendingDown, DollarSign, Building } from 'lucide-react';
import { format, subMonths, startOfMonth, differenceInMonths, addMonths } from 'date-fns';
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
  fromDate?: Date;
  toDate?: Date;
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

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (!data || data.length < 2) return null;
  return (
    <div className="mt-1 h-[30px] w-full">
      <ResponsiveContainer width="100%" height={30}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PagamentiReportistica({ abbonamenti, pagamentiAll, candidatiAll, aziende, fromDate, toDate }: Props) {
  // --- Filtered pagamenti by date range ---
  const filteredPagamenti = useMemo(() => {
    if (!fromDate && !toDate) return pagamentiAll;
    return pagamentiAll.filter(p => {
      const d = new Date(p.data_pagamento);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [pagamentiAll, fromDate, toDate]);

  // --- KPI ---
  const extraMetrics = useMemo(() => {
    const totalAbb = abbonamenti.length;
    const attivi = abbonamenti.filter(a => a.stato === 'attivo').length;
    const trial = abbonamenti.filter(a => a.stato === 'trial').length;
    const scaduti = abbonamenti.filter(a => a.stato === 'scaduto').length;
    const sospesi = abbonamenti.filter(a => a.stato === 'sospeso').length;
    const tassoConversione = (attivi + trial) > 0 ? Math.round((attivi / (attivi + trial)) * 100) : 0;
    const churnRate = totalAbb > 0 ? Math.round(((scaduti + sospesi) / totalAbb) * 100) : 0;
    const mrr = abbonamenti.filter(a => a.stato === 'attivo').reduce((s, a) => s + Number(a.importo_mensile), 0);
    const pagamentiFalliti = filteredPagamenti.filter(p => p.stato === 'fallito').length;
    const ricavoTotale = filteredPagamenti.filter(p => p.stato === 'completato').reduce((s, p) => s + Number(p.importo), 0);
    const aziendeConPagamenti = new Set(filteredPagamenti.filter(p => p.stato === 'completato').map(p => p.azienda_id)).size;
    const arpa = aziendeConPagamenti > 0 ? ricavoTotale / aziendeConPagamenti : 0;
    return { totalAbb, tassoConversione, churnRate, mrr, pagamentiFalliti, ricavoTotale, arpa };
  }, [abbonamenti, filteredPagamenti]);

  // --- Sparkline data (last 6 months) ---
  const sparklineData = useMemo(() => {
    const now = new Date();
    const months: { start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = i > 0 ? startOfMonth(subMonths(now, i - 1)) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
      months.push({ start, end });
    }
    const ricavo: { value: number }[] = [];
    const falliti: { value: number }[] = [];
    const arpa: { value: number }[] = [];
    let cumulative = 0;
    const ricavoCumulativo: { value: number }[] = [];
    months.forEach(m => {
      const inRange = pagamentiAll.filter(p => { const dp = new Date(p.data_pagamento); return dp >= m.start && dp < m.end; });
      const rev = inRange.filter(p => p.stato === 'completato').reduce((s, p) => s + Number(p.importo), 0);
      ricavo.push({ value: rev });
      cumulative += rev;
      ricavoCumulativo.push({ value: cumulative });
      falliti.push({ value: inRange.filter(p => p.stato === 'fallito').length });
      const azPaganti = new Set(inRange.filter(p => p.stato === 'completato').map(p => p.azienda_id)).size;
      arpa.push({ value: azPaganti > 0 ? rev / azPaganti : 0 });
    });
    return { ricavo, falliti, arpa, ricavoCumulativo };
  }, [pagamentiAll]);

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

  // --- Dynamic month range for incassi ---
  const incassiMensiliData = useMemo(() => {
    const now = new Date();
    let months: { key: string; label: string; start: Date; end: Date }[] = [];

    if (fromDate || toDate) {
      const rangeStart = startOfMonth(fromDate || subMonths(now, 5));
      const rangeEnd = toDate || now;
      const numMonths = Math.max(1, differenceInMonths(rangeEnd, rangeStart) + 1);
      for (let i = 0; i < numMonths; i++) {
        const d = addMonths(rangeStart, i);
        const start = startOfMonth(d);
        const end = startOfMonth(addMonths(d, 1));
        months.push({ key: format(d, 'yyyy-MM'), label: format(d, 'MMM yy', { locale: it }), start, end });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const start = startOfMonth(d);
        const end = i > 0 ? startOfMonth(subMonths(now, i - 1)) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
        months.push({ key: format(d, 'yyyy-MM'), label: format(d, 'MMM yy', { locale: it }), start, end });
      }
    }

    return months.map(m => {
      const completati = filteredPagamenti.filter(p => p.stato === 'completato').filter(p => { const dp = new Date(p.data_pagamento); return dp >= m.start && dp < m.end; }).reduce((s, p) => s + Number(p.importo), 0);
      return { name: m.label, totale: completati };
    });
  }, [filteredPagamenti, fromDate, toDate]);

  // --- Stato pagamenti (filtered) ---
  const statoPagamentiData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPagamenti.forEach(p => { counts[p.stato] = (counts[p.stato] || 0) + 1; });
    return Object.entries(counts).map(([stato, value]) => ({
      name: LABELS_PAGAMENTI[stato] || stato,
      value,
      fill: PIE_COLORS_PAGAMENTI[stato] || 'hsl(220, 9%, 46%)',
    }));
  }, [filteredPagamenti]);

  // --- Trend Completati vs Falliti (stacked bar) ---
  const trendCompletatiVsFallitiData = useMemo(() => {
    const now = new Date();
    let months: { label: string; start: Date; end: Date }[] = [];

    if (fromDate || toDate) {
      const rangeStart = startOfMonth(fromDate || subMonths(now, 5));
      const rangeEnd = toDate || now;
      const numMonths = Math.max(1, differenceInMonths(rangeEnd, rangeStart) + 1);
      for (let i = 0; i < numMonths; i++) {
        const d = addMonths(rangeStart, i);
        months.push({ label: format(d, 'MMM yy', { locale: it }), start: startOfMonth(d), end: startOfMonth(addMonths(d, 1)) });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        months.push({ label: format(d, 'MMM yy', { locale: it }), start: startOfMonth(d), end: i > 0 ? startOfMonth(subMonths(now, i - 1)) : new Date(now.getFullYear(), now.getMonth() + 1, 1) });
      }
    }

    return months.map(m => {
      const inRange = filteredPagamenti.filter(p => { const dp = new Date(p.data_pagamento); return dp >= m.start && dp < m.end; });
      return {
        name: m.label,
        completati: inRange.filter(p => p.stato === 'completato').length,
        falliti: inRange.filter(p => p.stato === 'fallito').length,
      };
    });
  }, [filteredPagamenti, fromDate, toDate]);

  // --- Utilizzo per azienda ---
  const utilizzoAziendeData = useMemo(() => {
    return aziende.map(az => {
      const cands = candidatiAll.filter(c => c.azienda_id === az.id);
      return { name: az.nome.length > 18 ? az.nome.slice(0, 18) + '…' : az.nome, candidati: cands.length };
    }).sort((a, b) => b.candidati - a.candidati).slice(0, 10);
  }, [aziende, candidatiAll]);

  // --- Tabella riepilogo (con filteredPagamenti) ---
  const riepilogoData = useMemo(() => {
    return aziende.map(az => {
      const abb = abbonamenti.find(a => a.azienda_id === az.id);
      const cands = candidatiAll.filter(c => c.azienda_id === az.id);
      const completati = cands.filter(c => c.test_completato).length;
      const pagCompletati = filteredPagamenti.filter(p => p.azienda_id === az.id && p.stato === 'completato');
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
  }, [aziende, abbonamenti, candidatiAll, filteredPagamenti]);

  return (
    <div className="space-y-6">
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversione Trial→Attivo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{extraMetrics.tassoConversione}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{extraMetrics.churnRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.mrr.toLocaleString('it-IT')}</div>
            <MiniSparkline data={sparklineData.ricavo} color="hsl(142, 71%, 45%)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagamenti Falliti</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{extraMetrics.pagamentiFalliti}</div>
            <MiniSparkline data={sparklineData.falliti} color="hsl(0, 84%, 60%)" />
          </CardContent>
        </Card>
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ricavo Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.ricavoTotale.toLocaleString('it-IT')}</div>
            <MiniSparkline data={sparklineData.ricavoCumulativo} color="hsl(142, 71%, 45%)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ARPA</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.arpa.toFixed(0)}</div>
            <MiniSparkline data={sparklineData.arpa} color="hsl(217, 91%, 60%)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abbonamenti Totali</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{extraMetrics.totalAbb}</div></CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
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
          <CardHeader><CardTitle className="text-base">Incassi Mensili{fromDate || toDate ? ' (filtrato)' : ' (6 mesi)'}</CardTitle></CardHeader>
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

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Stato Pagamenti{fromDate || toDate ? ' (filtrato)' : ''}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Trend Completati vs Falliti</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendCompletatiVsFallitiData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completati" stackId="a" fill="hsl(142, 71%, 45%)" name="Completati" radius={[0, 0, 0, 0]} />
                <Bar dataKey="falliti" stackId="a" fill="hsl(0, 84%, 60%)" name="Falliti" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 3 - Utilizzo */}
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

      {/* Tabella riepilogo */}
      <Card>
        <CardHeader><CardTitle className="text-base">Riepilogo Utilizzo per Azienda{fromDate || toDate ? ' (pagamenti filtrati)' : ''}</CardTitle></CardHeader>
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
