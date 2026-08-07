import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NAV } from '@/data/site';

export function SiteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (to?: string) =>
    !!to && (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-[#e5e0db]'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16 gap-4">
        <Link to="/" className="shrink-0" aria-label="Talenti Edili — home">
          <img
            src="/talenti-edili-logo.svg"
            alt="Talenti Edili — sistema Talent Profile"
            className="h-10 md:h-11 hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1" onMouseLeave={() => setOpenMenu(null)}>
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.label)}>
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#6b7280] hover:text-[#f09133] transition-colors"
                  aria-expanded={openMenu === item.label}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {openMenu === item.label && (
                  <div className="absolute left-0 top-full pt-2 w-[340px]">
                    <div className="rounded-xl border border-[#e5e0db] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] p-2">
                      {item.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          className="block rounded-lg px-3 py-2.5 hover:bg-[#f7f4f0] transition-colors"
                        >
                          <span className="block text-sm font-semibold text-[#1a1a2e]">{c.label}</span>
                          {c.desc && (
                            <span className="block text-xs text-[#6b7280] leading-snug mt-0.5">{c.desc}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to!}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.to) ? 'text-[#f09133]' : 'text-[#6b7280] hover:text-[#f09133]'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-[#e5e0db] text-[#1a1a2e] hover:bg-[#f7f4f0] rounded-full"
            onClick={() => navigate('/auth')}
          >
            Accedi
          </Button>
          <Button
            size="sm"
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-full"
            onClick={() => navigate('/contatti')}
          >
            Richiedi una demo
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-[#1a1a2e]" aria-label="Apri il menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-white border-[#e5e0db] overflow-y-auto">
            <div className="mt-8 flex flex-col gap-2">
              <Accordion type="multiple" className="w-full">
                {NAV.map((item) =>
                  item.children ? (
                    <AccordionItem key={item.label} value={item.label} className="border-[#e5e0db]">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="flex flex-col">
                          {item.children.map((c) => (
                            <Link
                              key={c.to}
                              to={c.to}
                              className="py-2 text-sm text-[#6b7280] hover:text-[#f09133] transition-colors"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      key={item.to}
                      to={item.to!}
                      className="block border-b border-[#e5e0db] py-4 text-base font-semibold text-[#1a1a2e] hover:text-[#f09133] transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </Accordion>

              <Button
                variant="outline"
                className="mt-4 border-[#e5e0db] text-[#1a1a2e]"
                onClick={() => navigate('/auth')}
              >
                Accedi
              </Button>
              <Button className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white" onClick={() => navigate('/contatti')}>
                Richiedi una demo
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default SiteNavbar;
