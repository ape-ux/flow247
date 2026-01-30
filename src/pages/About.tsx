import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Users, Zap, Eye, Handshake, Globe } from 'lucide-react';
import { LogoBadge } from '@/components/LogoBadge';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <LogoBadge className="ring-2 ring-primary/50" />
              <span className="text-xl font-bold text-foreground">APE Global</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-[hsl(175,84%,50%)] to-primary bg-clip-text text-transparent">
              About APE Global
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simplifying Global Logistics Through Intelligent Automation
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At APE Global, we believe that moving freight shouldn't be complicated. Founded by logistics professionals with decades of experience across international markets, we built the platform we always wished existed—one that connects carriers, automates workflows, and delivers real-time visibility without the chaos.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is simple: <span className="text-foreground font-semibold">empower freight brokers, forwarders, and shippers with technology that works as hard as they do.</span> From automated quoting to margin intelligence, every feature is designed to eliminate friction, reduce costs, and help our clients move cargo faster and smarter.
              </p>
            </div>
          </section>

          {/* Story Section */}
          <section className="mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[hsl(175,84%,50%)]/10">
                  <Users className="h-6 w-6 text-[hsl(175,84%,50%)]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Born from the Industry. Built for the Industry.</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                APE Global was founded on a straightforward idea: logistics technology should make your life easier, not harder.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                After years of navigating fragmented systems, endless spreadsheets, and tools that never quite fit the realities of freight, we decided to build something better. The result is an automated shipping and logistics platform that brings together carrier integrations, shipment management, and intelligent analytics in one seamless experience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, we serve freight professionals across the Americas—helping them quote faster, track smarter, and grow their business with confidence. <span className="text-foreground font-semibold">Our roots are in the industry, and our focus is on the people who keep global trade moving.</span>
              </p>
            </div>
          </section>

          {/* Bold Statement */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-primary/20 via-[hsl(175,84%,50%)]/10 to-primary/5 border border-primary/30 rounded-2xl p-8 md:p-12 text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Freight Management, Reimagined.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                APE Global delivers automated shipping and logistics solutions for modern freight operations. We combine powerful carrier integrations, AI-driven optimization, and intuitive tools to help brokers, forwarders, and 3PLs operate with speed, precision, and profitability.
              </p>
              <p className="text-lg text-foreground font-medium mt-6">
                Headquartered in the Americas with a global outlook, we're committed to building technology that transforms how freight moves—one shipment at a time.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Technology That Moves With You
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                APE Global exists to solve the real problems freight professionals face every day. We automate the tedious, simplify the complex, and bring clarity to every shipment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Efficiency</h3>
                <p className="text-muted-foreground">
                  Your time is money. Our platform eliminates busywork so you can focus on relationships and revenue.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-[hsl(175,84%,50%)]/50 transition-colors">
                <div className="p-4 rounded-xl bg-[hsl(175,84%,50%)]/10 w-fit mx-auto mb-4">
                  <Eye className="h-8 w-8 text-[hsl(175,84%,50%)]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Transparency</h3>
                <p className="text-muted-foreground">
                  Real-time visibility and accurate data, always. No surprises, no guesswork.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="p-4 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Partnership</h3>
                <p className="text-muted-foreground">
                  We succeed when you succeed. Your challenges drive our roadmap.
                </p>
              </div>
            </div>
          </section>

          {/* Closing Statement */}
          <section className="text-center">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12">
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                From independent brokers to enterprise logistics teams, APE Global is the platform trusted by those who refuse to settle for outdated tools.
              </p>
              <p className="text-2xl font-bold text-foreground mb-8">
                We're not just another software vendor.<br />
                <span className="bg-gradient-to-r from-primary to-[hsl(175,84%,50%)] bg-clip-text text-transparent">
                  We're logistics people building for logistics people.
                </span>
              </p>
              <Link to="/#contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} APE Global LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
