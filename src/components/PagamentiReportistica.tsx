import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

function DeltaBadge({ delta, invertColor, currValue, prevValue, formatter }: { delta: number | null; invertColor?: boolean; currValue?: number; prevValue?: number; formatter?: (v: number) => string }) {
  if (delta === null) return null;
  const isPositive = delta >= 0;
  const isGood = invertColor ? !isPositive : isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const fmt = formatter || ((v: number) => String(v));
  const hasDetail = currValue !== undefined && prevValue !== undefined;
  const badge = (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium cursor-default ${isGood ? 'text-green-600' : 'text-destructive'}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? '+' : ''}{delta.toFixed(0)}%
    </span>
  );
  if (!hasDetail) return badge;
  return (
    <TooltipProvider delayDuration={200}>
      <UiTooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Mese corrente: <strong>{fmt(currValue!)}</strong></p>
          <p>Mese precedente: <strong>{fmt(prevValue!)}</strong></p>
        </TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );
}

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
    /* "Conversione Trial→Attivo" era attivi/(attivi+trial): senza trial vale
       sempre 100%, e nel prodotto il trial non esiste. Al suo posto una cosa
       su cui si può agire: chi scade a breve e va richiamato. */
    const fra30Giorni = new Date();
    fra30Giorni.setDate(fra30Giorni.getDate() + 30);
    const oggi = new Date();
    const inScadenza = abbonamenti.filter((a) => {
      if (a.stato !== 'attivo' || !a.data_scadenza) return false;
      const scadenza = new Date(a.data_scadenza);
      return scadenza >= oggi && scadenza <= fra30Giorni;
    }).length;

    // Non è il churn (che è un tasso su un periodo): è la quota di abbonamenti
    // che in questo momento non sono attivi. Chiamarlo churn era sbagliato.
    const quotaNonAttivi = totalAbb > 0 ? Math.round(((scaduti + sospesi) / totalAbb) * 100) : 0;
    const pagamentiFalliti = filteredPagamenti.filter(p => p.stato === 'fallito').length;
    const ricavoTotale = filteredPagamenti.filter(p => p.stato === 'completato').reduce((s, p) => s + Number(p.importo), 0);
    const aziendeConPagamenti = new Set(filteredPagamenti.filter(p => p.stato === 'completato').map(p => p.azienda_id)).size;
    const arpa = aziendeConPagamenti > 0 ? ricavoTotale / aziendeConPagamenti : 0;
    return { totalAbb, inScadenza, quotaNonAttivi, pagamentiFalliti, ricavoTotale, arpa, trial };
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
    const calcDelta = (arr: { value: number }[]) => {
      const prev = arr[4].value, curr = arr[5].value;
      return prev > 0 ? ((curr - prev) / prev) * 100 : null;
    };
    return { ricavo, falliti, arpa, ricavoCumulativo, deltaRicavo: calcDelta(ricavo), deltaFalliti: calcDelta(falliti), deltaArpa: calcDelta(arpa), deltaRicavoCumulativo: calcDelta(ricavoCumulativo) };
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
            <CardTitle className="text-sm font-medium text-muted-foreground">In scadenza entro 30 giorni</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extraMetrics.inScadenza}</div>
            <p className="text-xs text-muted-foreground mt-1">Abbonamenti attivi da rinnovare.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Non più attivi</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{extraMetrics.quotaNonAttivi}%</div>
            <p className="text-xs text-muted-foreground mt-1">Scaduti o sospesi sul totale.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incassato nel mese in corso</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(sparklineData.ricavo[5]?.value ?? 0).toLocaleString('it-IT')}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <DeltaBadge delta={sparklineData.deltaRicavo} currValue={sparklineData.ricavo[5]?.value} prevValue={sparklineData.ricavo[4]?.value} formatter={v => `€${v.toLocaleString('it-IT')}`} />
              <div className="flex-1"><MiniSparkline data={sparklineData.ricavo} color="hsl(142, 71%, 45%)" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagamenti non riusciti</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{extraMetrics.pagamentiFalliti}</div>
            <div className="flex items-center gap-2 mt-1">
              <DeltaBadge delta={sparklineData.deltaFalliti} invertColor currValue={sparklineData.falliti[5]?.value} prevValue={sparklineData.falliti[4]?.value} />
              <div className="flex-1"><MiniSparkline data={sparklineData.falliti} color="hsl(0, 84%, 60%)" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incassato in tutto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.ricavoTotale.toLocaleString('it-IT')}</div>
            <div className="flex items-center gap-2 mt-1">
              <DeltaBadge delta={sparklineData.deltaRicavoCumulativo} currValue={sparklineData.ricavoCumulativo[5]?.value} prevValue={sparklineData.ricavoCumulativo[4]?.value} formatter={v => `€${v.toLocaleString('it-IT')}`} />
              <div className="flex-1"><MiniSparkline data={sparklineData.ricavoCumulativo} color="hsl(142, 71%, 45%)" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incasso medio per azienda</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{extraMetrics.arpa.toFixed(0)}</div>
            <div className="flex items-center gap-2 mt-1">
              <DeltaBadge delta={sparklineData.deltaArpa} currValue={sparklineData.arpa[5]?.value} prevValue={sparklineData.arpa[4]?.value} formatter={v => `€${v.toFixed(0)}`} />
              <div className="flex-1"><MiniSparkline data={sparklineData.arpa} color="hsl(217, 91%, 60%)" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abbonamenti in tutto</CardTitle>
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
