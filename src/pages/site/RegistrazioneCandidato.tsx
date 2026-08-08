import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, HardHat, Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Seo } from '@/components/Seo';
import { Section, PageHero, DefinitionBlock } from '@/components/site/sections';
import { breadcrumbLd, webPageLd } from '@/lib/seo';
import { registrazioneCandidatoSchema } from '@/lib/validationSchemas';
import { getSupabase } from '@/lib/supabaseLazy';
import { RUOLI, ALTRI_RUOLI } from '@/data/ruoli';
import { toast } from '@/hooks/use-toast';

const PATH = '/registrazione-candidato';

/** Ruoli proposti nel select: quelli con pagina dedicata prima, poi gli altri */
const OPZIONI_RUOLO = [...RUOLI.map((r) => r.nome), ...ALTRI_RUOLI, 'Altro'];

type Esito = null | 'conferma-email';

export default function RegistrazioneCandidato() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    telefono: '',
    provincia: '',
    funzione: '',
    consensoPrivacy: false,
    consensoMarketplace: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [esito, setEsito] = useState<Esito>(null);

  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Registrazione candidato — Talenti Edili',
        description:
          'Crea gratuitamente il tuo profilo, completa l’analisi psicoattitudinale in 15 minuti e fatti trovare dalle imprese edili.',
        path: PATH,
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Lavora in edilizia', path: '/lavora-in-edilizia' },
        { name: 'Registrazione', path: PATH },
      ]),
    ],
    []
  );

  const set = (campo: string, valore: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valore }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = registrazioneCandidatoSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = await getSupabase();
      const dati = parsed.data;

      // I metadati viaggiano con l'utente auth: se l'insert della riga candidati
      // non riesce subito (conferma email attiva, migration non applicata),
      // l'Area candidato la ricrea da qui al primo accesso (self-heal).
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: dati.email,
        password: dati.password,
        options: {
          emailRedirectTo: `${window.location.origin}/area-candidato`,
          data: {
            nome: dati.nome,
            cognome: dati.cognome,
            telefono: dati.telefono,
            provincia: dati.provincia,
            funzione: dati.funzione,
            marketplace_optin: dati.consensoMarketplace,
          },
        },
      });

      if (signUpError) {
        const msg = /already registered/i.test(signUpError.message)
          ? 'Esiste già un account con questa email. Accedi dalla pagina di login.'
          : signUpError.message;
        toast({ title: 'Registrazione non riuscita', description: msg, variant: 'destructive' });
        return;
      }

      // Conferma email attiva: nessuna sessione finché non clicca il link
      if (!signUpData.session) {
        setEsito('conferma-email');
        return;
      }

      // Sessione attiva: creo subito la riga candidato. Se fallisce (migration
      // non ancora applicata) non blocco: ci pensa l'Area candidato.
      const base = {
        user_id: signUpData.session.user.id,
        nome: dati.nome,
        cognome: dati.cognome,
        email: dati.email,
        telefono: dati.telefono,
        funzione: dati.funzione,
        ruolo_attuale: 'Candidato',
      };
      const { error: insertError } = await supabase.from('candidati').insert({
        ...base,
        provincia: dati.provincia,
        marketplace_visible: dati.consensoMarketplace,
        marketplace_consenso_at: dati.consensoMarketplace ? new Date().toISOString() : null,
      } as never);
      if (insertError) {
        await supabase.from('candidati').insert(base as never);
      }

      toast({ title: 'Benvenuto!', description: 'Il tuo profilo è pronto: ora fai l’analisi.' });
      navigate('/area-candidato');
    } finally {
      setSubmitting(false);
    }
  };

  if (esito === 'conferma-email') {
    return (
      <>
        <Seo
          title="Controlla la tua email — Talenti Edili"
          description="Ti abbiamo inviato il link di conferma."
          path={PATH}
          noindex
        />
        <Section className="py-24 bg-white min-h-[60vh]">
          <div className="max-w-md mx-auto px-4 text-center">
            <MailCheck className="h-14 w-14 text-[#f09133] mx-auto mb-5" />
            <h1 className="text-2xl font-bold mb-3">Controlla la tua email</h1>
            <p className="text-[#6b7280] leading-relaxed mb-6">
              Ti abbiamo mandato un link di conferma a <strong>{form.email}</strong>. Cliccalo per
              attivare il profilo: al primo accesso troverai l’analisi psicoattitudinale pronta da
              fare.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Torna alla home</Link>
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Registrati gratis — trova lavoro in edilizia | Talenti Edili"
        description="Crea il tuo profilo gratuito, fai l’analisi psicoattitudinale in 15 minuti e fatti trovare dalle imprese edili che cercano il tuo ruolo. Nessun costo, ora né mai."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Registrazione gratuita"
        title={
          <>
            Crea il tuo profilo.{' '}
            <span className="text-[#f09133]">Quindici minuti e sei sulla piattaforma.</span>
          </>
        }
        intro={
          <p>
            Ti registri, completi l’analisi psicoattitudinale e — se vuoi — diventi visibile alle
            imprese edili che cercano il tuo ruolo. I tuoi contatti restano nascosti finché non
            decidi tu.
          </p>
        }
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Lavora in edilizia', to: '/lavora-in-edilizia' },
          { label: 'Registrazione' },
        ]}
      />

      <Section className="py-14 md:py-20 bg-white">
        <div className="max-w-xl mx-auto px-4 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-nome">Nome</Label>
                <Input
                  id="reg-nome"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  aria-invalid={!!errors.nome}
                  className="mt-1.5"
                />
                {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
              </div>
              <div>
                <Label htmlFor="reg-cognome">Cognome</Label>
                <Input
                  id="reg-cognome"
                  value={form.cognome}
                  onChange={(e) => set('cognome', e.target.value)}
                  aria-invalid={!!errors.cognome}
                  className="mt-1.5"
                />
                {errors.cognome && <p className="text-xs text-red-600 mt-1">{errors.cognome}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                aria-invalid={!!errors.email}
                className="mt-1.5"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                aria-invalid={!!errors.password}
                className="mt-1.5"
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-telefono">Telefono</Label>
                <Input
                  id="reg-telefono"
                  type="tel"
                  autoComplete="tel"
                  value={form.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                  aria-invalid={!!errors.telefono}
                  className="mt-1.5"
                />
                {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
              </div>
              <div>
                <Label htmlFor="reg-provincia">Provincia</Label>
                <Input
                  id="reg-provincia"
                  placeholder="es. Torino"
                  value={form.provincia}
                  onChange={(e) => set('provincia', e.target.value)}
                  aria-invalid={!!errors.provincia}
                  className="mt-1.5"
                />
                {errors.provincia && <p className="text-xs text-red-600 mt-1">{errors.provincia}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="reg-funzione">Che ruolo cerchi?</Label>
              <Select value={form.funzione} onValueChange={(v) => set('funzione', v)}>
                <SelectTrigger id="reg-funzione" className="mt-1.5" aria-invalid={!!errors.funzione}>
                  <SelectValue placeholder="Scegli il ruolo" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {OPZIONI_RUOLO.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funzione && <p className="text-xs text-red-600 mt-1">{errors.funzione}</p>}
            </div>

            <div className="space-y-3 rounded-xl border border-[#e5e0db] p-4">
              <div className="flex gap-3 items-start">
                <Checkbox
                  id="reg-privacy"
                  checked={form.consensoPrivacy}
                  onCheckedChange={(v) => set('consensoPrivacy', v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="reg-privacy" className="text-sm font-normal leading-snug cursor-pointer">
                  Ho letto la{' '}
                  <Link to="/privacy-policy" className="underline text-[#1e3a5f]" target="_blank">
                    Privacy Policy
                  </Link>{' '}
                  e acconsento al trattamento dei miei dati per l’analisi psicoattitudinale. *
                </Label>
              </div>
              {errors.consensoPrivacy && (
                <p className="text-xs text-red-600">{errors.consensoPrivacy}</p>
              )}
              <div className="flex gap-3 items-start">
                <Checkbox
                  id="reg-piattaforma"
                  checked={form.consensoMarketplace}
                  onCheckedChange={(v) => set('consensoMarketplace', v === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="reg-piattaforma"
                  className="text-sm font-normal leading-snug cursor-pointer"
                >
                  Voglio essere visibile alle imprese sulla piattaforma, in forma anonima. I contatti
                  restano nascosti finché un’impresa non sblocca il profilo. (Revocabile in ogni
                  momento)
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-[#f09133] hover:bg-[#e07a1f] text-white rounded-xl h-12 font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crea il profilo gratuito'}
            </Button>

            <p className="text-sm text-[#6b7280] text-center">
              Hai già un account?{' '}
              <Link to="/auth" className="font-semibold text-[#1e3a5f] hover:text-[#f09133]">
                Accedi
              </Link>
            </p>
          </form>
        </div>
      </Section>

      <DefinitionBlock
        question="Cosa succede dopo la registrazione?"
        answer={
          <p>
            Completi l’<strong>analisi psicoattitudinale</strong> (242 domande, circa 15 minuti, dal
            telefono) e ricevi il tuo profilo su 15 tratti con i ruoli edili in cui rendi di più. Se
            hai attivato la visibilità, le imprese ti trovano sulla piattaforma{' '}
            <strong>in forma anonima</strong>: vedono profilo e compatibilità, mai nome o contatti.
            Solo quando un’impresa sblocca il tuo profilo i tuoi recapiti diventano visibili — e per
            te resta tutto gratuito, sempre.
          </p>
        }
      />

      <Section className="py-10 bg-[#f7f4f0]">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#3d3935]">
            {['Gratis per sempre', '15 minuti dal telefono', 'Contatti nascosti finché vuoi tu'].map(
              (t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> {t}
                </span>
              )
            )}
            <span className="inline-flex items-center gap-2">
              <HardHat className="h-4 w-4 text-[#f09133]" /> Solo edilizia
            </span>
          </div>
        </div>
      </Section>
    </>
  );
}
