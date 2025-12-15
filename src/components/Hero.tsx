import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Truck, Package } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(175_84%_50%/0.1)_0%,transparent_70%)]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 h-20 w-20 animate-float rounded-xl bg-primary/10 backdrop-blur-sm" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-20 h-16 w-16 animate-float rounded-lg bg-primary/5 backdrop-blur-sm" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/4 h-24 w-24 animate-float rounded-2xl bg-primary/10 backdrop-blur-sm" style={{ animationDelay: '4s' }} />

      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Badge */}
        <div className="mb-8 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Globe className="h-4 w-4" />
            Automated Logistics Solutions
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 max-w-5xl animate-slide-up font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl">
          Applications for{' '}
          <span className="gradient-text">Shipping</span> &{' '}
          <span className="gradient-text">Logistics</span>
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-2xl animate-slide-up text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.2s' }}>
          Developing tools for shipping packages, containers worldwide, 
          connecting vendors in a global marketplace with AI-powered automation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 animate-slide-up sm:flex-row" style={{ animationDelay: '0.4s' }}>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="xl" className="group">
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/#features">
            <Button variant="glass" size="xl">
              Explore Features
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 animate-fade-in md:grid-cols-4" style={{ animationDelay: '0.6s' }}>
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '50+', label: 'Countries' },
            { value: '1M+', label: 'Shipments' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
