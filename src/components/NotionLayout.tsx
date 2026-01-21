import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users, BarChart3, Settings, BookOpen, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotionLayoutProps {
  children: ReactNode;
}

export function NotionLayout({ children }: NotionLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
    { href: '/candidati', label: 'Candidati', icon: Users, show: isSuperadmin || isAzienda },
    { href: '/aziende', label: 'Aziende', icon: BarChart3, show: isSuperadmin },
    { href: '/impostazioni', label: 'Impostazioni', icon: Settings, show: false },
    { href: '/metodologia', label: 'Metodologia', icon: BookOpen, show: false },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = ({ isMobileSheet = false }: { isMobileSheet?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center",
        collapsed && !isMobileSheet ? "justify-center p-2" : "justify-start py-3 px-3"
      )}>
        <Link to="/" className="flex items-center">
          <img 
            src="/talentprofile_logo_v3.png?v=20260119" 
            alt="Talent Profile"
            className={cn(
              "transition-all duration-300 object-contain",
              collapsed && !isMobileSheet ? "h-8 w-8" : "h-10 w-auto max-w-[120px]"
            )}
          />
        </Link>
      </div>

      <Separator className="bg-sidebar-border mx-2" />

      {/* Navigation */}
      <nav className="flex-1 p-1.5 space-y-0.5">
        {navItems.filter(item => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href} onClick={() => isMobileSheet && setMobileOpen(false)}>
              <Button 
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  collapsed && !isMobileSheet && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {(!collapsed || isMobileSheet) && <span className="text-sm">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mx-2" />

      {/* User section */}
      <div className="p-1.5">
        {(!collapsed || isMobileSheet) && (
          <div className="px-2 py-1.5 mb-1">
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
            <p className="text-xs font-medium text-sidebar-primary capitalize">
              {isSuperadmin ? 'Superadmin' : isAzienda ? 'HR' : 'Utente'}
            </p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9",
            collapsed && !isMobileSheet && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobileSheet) && <span className="text-sm">Esci</span>}
        </Button>
      </div>

      {/* Collapse toggle - only on desktop */}
      {!isMobileSheet && (
        <div className="p-1.5 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 py-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-3">
                  <Link to="/" onClick={() => setMobileOpen(false)}>
                    <img 
                      src="/talentprofile_logo_v3.png?v=20260119" 
                      alt="Talent Profile"
                      className="h-10 w-auto max-w-[120px] object-contain"
                    />
                  </Link>
                </div>
                <Separator className="bg-sidebar-border" />
                <nav className="flex-1 p-2 space-y-1">
                  {navItems.filter(item => item.show).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}>
                        <Button 
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-11",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
                <Separator className="bg-sidebar-border" />
                <div className="p-2">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
                    <p className="text-xs font-medium text-sidebar-primary capitalize">
                      {isSuperadmin ? 'Superadmin' : isAzienda ? 'HR' : 'Utente'}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-11"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Esci</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/">
            <img 
              src="/talentprofile_logo_v3.png?v=20260119" 
              alt="Talent Profile"
              className="h-8 w-auto max-w-[100px] object-contain"
            />
          </Link>
          
          <div className="w-9" /> {/* Spacer for balance */}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-sm",
          collapsed ? "w-14" : "w-52"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
