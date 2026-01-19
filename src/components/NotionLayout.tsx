import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users, BarChart3, Settings, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface NotionLayoutProps {
  children: ReactNode;
}

export function NotionLayout({ children }: NotionLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
    { href: '/candidati', label: 'Candidati', icon: Users, show: isSuperadmin || isAzienda },
    { href: '/aziende', label: 'Aziende', icon: BarChart3, show: isSuperadmin },
    { href: '/impostazioni', label: 'Impostazioni', icon: Settings, show: false },
    { href: '/metodologia', label: 'Metodologia', icon: BookOpen, show: false },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/talentprofile_logo.png" 
              alt="Talent Profile" 
              className={cn(
                "transition-all duration-300",
                collapsed ? "h-8 w-8 object-contain" : "h-12 w-auto max-w-[180px]"
              )}
            />
          </Link>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button 
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User section */}
        <div className="p-2">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
              <p className="text-xs font-medium text-sidebar-primary capitalize">
                {isSuperadmin ? 'Superadmin' : isAzienda ? 'HR' : 'Utente'}
              </p>
            </div>
          )}
          <Button 
            variant="ghost" 
            onClick={signOut}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Esci</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
