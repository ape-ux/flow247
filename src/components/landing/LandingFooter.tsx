import { Link } from 'react-router-dom';
import logo from '@/assets/logo-ape-global.jpg';

export function LandingFooter() {
  return (
    <footer className="relative py-8 px-4 border-t border-border/50 bg-[hsl(222,47%,4%)]">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="APE Global" 
              className="h-8 w-auto rounded-lg ring-2 ring-primary/50 animate-logo-glow"
            />
          </Link>

          {/* Copyright & Address */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ape Global LLC. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              150 SE 2nd Avenue, Suite 300-132, Miami, FL 33131 USA
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-[hsl(175,84%,50%)] transition-colors">
              About
            </Link>
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
