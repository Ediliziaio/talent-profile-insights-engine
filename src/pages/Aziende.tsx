import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Building2, Copy, Check } from 'lucide-react';
import { Azienda } from '@/types/database';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function Aziende() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAzienda, setEditingAzienda] = useState<Azienda | null>(null);
  const [deleteAzienda, setDeleteAzienda] = useState<Azienda | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    aziendaNome: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    settore: '',
    email_contatto: '',
    telefono: '',
    indirizzo: '',
    attiva: true,
  });

  const { data: aziende, isLoading } = useQuery({
    queryKey: ['aziende'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Azienda[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // 1. Create azienda
      const { data: azienda, error: aziendaError } = await supabase
        .from('aziende')
        .insert({
          nome: data.nome,
          settore: data.settore || null,
          email_contatto: data.email_contatto || null,
          telefono: data.telefono || null,
          indirizzo: data.indirizzo || null,
          attiva: data.attiva,
        })
        .select()
        .single();

      if (aziendaError) throw aziendaError;

      // 2. Create user for azienda
      const password = generatePassword();
      const email = data.email_contatto || `azienda_${azienda.id}@talentprofile.local`;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: data.nome,
            ruolo: 'azienda',
          }
        }
      });

      if (signUpError) throw signUpError;

      // 3. Update profile with azienda_id
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ruolo: 'azienda',
            azienda_id: azienda.id,
            nome: data.nome,
            email: email,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      return { azienda, email, password };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['aziende'] });
      setIsDialogOpen(false);
      resetForm();
      setGeneratedCredentials({
        email: result.email,
        password: result.password,
        aziendaNome: result.azienda.nome,
      });
      toast({
        title: 'Azienda creata',
        description: 'Azienda e utente creati con successo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('aziende')
        .update({
          nome: data.nome,
          settore: data.settore || null,
          email_contatto: data.email_contatto || null,
          telefono: data.telefono || null,
          indirizzo: data.indirizzo || null,
          attiva: data.attiva,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aziende'] });
      setIsDialogOpen(false);
      setEditingAzienda(null);
      resetForm();
      toast({
        title: 'Azienda aggiornata',
        description: 'Le modifiche sono state salvate',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('aziende').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aziende'] });
      setDeleteAzienda(null);
      toast({
        title: 'Azienda eliminata',
        description: 'L\'azienda è stata rimossa',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      settore: '',
      email_contatto: '',
      telefono: '',
      indirizzo: '',
      attiva: true,
    });
  };

  const openEditDialog = (azienda: Azienda) => {
    setEditingAzienda(azienda);
    setFormData({
      nome: azienda.nome,
      settore: azienda.settore || '',
      email_contatto: azienda.email_contatto || '',
      telefono: azienda.telefono || '',
      indirizzo: azienda.indirizzo || '',
      attiva: azienda.attiva,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAzienda) {
      updateMutation.mutate({ id: editingAzienda.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestione Aziende</h1>
              <p className="text-muted-foreground">Crea e gestisci le aziende clienti</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingAzienda(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Azienda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAzienda ? 'Modifica Azienda' : 'Nuova Azienda'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAzienda
                        ? 'Modifica i dati dell\'azienda'
                        : 'Inserisci i dati della nuova azienda. Verrà creato automaticamente un account di accesso.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Azienda *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settore">Settore</Label>
                      <Input
                        id="settore"
                        value={formData.settore}
                        onChange={(e) => setFormData({ ...formData, settore: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email_contatto">Email Contatto</Label>
                      <Input
                        id="email_contatto"
                        type="email"
                        value={formData.email_contatto}
                        onChange={(e) => setFormData({ ...formData, email_contatto: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Telefono</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="indirizzo">Indirizzo</Label>
                      <Input
                        id="indirizzo"
                        value={formData.indirizzo}
                        onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="attiva"
                        checked={formData.attiva}
                        onCheckedChange={(checked) => setFormData({ ...formData, attiva: checked })}
                      />
                      <Label htmlFor="attiva">Azienda attiva</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingAzienda ? 'Salva Modifiche' : 'Crea Azienda'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : aziende && aziende.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Settore</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aziende.map((azienda) => (
                      <TableRow key={azienda.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {azienda.nome}
                          </div>
                        </TableCell>
                        <TableCell>{azienda.settore || '-'}</TableCell>
                        <TableCell>{azienda.email_contatto || '-'}</TableCell>
                        <TableCell>{azienda.telefono || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={azienda.attiva ? 'default' : 'secondary'}>
                            {azienda.attiva ? 'Attiva' : 'Disattiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(azienda)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteAzienda(azienda)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna azienda presente</p>
                  <p className="text-sm">Crea la prima azienda per iniziare</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteAzienda} onOpenChange={() => setDeleteAzienda(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare l'azienda "{deleteAzienda?.nome}"? 
                Questa azione è irreversibile e rimuoverà anche tutti i candidati associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAzienda && deleteMutation.mutate(deleteAzienda.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Credentials Dialog */}
        <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credenziali Azienda Create</DialogTitle>
              <DialogDescription>
                Copia e conserva queste credenziali per l'azienda "{generatedCredentials?.aziendaNome}".
                La password non potrà essere visualizzata nuovamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.email || ''} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCredentials?.email || '', 'email')}
                  >
                    {copiedId === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials?.password || ''} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCredentials?.password || '', 'password')}
                  >
                    {copiedId === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setGeneratedCredentials(null)}>Chiudi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}
