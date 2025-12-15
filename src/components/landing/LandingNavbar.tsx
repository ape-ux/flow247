import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo-ape-global.jpg';

const navLinks = [
  { name: 'Solutions', href: '#services' },
  { name: 'Technology', href: '#tech' },
  { name: 'Integrations', href: '#integrations' },
  { name: 'About', href: '/about' },
  { name: 'Contact Us', href: '#contact' },
];

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="APE Global" 
              className="h-10 w-auto rounded-lg bg-background ring-1 ring-border/50"
            />
            <span className="hidden sm:block text-xs text-muted-foreground font-medium">
              www.apeglobal.io
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[hsl(175,84%,50%)] text-muted-foreground`}
                >
                  {link.name.toUpperCase()}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[hsl(175,84%,50%)] ${
                    link.name === 'Contact Us' 
                      ? 'text-[hsl(175,84%,50%)]' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.name.toUpperCase()}
                </a>
              )
            ))}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:block">
            <Link to="/auth">
              <Button 
                variant="outline" 
                className="border-[hsl(175,84%,50%/0.5)] text-[hsl(175,84%,50%)] hover:bg-[hsl(175,84%,50%/0.1)] hover:border-[hsl(175,84%,50%)]"
              >
                Sign In / Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-[hsl(175,84%,50%)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name.toUpperCase()}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-[hsl(175,84%,50%)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name.toUpperCase()}
                  </a>
                )
              ))}
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full border-[hsl(175,84%,50%/0.5)] text-[hsl(175,84%,50%)]"
                >
                  Sign In / Sign Up
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
