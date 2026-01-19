import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ClipboardCheck, Clock, Target, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';
  const currentAziendaId = profile?.azienda_id;

  // Query per statistiche candidati
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', currentAziendaId, isSuperadmin],
    queryFn: async () => {
      // Totale candidati
      let totalQuery = supabase.from('candidati').select('*', { count: 'exact', head: true });
      if (!isSuperadmin && currentAziendaId) {
        totalQuery = totalQuery.eq('azienda_id', currentAziendaId);
      }
      const { count: totale } = await totalQuery;

      // Completati
      let completatiQuery = supabase.from('candidati').select('*', { count: 'exact', head: true }).eq('test_completato', true);
      if (!isSuperadmin && currentAziendaId) {
        completatiQuery = completatiQuery.eq('azienda_id', currentAziendaId);
      }
      const { count: completati } = await completatiQuery;

      // Distribuzione verdetti
      const { data: analisi } = await supabase
        .from('analisi_candidato')
        .select('fit_score, fit_verdict, candidato_id');
      
      const fitScores = analisi?.map(a => a.fit_score).filter(s => s !== null) || [];
      const avgFitScore = fitScores.length > 0 
        ? Math.round(fitScores.reduce((a, b) => a + (b || 0), 0) / fitScores.length)
        : null;

      const verdictCounts = {
        IDONEO: analisi?.filter(a => a.fit_verdict === 'IDONEO').length || 0,
        VALUTARE: analisi?.filter(a => a.fit_verdict === 'VALUTARE').length || 0,
        NON_IDONEO: analisi?.filter(a => a.fit_verdict === 'NON_IDONEO').length || 0,
      };

      return {
        totale: totale || 0,
        completati: completati || 0,
        inAttesa: (totale || 0) - (completati || 0),
        avgFitScore,
        verdictCounts,
      };
    },
    enabled: !!profile,
  });

  // Query per candidati recenti
  const { data: recentCandidati } = useQuery({
    queryKey: ['recent-candidati', currentAziendaId, isSuperadmin],
    queryFn: async () => {
      let query = supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .eq('test_completato', true)
        .order('data_test', { ascending: false })
        .limit(5);

      if (!isSuperadmin && currentAziendaId) {
        query = query.eq('azienda_id', currentAziendaId);
      }

      const { data } = await query;
      
      // Fetch analisi for these candidates
      if (data && data.length > 0) {
        const candidatoIds = data.map(c => c.id);
        const { data: analisiData } = await supabase
          .from('analisi_candidato')
          .select('*')
          .in('candidato_id', candidatoIds);
        
        return data.map(c => ({
          ...c,
          analisi: analisiData?.find(a => a.candidato_id === c.id) || null
        }));
      }
      
      return data || [];
    },
    enabled: !!profile,
  });

  // Query per top performers
  const { data: topPerformers } = useQuery({
    queryKey: ['top-performers', currentAziendaId, isSuperadmin],
    queryFn: async () => {
      const { data: analisi } = await supabase
        .from('analisi_candidato')
        .select('*, candidati!inner(*, aziende(nome))')
        .not('fit_score', 'is', null)
        .order('fit_score', { ascending: false })
        .limit(3);

      return analisi || [];
    },
    enabled: !!profile,
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
    { name: 'Idoneo', value: stats.verdictCounts.IDONEO, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Valutare', value: stats.verdictCounts.VALUTARE, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Non Idoneo', value: stats.verdictCounts.NON_IDONEO, fill: 'hsl(0, 84%, 60%)' },
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Benvenuto, {profile?.nome || 'Utente'}! 
            {isSuperadmin ? ' Panoramica globale del sistema.' : ' Panoramica candidati della tua azienda.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Candidati Totali</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totale ?? '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">Registrati nel sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Test Completati</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats?.completati ?? '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">Assessment finalizzati</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Attesa</CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats?.inAttesa ?? '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">Test da completare</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fit Score Medio</CardTitle>
              <Target className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {stats?.avgFitScore !== null ? `${stats.avgFitScore}%` : '-'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Media analisi AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuzione per Stato</CardTitle>
              <CardDescription>Candidati completati vs in attesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuzione Verdetti Fit</CardTitle>
              <CardDescription>Risultati analisi AI candidati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verdictData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Candidates & Top Performers */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Candidates */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Candidati Recenti</CardTitle>
                <CardDescription>Ultimi test completati</CardDescription>
              </div>
              <Link to="/candidati">
                <Button variant="ghost" size="sm">
                  Vedi tutti <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCandidati && recentCandidati.length > 0 ? (
                  recentCandidati.map((candidato: any) => (
                    <div key={candidato.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {candidato.nome?.[0]}{candidato.cognome?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{candidato.cognome} {candidato.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidato.aziende?.nome} • {candidato.funzione || 'N/D'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {candidato.analisi?.fit_score && (
                          <span className="text-sm font-medium">{candidato.analisi.fit_score}%</span>
                        )}
                        {getVerdictBadge(candidato.analisi?.fit_verdict)}
                        <Link to={`/risultati/${candidato.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nessun candidato recente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Performers
              </CardTitle>
              <CardDescription>Migliori Fit Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers && topPerformers.length > 0 ? (
                  topPerformers.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.candidati?.cognome} {item.candidati?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.candidati?.aziende?.nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{item.fit_score}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nessun dato</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NotionLayout>
  );
}
