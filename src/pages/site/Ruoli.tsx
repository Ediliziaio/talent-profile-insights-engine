import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import {
  Section,
  SectionHeading,
  PageHero,
  DefinitionBlock,
  FaqSection,
  CtaBand,
  fadeUp,
  stagger,
  cardTransition,
} from '@/components/site/sections';
import { breadcrumbLd, faqLd, itemListLd, webPageLd } from '@/lib/seo';
import { RUOLI, CATEGORIE, ALTRI_RUOLI } from '@/data/ruoli';

const PATH = '/ruoli';

const FAQ = [
  {
    q: 'Quanti ruoli copre Talenti Edili?',
    a: 'Oltre 30 ruoli tipici di un’impresa edile, dai mestieri di cantiere ai ruoli tecnici fino all’ufficio: operaio specializzato, muratore, carpentiere, ferraiolo, gruista, capisquadra, capocantiere, geometra, direttore tecnico, project manager, responsabile sicurezza, preventivista, acquisti, amministrazione e commerciale.',
  },
  {
    q: 'Perché lo stesso candidato è compatibile con un ruolo e non con un altro?',
    a: 'Perché ogni ruolo pesa i 15 tratti in modo diverso. Su un capocantiere contano soprattutto decisione, gestione dello stress e leadership; su un preventivista contano precisione, metodo e onestà nei numeri. Il matching non produce un giudizio sulla persona, ma un punteggio di compatibilità con una posizione precisa.',
  },
  {
    q: 'Il mio ruolo non è in elenco: si può aggiungere?',
    a: 'Sì. Il modello di matching può essere calibrato su ruoli specifici della tua impresa partendo dalla mansione reale, non dalla denominazione contrattuale. Serve una sessione di taratura con chi quel ruolo lo conosce dall’interno.',
  },
];

export default function Ruoli() {
  const jsonLd = useMemo(
    () => [
      webPageLd({
        name: 'Ruoli edili coperti dal Talent Profile System',
        description:
          'Oltre 30 ruoli di cantiere, tecnici e di ufficio con analisi psicoattitudinale dedicata: tratti che contano, rischi tipici e domande da fare al colloquio.',
        path: PATH,
      }),
      itemListLd({
        name: 'Ruoli edili analizzati da Talenti Edili',
        path: PATH,
        items: RUOLI.map((r) => ({
          name: r.nome,
          path: `/ruoli/${r.slug}`,
          description: r.sintesi,
        })),
      }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Ruoli', path: PATH },
      ]),
      faqLd(FAQ),
    ],
    []
  );

  return (
    <>
      <Seo
        title="Ruoli edili — come selezionare ogni figura di cantiere | Talenti Edili"
        description="Capocantiere, capisquadra, muratore, geometra, RSPP, preventivista: per ogni ruolo edile i tratti psicoattitudinali che contano, i rischi tipici e le domande da fare al colloquio."
        path={PATH}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Ruoli"
        title={
          <>
            Ogni ruolo di cantiere{' '}
            <span className="text-[#f09133]">chiede una persona diversa.</span>
          </>
        }
        intro={
          <p>
            Un bravo muratore non è automaticamente un buon capisquadra, e il geometra più preciso può
            essere quello che nessuno in cantiere ascolta. Qui trovi, ruolo per ruolo, i tratti che
            contano davvero, i segnali di rischio e le domande da fare al colloquio.
          </p>
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Ruoli' }]}
        primaryCta={{ label: 'Analizza un candidato', to: '/contatti' }}
        secondaryCta={{ label: 'Come funziona il sistema', to: '/talent-profile-system' }}
      />

      <DefinitionBlock
        question="Perché la selezione va tarata sul ruolo e non sulla persona?"
        answer={
          <p>
            Perché non esiste il “buon candidato” in assoluto: esiste la persona compatibile con{' '}
            <strong>quel</strong> ruolo. Il Talent Profile System misura 15 tratti e poi li pesa in modo
            diverso a seconda della posizione: su un capocantiere pesano decisione, gestione dello
            stress e leadership; su un preventivista pesano precisione, metodo e onestà nei numeri. È il
            motivo per cui lo stesso candidato può risultare compatibile con un ruolo al 91% e con un
            altro al 43% — e per cui promuovere il tecnico più bravo è l’errore più costoso che si fa in
            edilizia.
          </p>
        }
      />

      {CATEGORIE.map((cat) => {
        const ruoliCat = RUOLI.filter((r) => r.categoria === cat);
        if (!ruoliCat.length) return null;
        return (
          <Section key={cat} className="py-12 md:py-16 bg-white even:bg-[#f7f4f0]">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
              <div className="flex items-baseline gap-3 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">{cat}</h2>
                <span className="text-sm text-[#6b7280]">{ruoliCat.length} ruoli con pagina dedicata</span>
              </div>
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
                {ruoliCat.map((r) => (
                  <motion.div key={r.slug} variants={fadeUp} transition={cardTransition}>
                    <Link
                      to={`/ruoli/${r.slug}`}
                      className="landing-card rounded-xl border border-[#e5e0db] p-6 block h-full"
                    >
                      <h3 className="font-bold text-lg mb-2">{r.nome}</h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed mb-4">{r.sintesi}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {r.tratti.slice(0, 3).map((t) => (
                          <span
                            key={t.nome}
                            className="text-[11px] bg-[#f7f4f0] border border-[#e5e0db] rounded-full px-2.5 py-1 text-[#3d3935]"
                          >
                            {t.nome}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e3a5f]">
                        Come si seleziona <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Section>
        );
      })}

      <Section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <SectionHeading
            badge="Copertura completa"
            title="Gli altri ruoli coperti dal matching"
            sub="Non tutti hanno una pagina dedicata, ma sono tutti nel modello di compatibilità."
          />
          <div className="flex flex-wrap justify-center gap-2">
            {ALTRI_RUOLI.map((r) => (
              <span
                key={r}
                className="text-sm bg-[#f7f4f0] border border-[#e5e0db] rounded-full px-4 py-1.5 text-[#3d3935]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <FaqSection faq={FAQ} title="Domande frequenti sui ruoli" />

      <CtaBand
        title="Dicci quale ruolo devi coprire"
        sub="Ti mostriamo come il sistema lo analizza e quanti profili compatibili ci sono già oggi nella tua zona."
        ctaLabel="Parliamo del mio ruolo scoperto"
        origine="ruoli"
      />
    </>
  );
}
