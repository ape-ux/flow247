import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone, Mail, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  brand?: 'flow247' | 'amass' | 'apeGlobal';
}

export function Navbar({ brand = 'flow247' }: NavbarProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandConfig = {
    flow247: {
      name: 'Flow',
      suffix: '247',
      gradient: 'from-primary to-secondary',
    },
    amass: {
      name: 'Amass',
      suffix: '',
      gradient: 'from-secondary to-primary',
    },
    apeGlobal: {
      name: 'Ape',
      suffix: 'Global',
      gradient: 'from-primary to-secondary',
    },
  };

  const config = brandConfig[brand];

  const navLinks: { href: string; label: string; isRoute?: boolean }[] = [
    { href: '#features', label: t('common.features') },
    { href: '#solutions', label: 'Solutions' },
    { href: '/pricing', label: 'Pricing', isRoute: true },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-24 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={resolvedTheme === 'dark' ? '/images/flowi247.dark.png' : '/images/flow247.light.png'}
              alt="Flow247"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white hover:bg-white/5"
                asChild
              >
                {link.isRoute ? (
                  <Link to={link.href}>{link.label}</Link>
                ) : (
                  <a href={link.href}>{link.label}</a>
                )}
              </Button>
            ))}

            {isAuthenticated ? (
              <Button size="sm" className="ml-2 gradient-primary text-white glow-cyan hover:glow-cyan-lg" asChild>
                <Link to="/app">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-muted-foreground hover:text-white"
                  asChild
                >
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="ml-1 gradient-primary text-white glow-cyan hover:glow-cyan-lg"
                  asChild
                >
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-4 mr-4 text-sm text-muted-foreground">
              <a href="tel:+17863057888" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="h-3 w-3" />
                <span>+1 786 305 7888</span>
              </a>
              <a href="mailto:ape@apeglobal.io" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Mail className="h-3 w-3" />
                <span>ape@apeglobal.io</span>
              </a>
            </div>

            <LanguageSelector />
            <ThemeToggle />

            {isAuthenticated ? (
              <Button size="sm" className="hidden sm:flex md:hidden gradient-primary text-white" asChild>
                <Link to="/app">Dashboard</Link>
              </Button>
            ) : (
              <div className="hidden sm:flex md:hidden items-center gap-1">
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" className="gradient-primary text-white" asChild>
                  <Link to="/auth/signup">{t('common.getStarted')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="flex flex-col gap-2 px-4 pt-2">
                {isAuthenticated ? (
                  <Button size="sm" className="gradient-primary text-white w-full" asChild>
                    <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" className="gradient-primary text-white w-full" asChild>
                      <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2 px-4 pt-4 text-sm text-muted-foreground">
                <a href="tel:+17863057888" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 786 305 7888</span>
                </a>
                <a href="mailto:ape@apeglobal.io" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>ape@apeglobal.io</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
