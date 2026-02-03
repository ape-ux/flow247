import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Twitter, Linkedin, Github, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  brand?: 'flow247' | 'amass' | 'apeGlobal';
}

export function Footer({ brand = 'flow247' }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 bg-gradient-dark">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4 group">
              <img
                src="/images/flow247-logo.png"
                alt="Flow247"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden items-center gap-2">
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center glow-cyan">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-white">Flow</span>
                  <span className="gradient-text">247</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              The AI-powered freight management platform built for the next generation of logistics experts.
              Automate your operations, not your dreams.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/apeglobalusa"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all"
              >
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://www.linkedin.com/company/104259249/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://github.com/ape-ux/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="#features">Key Features</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="#solutions">AI Agents</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="#benefits">Early Access Benefits</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary flex items-center gap-2" asChild>
                  <Link to="/auth/signup">
                    Join Waiting List
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">HOT</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support & Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="#faq">Frequently Asked Questions</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="#problems">Challenges We Solve</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <Link to="/privacy">Privacy Policy</Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <Link to="/terms">Terms of Service</Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <Link to="/security">Compliance & Security</Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact Our Team</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="mailto:ape@apeglobal.io" className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group">
                  <Mail className="h-4 w-4 mt-0.5 group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-white group-hover:text-primary">Email Us</div>
                    <div>ape@apeglobal.io</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="tel:+17863057888" className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group">
                  <Phone className="h-4 w-4 mt-0.5 group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-white group-hover:text-primary">Call Support</div>
                    <div>+1 786 305 7888</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="https://www.google.com/maps/search/?api=1&query=Miami+FL+33126+USA" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group">
                  <MapPin className="h-4 w-4 mt-0.5 group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-white group-hover:text-primary">Global HQ</div>
                    <div>Miami FL 33126 USA</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Powered By Section */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Powered by</span>
            <a
              href="https://apeglobal.io"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="/images/apeglobal-logo.png"
                alt="APE Global - Automated Logistics"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden items-center gap-2">
                <span className="text-xl font-bold">
                  <span className="text-white">APE</span>
                  <span className="text-primary">GLOBAL</span>
                </span>
                <span className="text-xs text-muted-foreground">AUTOMATED LOGISTICS</span>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Flow247 Pro Inc. All rights reserved.</p>
              <span className="hidden md:inline text-border">|</span>
              <p className="text-xs">Infrastructure: AWS GovCloud // US-East-1</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                Cookie Preferences
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                Accessibility
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <Shield className="h-3 w-3" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
