import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { SCALE_LABELS, ScalaCode } from '@/types/database';
import { 
  ChevronDown, ChevronUp, Search, Filter, FileText, 
  Download, AlertCircle, CheckCircle, MinusCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RispostaConDomanda {
  domanda_id: number;
  valore: string;
  testo: string;
  scala_primaria: string;
  scala_secondaria: string | null;
  polarita: string;
  blocco_tematico: number | null;
}

interface RisposteDettagliateProps {
  candidatoId: string;
}

const SCALE_OPTIONS: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA', 'SC', 'ST', 'LE'];

export function RisposteDettagliate({ candidatoId }: RisposteDettagliateProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtroScala, setFiltroScala] = useState<string>('tutte');
  const [filtroPolarita, setFiltroPolarita] = useState<string>('tutte');
  const [filtroValore, setFiltroValore] = useState<string>('tutte');

  // Fetch risposte con domande
  const { data: risposte, isLoading, error } = useQuery({
    queryKey: ['risposte-dettagliate', candidatoId],
    queryFn: async () => {
      // Prima prendiamo le risposte
      const { data: risposteData, error: risposteError } = await supabase
        .from('risposte')
        .select('domanda_id, valore')
        .eq('candidato_id', candidatoId)
        .order('domanda_id', { ascending: true });

      if (risposteError) throw risposteError;
      if (!risposteData || risposteData.length === 0) return [];

      // Poi prendiamo le domande
      const { data: domandeData, error: domandeError } = await supabase
        .from('domande')
        .select('id, testo, scala_primaria, scala_secondaria, polarita, blocco_tematico')
        .order('id', { ascending: true });

      if (domandeError) throw domandeError;

      // Uniamo i dati
      const domandeMap = new Map(domandeData?.map(d => [d.id, d]) || []);
      
      return risposteData.map(r => {
        const domanda = domandeMap.get(r.domanda_id);
        return {
          domanda_id: r.domanda_id,
          valore: r.valore,
          testo: domanda?.testo || 'Domanda non trovata',
          scala_primaria: domanda?.scala_primaria || 'N/D',
          scala_secondaria: domanda?.scala_secondaria || null,
          polarita: domanda?.polarita || '+',
          blocco_tematico: domanda?.blocco_tematico || null,
        } as RispostaConDomanda;
      });
    },
    enabled: !!candidatoId && isOpen,
  });

  // Filtra le risposte
  const risposteFiltrate = useMemo(() => {
    if (!risposte) return [];
    
    return risposte.filter(r => {
      // Filtro scala
      if (filtroScala !== 'tutte' && r.scala_primaria !== filtroScala) return false;
      
      // Filtro polarità
      if (filtroPolarita !== 'tutte' && r.polarita !== filtroPolarita) return false;
      
      // Filtro valore
      if (filtroValore !== 'tutte' && r.valore !== filtroValore) return false;
      
      // Ricerca testuale
      if (searchText && !r.testo.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      return true;
    });
  }, [risposte, filtroScala, filtroPolarita, filtroValore, searchText]);

  // Statistiche rapide
  const stats = useMemo(() => {
    if (!risposte) return { totale: 0, a: 0, b: 0, c: 0 };
    return {
      totale: risposte.length,
      a: risposte.filter(r => r.valore === 'A').length,
      b: risposte.filter(r => r.valore === 'B').length,
      c: risposte.filter(r => r.valore === 'C').length,
    };
  }, [risposte]);

  // Colore per valore risposta basato sulla polarità
  const getValoreStyle = (valore: string, polarita: string) => {
    const isPositive = polarita === '+';
    
    if (valore === 'C') {
      return isPositive 
        ? 'bg-green-100 text-green-700 border-green-300' 
        : 'bg-red-100 text-red-700 border-red-300';
    }
    if (valore === 'A') {
      return isPositive 
        ? 'bg-red-100 text-red-700 border-red-300' 
        : 'bg-green-100 text-green-700 border-green-300';
    }
    return 'bg-amber-100 text-amber-700 border-amber-300';
  };

  // Esportazione CSV
  const exportCSV = () => {
    if (!risposte) return;
    
    const headers = ['#', 'Domanda', 'Scala', 'Polarità', 'Risposta'];
    const rows = risposteFiltrate.map(r => [
      r.domanda_id,
      `"${r.testo.replace(/"/g, '""')}"`,
      r.scala_primaria,
      r.polarita,
      r.valore
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risposte_${candidatoId}.csv`;
    link.click();
  };

  // Componente Filtri
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca nelle domande..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={filtroScala} onValueChange={setFiltroScala}>
          <SelectTrigger>
            <SelectValue placeholder="Scala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutte">Tutte le scale</SelectItem>
            {SCALE_OPTIONS.map(scala => (
              <SelectItem key={scala} value={scala}>
                {scala} - {SCALE_LABELS[scala]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filtroPolarita} onValueChange={setFiltroPolarita}>
          <SelectTrigger>
            <SelectValue placeholder="Polarità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutte">Tutte</SelectItem>
            <SelectItem value="+">Positiva (+)</SelectItem>
            <SelectItem value="-">Negativa (-)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filtroValore} onValueChange={setFiltroValore}>
          <SelectTrigger>
            <SelectValue placeholder="Risposta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutte">Tutte</SelectItem>
            <SelectItem value="A">A - Mai/Raramente</SelectItem>
            <SelectItem value="B">B - A volte</SelectItem>
            <SelectItem value="C">C - Spesso/Sempre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Componente Card Mobile
  const MobileCard = ({ risposta }: { risposta: RispostaConDomanda }) => (
    <Card className="mb-3">
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs shrink-0">
            #{risposta.domanda_id}
          </Badge>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {risposta.scala_primaria}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                risposta.polarita === '+' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {risposta.polarita}
            </Badge>
            <Badge 
              className={cn("text-xs border", getValoreStyle(risposta.valore, risposta.polarita))}
            >
              {risposta.valore}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {risposta.testo}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">
                  Risposte Questionario
                </CardTitle>
                {stats.totale > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.totale} risposte
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Errore nel caricamento delle risposte</p>
              </div>
            ) : (
              <>
                {/* Statistiche rapide */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                    <p className="text-lg sm:text-2xl font-bold">{stats.totale}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Totale</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-red-50">
                    <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.a}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">A</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-amber-50">
                    <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.b}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">B</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-green-50">
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.c}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">C</p>
                  </div>
                </div>

                {/* Filtri */}
                {isMobile ? (
                  <div className="flex items-center gap-2 mb-4">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtri
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                          <SheetTitle>Filtra risposte</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <FiltersContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-end gap-4 mb-4">
                    <div className="flex-1">
                      <FiltersContent />
                    </div>
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                )}

                {/* Risultati filtrati */}
                <div className="text-sm text-muted-foreground mb-3">
                  {risposteFiltrate.length} risultati
                  {risposteFiltrate.length !== stats.totale && ` su ${stats.totale}`}
                </div>

                {/* Tabella/Cards */}
                {isMobile ? (
                  <ScrollArea className="h-[400px]">
                    {risposteFiltrate.map(r => (
                      <MobileCard key={r.domanda_id} risposta={r} />
                    ))}
                  </ScrollArea>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>Domanda</TableHead>
                          <TableHead className="w-[80px]">Scala</TableHead>
                          <TableHead className="w-[60px]">Pol.</TableHead>
                          <TableHead className="w-[80px]">Risp.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {risposteFiltrate.map(r => (
                          <TableRow key={r.domanda_id}>
                            <TableCell className="font-mono text-xs">
                              {r.domanda_id}
                            </TableCell>
                            <TableCell className="text-sm">
                              {r.testo}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {r.scala_primaria}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  r.polarita === '+' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                                )}
                              >
                                {r.polarita}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn(
                                  "text-xs font-bold border",
                                  getValoreStyle(r.valore, r.polarita)
                                )}
                              >
                                {r.valore}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
