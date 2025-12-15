import { Link } from 'react-router-dom';
import logo from '@/assets/logo-ape-global.jpg';

export function LandingFooter() {
  return (
    <footer className="relative py-8 px-4 border-t border-border/50 bg-[hsl(222,47%,4%)]">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="APE Global" 
              className="h-8 w-auto rounded-lg ring-2 ring-primary/50 animate-logo-glow"
            />
            <span className="font-display text-lg font-bold">
              <span className="text-primary">APE</span>
              <span className="text-foreground"> GLOBAL</span>
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ape Global LL. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-[hsl(175,84%,50%)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-[hsl(175,84%,50%)] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
