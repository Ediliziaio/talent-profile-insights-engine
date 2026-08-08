import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  HardHat,
  Loader2,
  LockOpen,
  MapPin,
  Search,
  Store,
  Unlock,
} from 'lucide-react';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { fromUntyped } from '@/lib/supabaseUntyped';
import { toast } from '@/hooks/use-toast';
import { MarketplaceProfilo, TraitCode } from '@/types/database';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { calcolaSafetyIndex } from '@/lib/safetyIndexV5';
import { RUOLI, ALTRI_RUOLI } from '@/data/ruoli';

const PAGE_SIZE = 24;
const OPZIONI_RUOLO = [...RUOLI.map((r) => r.nome), ...ALTRI_RUOLI, 'Altro'];

/** Card anonima di un profilo della piattaforma */
function ProfiloCard({
  p,
  isSuperadmin,
  onSblocca,
  sbloccoInCorso,
}: {
  p: MarketplaceProfilo;
  isSuperadmin: boolean;
  onSblocca: (p: MarketplaceProfilo) => void;
  sbloccoInCorso: boolean;
}) {
  const navigate = useNavigate();
  const accessibile = p.sbloccato || isSuperadmin;

  const ips = useMemo(
    () =>
      p.traits_v5
        ? calcolaSafetyIndex(p.traits_v5 as Partial<Record<TraitCode, number>>, p.reliability_index)
        : null,
    [p.traits_v5, p.reliability_index]
  );

  return (
    <Card className={accessibile ? 'border-green-300' : undefined}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-base leading-snug">
              {p.funzione || 'Ruolo non indicato'}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {p.provincia || 'Zona non indicata'}
              {p.eta ? ` · ${p.eta} anni` : ''}
              {p.anni_esperienza ? ` · ${p.anni_esperienza} anni di esperienza` : ''}
            </p>
          </div>
          {accessibile && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 shrink-0">
              <LockOpen className="h-3 w-3 mr-1" /> Sbloccato
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Essere', v: p.essere_pct },
            { label: 'Fare', v: p.fare_pct },
            { label: 'Avere', v: p.avere_pct },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-muted/60 p-2 text-center">
              <div className="text-sm font-bold text-[#1e3a5f]">
                {m.v !== null ? `${Math.round(m.v)}%` : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {p.profilo_tipo_v5 && (
            <Badge variant="secondary" className="text-[11px]">
              {getProfiloTipoV5Label(p.profilo_tipo_v5)}
            </Badge>
          )}
          {ips?.indice !== null && ips !== null && (
            <Badge variant="outline" className="text-[11px]">
              <HardHat className="h-3 w-3 mr-1" /> Sicurezza {ips.indice}/100
            </Badge>
          )}
          {p.reliability_index === 'CAUTION' && (
            <Badge variant="outline" className="text-[11px] text-amber-700 border-amber-300">
              Attendibilità da verificare
            </Badge>
          )}
        </div>

        {accessibile ? (
          <Button size="sm" className="w-full" onClick={() => navigate(`/candidati/${p.id}`)}>
            Vedi profilo completo
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={sbloccoInCorso}
            onClick={() => onSblocca(p)}
          >
            {sbloccoInCorso ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-1.5" /> Sblocca profilo
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MarketplaceInterno() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const isSuperadmin = profile?.ruolo === 'superadmin';

  const [filterFunzione, setFilterFunzione] = useState('all');
  const [filterProvincia, setFilterProvincia] = useState('');
  const [page, setPage] = useState(0);
  const [daSbloccare, setDaSbloccare] = useState<MarketplaceProfilo | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketplace', filterFunzione, filterProvincia, page],
    queryFn: async () => {
      let query = fromUntyped('marketplace_profili')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filterFunzione !== 'all') query = query.eq('funzione', filterFunzione);
      if (filterProvincia.trim()) {
        query = query.ilike('provincia', `%${filterProvincia.trim().replace(/[%,()]/g, '')}%`);
      }

      const { data: rows, error: qError, count } = await query.range(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE - 1
      );
      if (qError) throw qError;
      return { rows: (rows ?? []) as MarketplaceProfilo[], count: (count as number) ?? 0 };
    },
  });

  const sbloccaMutation = useMutation({
    mutationFn: async (candidatoId: string) => {
      const { error: insError } = await fromUntyped('marketplace_sblocchi').insert({
        azienda_id: profile!.azienda_id,
        candidato_id: candidatoId,
        sbloccato_da: user!.id,
      });
      // Già sbloccato in precedenza (vincolo di unicità): non è un errore
      if (insError && !/duplicate|unique/i.test(insError.message)) throw insError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['candidati'] });
      toast({
        title: 'Profilo sbloccato',
        description: 'Ora vedi nome, contatti e report completo del candidato.',
      });
    },
    onError: () => {
      toast({ title: 'Sblocco non riuscito', description: 'Riprova più tardi.', variant: 'destructive' });
    },
  });

  const profili = data?.rows ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <NotionLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> piattaforma
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Candidati che hanno completato l’analisi e scelto di essere visibili. I profili sono
            anonimi finché non li sblocchi.
          </p>
        </div>

        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filterFunzione}
            onValueChange={(v) => {
              setFilterFunzione(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="sm:w-64">
              <SelectValue placeholder="Tutti i ruoli" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Tutti i ruoli</SelectItem>
              {OPZIONI_RUOLO.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative sm:w-56">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Provincia…"
              value={filterProvincia}
              onChange={(e) => {
                setFilterProvincia(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">piattaforma non ancora attivo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                La vista <code>marketplace_profili</code> non è raggiungibile: probabilmente la
                migration <code>20260808180000_marketplace.sql</code> non è ancora stata applicata
                al database.
              </p>
              <p>
                Applicala con <code>supabase db push</code> (o dal SQL editor) e ricarica questa
                pagina.
              </p>
            </CardContent>
          </Card>
        ) : profili.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nessun profilo trovato</p>
              <p className="text-sm mt-1">
                {filterFunzione !== 'all' || filterProvincia
                  ? 'Prova ad allargare i filtri.'
                  : 'Quando i candidati attiveranno la visibilità, compariranno qui.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {totalCount} profil{totalCount === 1 ? 'o' : 'i'} disponibil{totalCount === 1 ? 'e' : 'i'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profili.map((p) => (
                <ProfiloCard
                  key={p.id}
                  p={p}
                  isSuperadmin={isSuperadmin}
                  onSblocca={setDaSbloccare}
                  sbloccoInCorso={sbloccaMutation.isPending && daSbloccare?.id === p.id}
                />
              ))}
            </div>

            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  Pagina {page + 1} di {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Precedente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  >
                    Successiva <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Conferma sblocco */}
        <AlertDialog open={!!daSbloccare} onOpenChange={(open) => !open && setDaSbloccare(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sbloccare questo profilo?</AlertDialogTitle>
              <AlertDialogDescription>
                Vedrai nome, contatti e report completo di questo{' '}
                {daSbloccare?.funzione?.toLowerCase() || 'candidato'}
                {daSbloccare?.provincia ? ` in provincia di ${daSbloccare.provincia}` : ''}. Lo
                sblocco vale per tutta la tua azienda e resta attivo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (daSbloccare) sbloccaMutation.mutate(daSbloccare.id);
                  setDaSbloccare(null);
                }}
              >
                Sblocca
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </NotionLayout>
  );
}
