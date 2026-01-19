import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, Building2, Users, ClipboardList, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
    { href: '/aziende', label: 'Aziende', icon: Building2, show: isSuperadmin },
    { href: '/candidati', label: 'Candidati', icon: Users, show: isSuperadmin || isAzienda },
    { href: '/risultati', label: 'Risultati', icon: ClipboardList, show: isSuperadmin || isAzienda },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">Talent Profile</h1>
                <p className="text-xs text-muted-foreground">
                  {isSuperadmin ? 'Superadmin' : isAzienda ? 'Portale HR' : 'Assessment'}
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.filter(item => item.show).map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button 
                    variant={location.pathname === item.href ? 'secondary' : 'ghost'} 
                    size="sm"
                    className={cn(
                      "gap-2",
                      location.pathname === item.href && "bg-secondary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
