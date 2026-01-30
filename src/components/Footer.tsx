import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img src="/logo-ape-global.png" alt="Ape Global" className="h-10 w-auto" />
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Developing tools for shipping packages, containers worldwide, 
              connecting vendors in a global marketplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/#features" className="transition-colors hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition-colors hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/chat" className="transition-colors hover:text-primary">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/auth" className="transition-colors hover:text-primary">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="transition-colors hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@apeglobal.io" className="transition-colors hover:text-primary">
                  info@apeglobal.io
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+17866861003" className="transition-colors hover:text-primary">
                  +1 786 686 1003
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>150 SE 2nd Avenue, Suite 300-132<br />Miami, FL 33131 USA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ape Global LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
