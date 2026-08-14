import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, ClipboardCheck, Clock, Target, TrendingUp, Eye, ArrowRight, 
  Building2, AlertTriangle, UserCheck, UserX, Percent, BarChart3, Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<string>('all');

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';
  const currentAziendaId = profile?.azienda_id;

  // Get date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'week': return subDays(now, 7);
      case 'month': return subMonths(now, 1);
      case '3months': return subMonths(now, 3);
      case 'year': return subMonths(now, 12);
      default: return null;
    }
  }, [period]);

  // Single consolidated query for all dashboard data
  const { data: dashboardData, isLoading: isLoadingData } = useQuery({
    queryKey: ['dashboard-data', currentAziendaId, isSuperadmin, period],
    queryFn: async () => {
      // Filtri lato server: prima si scaricava tutto e si filtrava nel client,
      // il che scala col totale dei candidati invece che col periodo osservato
      // (e per le aziende contava sulla sola RLS: l'eq è anche difesa in più).
      let candidatiQuery = supabase
        .from('candidati')
        .select('*, aziende(nome), analisi_candidato(fit_score, fit_verdict), profili_candidato(leadership_pct, maturita_pct, potenziale_pct)')
        .order('created_at', { ascending: false });

      if (!isSuperadmin && currentAziendaId) {
        candidatiQuery = candidatiQuery.eq('azienda_id', currentAziendaId);
      }
      if (dateRange) {
        candidatiQuery = candidatiQuery.gte('created_at', dateRange.toISOString());
      }

      const [candidatiResult, aziendeResult] = await Promise.all([
        candidatiQuery,
        isSuperadmin
          ? supabase.from('aziende').select('*, candidati(id, test_completato)')
          : Promise.resolve({ data: null, error: null })
      ]);

      if (candidatiResult.error) throw candidatiResult.error;

      return {
        candidati: candidatiResult.data || [],
        aziende: aziendeResult.data || []
      };
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  /* Memoizzati: senza, il fallback `|| []` crea un array nuovo a ogni render
     e invalida tutti gli useMemo a valle (stats, trend, grafici, code). */
  const allCandidati = useMemo(() => dashboardData?.candidati ?? [], [dashboardData]);
  const aziende = useMemo(() => dashboardData?.aziende ?? [], [dashboardData]);

  // Statistiche calcolate
  const stats = useMemo(() => {
    if (!allCandidati) return null;
    
    const totale = allCandidati.length;
    const completati = allCandidati.filter(c => c.test_completato).length;
    const inAttesa = totale - completati;
    const tassoCompletamento = totale > 0 ? Math.round((completati / totale) * 100) : 0;
    
    const analisi = allCandidati
      .map(c => (c.analisi_candidato as any)?.[0])
      .filter(Boolean);
    
    const fitScores = analisi.map(a => a.fit_score).filter((s): s is number => s !== null);
    const avgFitScore = fitScores.length > 0 
      ? Math.round(fitScores.reduce((a, b) => a + b, 0) / fitScores.length)
      : null;

    const idonei = analisi.filter(a => a.fit_verdict === 'IDONEO').length;
    const valutare = analisi.filter(a => a.fit_verdict === 'VALUTARE').length;
    const nonIdonei = analisi.filter(a => a.fit_verdict === 'NON_IDONEO').length;

    return {
      totale,
      completati,
      inAttesa,
      tassoCompletamento,
      avgFitScore,
      idonei,
      valutare,
      nonIdonei,
    };
  }, [allCandidati]);

  // Stats per aziende (solo superadmin)
  const aziendeStats = useMemo(() => {
    if (!aziende) return null;
    
    const totale = aziende.length;
    const attive = aziende.filter(a => a.attiva).length;
    const disattive = totale - attive;
    const totCandidati = aziende.reduce((sum, a) => sum + ((a.candidati as any[])?.length || 0), 0);
    const mediaCandidati = totale > 0 ? Math.round(totCandidati / totale) : 0;

    return { totale, attive, disattive, totCandidati, mediaCandidati };
  }, [aziende]);

  // Trend data (candidati per giorno negli ultimi 30 giorni)
  const trendData = useMemo(() => {
    if (!allCandidati) return [];
    
    const days = 30;
    const data: { date: string; nuovi: number; completati: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM', { locale: it });
      
      const nuovi = allCandidati.filter(c => 
        c.created_at && format(parseISO(c.created_at), 'yyyy-MM-dd') === dateStr
      ).length;
      
      const completati = allCandidati.filter(c => 
        c.data_test && format(parseISO(c.data_test), 'yyyy-MM-dd') === dateStr
      ).length;
      
      data.push({ date: displayDate, nuovi, completati });
    }
    
    return data;
  }, [allCandidati]);

  // Distribuzione per funzione
  const funzioneData = useMemo(() => {
    if (!allCandidati) return [];
    
    const counts: Record<string, number> = {};
    allCandidati.forEach(c => {
      const funzione = c.funzione || 'Non specificato';
      counts[funzione] = (counts[funzione] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [allCandidati]);

  // Distribuzione età
  const etaData = useMemo(() => {
    if (!allCandidati) return [];
    
    const ranges = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0, 'N/D': 0 };
    
    allCandidati.forEach(c => {
      if (!c.eta) {
        ranges['N/D']++;
      } else if (c.eta <= 30) {
        ranges['18-30']++;
      } else if (c.eta <= 45) {
        ranges['31-45']++;
      } else if (c.eta <= 60) {
        ranges['46-60']++;
      } else {
        ranges['60+']++;
      }
    });
    
    return Object.entries(ranges)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [allCandidati]);

  // Distribuzione fit score
  const fitDistribution = useMemo(() => {
    if (!allCandidati) return [];
    
    const ranges = { '0-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    
    allCandidati.forEach(c => {
      const score = (c.analisi_candidato as any)?.[0]?.fit_score;
      if (score === null || score === undefined) return;
      
      if (score <= 40) ranges['0-40']++;
      else if (score <= 60) ranges['41-60']++;
      else if (score <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });
    
    return Object.entries(ranges)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [allCandidati]);

  // Derive recent candidati and top performers from allCandidati (no extra queries!)
  const recentCandidati = useMemo(() => {
    if (!allCandidati.length) return [];
    return allCandidati
      .filter(c => c.test_completato)
      .sort((a, b) => {
        const dateA = a.data_test ? new Date(a.data_test).getTime() : 0;
        const dateB = b.data_test ? new Date(b.data_test).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(c => ({
        ...c,
        analisi: (c.analisi_candidato as any)?.[0] || null
      }));
  }, [allCandidati]);

  /* Coda di lavoro dell'impresa: la dashboard mostrava solo numeri, ma chi
     apre la mattina vuole sapere cosa deve fare. Tre code, calcolate sui dati
     già in memoria: nessuna query aggiuntiva. */
  const daFare = useMemo(() => {
    if (!allCandidati.length) return null;
    const ora = Date.now();
    const giorni = (d: string | null) => (d ? (ora - new Date(d).getTime()) / 86_400_000 : Infinity);

    // Test finiti negli ultimi 7 giorni: i report ancora "caldi" da leggere
    const daLeggere = allCandidati
      .filter((c) => c.test_completato && giorni(c.data_test) <= 7)
      .sort((a, b) => (b.data_test ?? '').localeCompare(a.data_test ?? ''));

    // Invitati da più di 5 giorni che non hanno ancora fatto il test
    const daSollecitare = allCandidati
      .filter((c) => !c.test_completato && giorni(c.created_at) > 5)
      .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));

    return { daLeggere, daSollecitare };
  }, [allCandidati]);

  const topPerformers = useMemo(() => {
    if (!allCandidati.length) return [];
    return allCandidati
      .filter(c => (c.analisi_candidato as any)?.[0]?.fit_score !== null)
      .sort((a, b) => {
        const scoreA = (a.analisi_candidato as any)?.[0]?.fit_score || 0;
        const scoreB = (b.analisi_candidato as any)?.[0]?.fit_score || 0;
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(c => ({
        fit_score: (c.analisi_candidato as any)?.[0]?.fit_score,
        fit_verdict: (c.analisi_candidato as any)?.[0]?.fit_verdict,
        candidati: c
      }));
  }, [allCandidati]);

  // Query per duplicati cross-azienda (solo superadmin)
  const { data: duplicates } = useQuery({
    queryKey: ['dashboard-duplicates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidati')
        .select('id, email, telefono, nome, cognome, azienda_id, aziende(nome)');
      
      if (error) throw error;
      
      // Find duplicates
      const emailMap = new Map<string, typeof data>();
      const phoneMap = new Map<string, typeof data>();
      
      data?.forEach(c => {
        if (c.email) {
          const key = c.email.toLowerCase();
          if (!emailMap.has(key)) emailMap.set(key, []);
          emailMap.get(key)!.push(c);
        }
        if (c.telefono) {
          if (!phoneMap.has(c.telefono)) phoneMap.set(c.telefono, []);
          phoneMap.get(c.telefono)!.push(c);
        }
      });
      
      const duplicateGroups: Array<{ type: string; value: string; candidates: typeof data }> = [];
      
      emailMap.forEach((candidates, email) => {
        const uniqueAziende = new Set(candidates.map(c => c.azienda_id));
        if (uniqueAziende.size > 1) {
          duplicateGroups.push({ type: 'email', value: email, candidates });
        }
      });
      
      phoneMap.forEach((candidates, phone) => {
        const uniqueAziende = new Set(candidates.map(c => c.azienda_id));
        if (uniqueAziende.size > 1) {
          duplicateGroups.push({ type: 'telefono', value: phone, candidates });
        }
      });
      
      return duplicateGroups.slice(0, 5);
    },
    enabled: isSuperadmin && !!profile,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const statusData = stats ? [
    { name: 'Completati', value: stats.completati, color: 'hsl(142, 76%, 36%)' },
    { name: 'In Attesa', value: stats.inAttesa, color: 'hsl(38, 92%, 50%)' },
  ] : [];

  const verdictData = stats ? [
    { name: 'Idoneo', value: stats.idonei, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Valutare', value: stats.valutare, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Non Idoneo', value: stats.nonIdonei, fill: 'hsl(0, 84%, 60%)' },
  ] : [];

  const getVerdictBadge = (verdict: string | null) => {
    switch (verdict) {
      case 'IDONEO':
        return <Badge className="bg-success text-success-foreground">Idoneo</Badge>;
      case 'VALUTARE':
        return <Badge className="bg-warning text-warning-foreground">Valutare</Badge>;
      case 'NON_IDONEO':
        return <Badge variant="destructive">Non Idoneo</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <NotionLayout>
      <div className="space-y-4 sm:space-y-6 pb-4">
        {/* Header with period filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm">
              {isSuperadmin ? 'Panoramica globale del sistema' : 'Panoramica candidati della tua azienda'}
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 sm:h-9 text-sm">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutto il periodo</SelectItem>
              <SelectItem value="week">Ultima settimana</SelectItem>
              <SelectItem value="month">Ultimo mese</SelectItem>
              <SelectItem value="3months">Ultimi 3 mesi</SelectItem>
              <SelectItem value="year">Ultimo anno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ─── Primo accesso: zeri e grafici vuoti non aiutano nessuno ─── */}
        {!isLoadingData && isAzienda && allCandidati.length === 0 && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04]">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-1">Benvenuto in Talenti Edili</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Non hai ancora candidati. Ecco i tre modi per iniziare — bastano pochi minuti.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    n: '1',
                    icon: Users,
                    titolo: 'Invita chi stai già valutando',
                    testo: 'Aggiungi un candidato e mandagli il link: risponde in 15 minuti dal telefono e tu ricevi il report.',
                    cta: 'Aggiungi candidato',
                    to: '/candidati',
                  },
                  {
                    n: '2',
                    icon: Target,
                    titolo: 'Cerca il candidato giusto',
                    testo: 'Chi ha già fatto il test è nella piattaforma: filtra per ruolo e zona e vedi subito com’è fatto.',
                    cta: 'Cerca candidati',
                    to: '/marketplace',
                  },
                  {
                    n: '3',
                    icon: UserCheck,
                    titolo: 'Testa chi hai già in squadra',
                    testo: 'Molte imprese partono da qui: capire chi è nel ruolo sbagliato e su chi conviene investire.',
                    cta: 'Aggiungi i tuoi',
                    to: '/candidati',
                  },
                ].map((p) => (
                  <div key={p.n} className="rounded-xl border bg-background p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                        {p.n}
                      </span>
                      <p.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5">{p.titolo}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{p.testo}</p>
                    <Link to={p.to}>
                      <Button size="sm" variant="outline" className="h-8 w-full text-xs">
                        {p.cta} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Cosa fare adesso — la coda di lavoro, prima dei numeri ─── */}
        {daFare && allCandidati.length > 0 && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
            <Card className={daFare.daLeggere.length ? 'border-green-300 bg-green-50/40' : undefined}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm font-medium">Test appena finiti</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{daFare.daLeggere.length}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {daFare.daLeggere.length
                    ? 'Report degli ultimi 7 giorni da leggere'
                    : 'Nessun test completato di recente'}
                </p>
                {daFare.daLeggere.length > 0 && (
                  <Link to="/candidati?stato=completato">
                    <Button size="sm" variant="outline" className="mt-3 h-8 w-full">
                      Leggi i report <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className={daFare.daSollecitare.length ? 'border-amber-300 bg-amber-50/40' : undefined}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Fermi da oltre 5 giorni</span>
                </div>
                <div className="text-2xl font-bold text-amber-700">{daFare.daSollecitare.length}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {daFare.daSollecitare.length
                    ? 'Invitati che non hanno ancora fatto il test'
                    : 'Nessuno in ritardo: tutto in regola'}
                </p>
                {daFare.daSollecitare.length > 0 && (
                  <Link to="/candidati?stato=da_fare">
                    <Button size="sm" variant="outline" className="mt-3 h-8 w-full">
                      Chi sollecitare <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/[0.03]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">Devi assumere?</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Cerca il candidato giusto fra chi ha già fatto il test, o invita i tuoi.
                </p>
                <div className="flex gap-2">
                  <Link to="/marketplace" className="flex-1">
                    <Button size="sm" className="h-8 w-full">Cerca candidati</Button>
                  </Link>
                  <Link to="/candidati" className="flex-1">
                    <Button size="sm" variant="outline" className="h-8 w-full">Invita</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPI Cards - Row 1 */}
        <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Tot. Candidati</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{stats?.totale ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Completati</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-0.5 sm:mt-1">{stats?.completati ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">In Attesa</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{stats?.inAttesa ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Completamento</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mt-0.5 sm:mt-1">{stats?.tassoCompletamento ?? 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Fit Medio</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mt-0.5 sm:mt-1">
                {stats?.avgFitScore != null ? `${stats.avgFitScore}%` : '-'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Idonei</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-0.5 sm:mt-1">{stats?.idonei ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Da Valutare</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{stats?.valutare ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
            <CardContent className="p-2.5 sm:p-3 md:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Non Idonei</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-0.5 sm:mt-1">{stats?.nonIdonei ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Aziende stats for superadmin */}
        {isSuperadmin && aziendeStats && (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Aziende Totali</span>
                </div>
                <div className="text-xl font-bold mt-1">{aziendeStats.totale}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Attive</span>
                </div>
                <div className="text-xl font-bold text-green-600 mt-1">{aziendeStats.attive}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-xs text-muted-foreground">Disattive</span>
                </div>
                <div className="text-xl font-bold text-muted-foreground mt-1">{aziendeStats.disattive}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tot. Candidati</span>
                </div>
                <div className="text-xl font-bold mt-1">{aziendeStats.totCandidati}</div>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Media/Azienda</span>
                </div>
                <div className="text-xl font-bold mt-1">{aziendeStats.mediaCandidati}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trend Chart */}
        {!isMobile && trendData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trend Candidati (30 giorni)
              </CardTitle>
              <CardDescription>Nuovi candidati e test completati per giorno</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="nuovi" 
                      name="Nuovi" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completati" 
                      name="Completati" 
                      stroke="hsl(142, 76%, 36%)" 
                      fill="hsl(142, 76%, 36%, 0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Status distribution */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Stato Test</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[140px] sm:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 40}
                      outerRadius={isMobile ? 50 : 70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Verdict distribution */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Verdetti Fit</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[140px] sm:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verdictData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: isMobile ? 9 : 10 }} />
                    <YAxis type="category" dataKey="name" width={isMobile ? 55 : 70} tick={{ fontSize: isMobile ? 9 : 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Funzione distribution */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Per Funzione</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              <div className="h-[140px] sm:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funzioneData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: isMobile ? 9 : 10 }} hide={isMobile} />
                    <YAxis type="category" dataKey="name" width={isMobile ? 70 : 90} tick={{ fontSize: isMobile ? 8 : 9 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Age distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Per Età</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={etaData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {etaData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${210 + index * 30}, 70%, ${50 + index * 5}%)`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fit score distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribuzione Fit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fitDistribution}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {fitDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === '81-100' ? 'hsl(142, 76%, 36%)' :
                            entry.name === '61-80' ? 'hsl(142, 50%, 50%)' :
                            entry.name === '41-60' ? 'hsl(38, 92%, 50%)' :
                            'hsl(0, 84%, 60%)'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Duplicates alert (superadmin) */}
          {isSuperadmin && duplicates && duplicates.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Alert Duplicati
                </CardTitle>
                <CardDescription>Candidati presenti in più aziende</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {duplicates.map((dup, i) => (
                    <div key={i} className="text-sm p-2 bg-background rounded border">
                      <div className="font-medium truncate">{dup.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {dup.type === 'email' ? 'Email' : 'Tel'} in {dup.candidates.length} aziende
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Candidates & Top Performers */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Recent Candidates */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <div>
                <CardTitle className="text-base sm:text-lg">Candidati Recenti</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ultimi test completati</CardDescription>
              </div>
              <Link to="/candidati">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <span className="hidden sm:inline">Vedi tutti</span>
                  <ArrowRight className="ml-0 sm:ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-2">
                {recentCandidati && recentCandidati.length > 0 ? (
                  recentCandidati.map((candidato: any) => (
                    <div key={candidato.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-xs sm:text-sm">
                            {candidato.nome?.[0]}{candidato.cognome?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs sm:text-sm truncate">{candidato.cognome} {candidato.nome}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {candidato.aziende?.nome}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {candidato.analisi?.fit_score && (
                          <div className="text-right">
                            <p className="text-sm sm:text-lg font-bold text-primary">{candidato.analisi.fit_score}%</p>
                          </div>
                        )}
                        {getVerdictBadge(candidato.analisi?.fit_verdict)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground text-sm">Nessun candidato recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Performers
              </CardTitle>
              <CardDescription>Migliori Fit Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers && topPerformers.length > 0 ? (
                  topPerformers.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-300 text-orange-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {item.candidati?.cognome} {item.candidati?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.candidati?.aziende?.nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">{item.fit_score}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground text-sm">Nessun dato</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NotionLayout>
  );
}