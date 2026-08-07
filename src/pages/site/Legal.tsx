import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/site/sections';
import { breadcrumbLd, webPageLd } from '@/lib/seo';
import { getLegalDoc } from '@/data/legal';

/** Rende privacy policy, cookie policy e termini a partire dallo slug della rotta. */
export default function Legal() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const doc = getLegalDoc(slug);

  const jsonLd = useMemo(() => {
    if (!doc) return [];
    return [
      webPageLd({ name: doc.titolo, description: doc.metaDescription, path: `/${doc.slug}` }),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: doc.titolo, path: `/${doc.slug}` },
      ]),
    ];
  }, [doc]);

  if (!doc) return <Navigate to="/" replace />;

  return (
    <>
      <Seo
        title={doc.metaTitle}
        description={doc.metaDescription}
        path={`/${doc.slug}`}
        jsonLd={jsonLd}
      />

      <Section className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <span className="section-badge mb-5 inline-block">Documento legale</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{doc.titolo}</h1>
          <p className="text-sm text-[#6b7280] mb-8">Ultimo aggiornamento: {doc.aggiornato}</p>

          <p className="text-lg leading-relaxed text-[#3d3935] mb-10">{doc.intro}</p>

          <div className="space-y-10">
            {doc.sezioni.map((s, i) => (
              <section key={s.titolo}>
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  <span className="text-[#f09133] mr-2">{i + 1}.</span>
                  {s.titolo}
                </h2>
                <div className="space-y-3">
                  {s.paragrafi.map((p) => (
                    <p key={p} className="text-[#3d3935] leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
                {s.elenco && (
                  <ul className="mt-4 space-y-2.5">
                    {s.elenco.map((e) => (
                      <li key={e} className="flex gap-3 text-[#3d3935] leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f09133] shrink-0 mt-2.5" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
