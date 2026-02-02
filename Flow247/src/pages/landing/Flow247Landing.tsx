import { Link } from 'react-router-dom';
import {
  Bot, Zap, BarChart3, ArrowRight, Clock, Users, CheckCircle2, Sparkles,
  Container, Ship, Plane, Truck, Globe2, Shield, TrendingUp, Play,
  ChevronRight, Star, Building2, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Flow247Landing() {
  const features = [
    {
      icon: Bot,
      title: '8 AI Agents',
      description: 'Autonomous agents handle tracking, quotes, LFD monitoring, and customer communications 24/7.',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Container,
      title: 'Real-time Tracking',
      description: 'Direct satellite tracking and API integrations with 95% of global carriers.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      title: 'LFD Monitoring',
      description: 'Never pay detention fees again. Automated Last Free Day alerts and notifications.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: BarChart3,
      title: 'Rate Management',
      description: 'Centralize ocean, air, and drayage rates with dynamic pricing and margin control.',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: Zap,
      title: 'Instant Quotes',
      description: 'Generate accurate quotes in seconds with intelligent margin optimization.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Users,
      title: 'Multi-Tenant',
      description: 'Built for agencies managing hundreds of clients with complete data isolation.',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
  ];

  const transportModes = [
    { icon: Ship, label: 'Ocean Freight', desc: 'FCL & LCL' },
    { icon: Plane, label: 'Air Freight', desc: 'Express & Standard' },
    { icon: Truck, label: 'Trucking', desc: 'Drayage & FTL' },
  ];

  const stats = [
    { value: '8', label: 'AI Agents', suffix: '' },
    { value: '24', label: 'Hour Monitoring', suffix: '/7' },
    { value: '95', label: 'Carrier Coverage', suffix: '%' },
    { value: '300', label: 'API Endpoints', suffix: '+' },
  ];

  const testimonials = [
    {
      quote: "Flow247 transformed our operations. We went from 5+ tools to one unified platform.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "Pacific Freight Solutions"
    },
    {
      quote: "The AI agents save us 20+ hours per week on tracking and customer updates.",
      author: "Michael Torres",
      role: "CEO",
      company: "Global Logistics Corp"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar brand="flow247" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-slide-up">
              <Sparkles className="h-4 w-4" />
              <span>Early Access Now Open</span>
              <ChevronRight className="h-4 w-4" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <span className="block">The Operating System for</span>
              <span className="gradient-text">Modern Freight</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              Automate your logistics with 8 AI-powered agents. All-in-one platform for
              container tracking, rate management, and intelligent quote generation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <Button size="lg" className="gradient-primary text-white px-8 h-14 text-lg glow-cyan" asChild>
                <Link to="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 text-lg border-border/50 hover:bg-muted/50" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Transport Modes */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
              {transportModes.map((mode, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/30 border border-border/50">
                  <mode.icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '500ms' }}>
              {stats.map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary">
                    {stat.value}<span className="text-lg">{stat.suffix}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="glass-card rounded-2xl p-2 glow-cyan">
              <div className="rounded-xl bg-card overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-md mx-auto px-4 py-1.5 rounded-md bg-background text-xs text-muted-foreground text-center">
                      app.flow247.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard Content */}
                <div className="p-6 bg-background/50">
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    {[
                      { label: 'Active Shipments', value: '248', color: 'text-blue-500' },
                      { label: 'Pending Quotes', value: '12', color: 'text-amber-500' },
                      { label: 'LFD Alerts', value: '3', color: 'text-red-500' },
                      { label: 'Revenue MTD', value: '$124.5K', color: 'text-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 rounded-lg bg-muted/20 border border-border/30 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Real-time Analytics Dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-border/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading freight forwarders and logistics companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
            {['Maersk Partner', 'DHL Certified', 'FedEx Connected', 'UPS Integrated', 'CMA CGM'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Features
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Everything you need to run
              <span className="gradient-text"> modern logistics</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed specifically for freight forwarders,
              3PLs, and logistics providers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card group p-6 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 lg:py-28 bg-gradient-dark-radial">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Bot className="h-4 w-4" />
                AI-Powered
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                8 Autonomous AI Agents
                <span className="block text-muted-foreground text-xl lg:text-2xl font-normal mt-2">
                  Working for you 24/7
                </span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our AI agents handle the repetitive tasks that consume your team's time:
                tracking updates, quote generation, LFD monitoring, and customer communications.
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Tracking Agent', status: 'Monitoring 1,240 containers' },
                  { name: 'Quote Engine', status: 'Generated 48 quotes today' },
                  { name: 'LFD Watchdog', status: '3 alerts pending review' },
                  { name: 'Rate Bot', status: 'Connected to 95 carriers' },
                ].map((agent, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.status}</p>
                    </div>
                    <span className="text-xs text-green-500 font-medium">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="terminal-box glow-cyan">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="text-xs text-muted-foreground ml-2">agent_orchestrator v3.1</span>
                </div>
                <div className="terminal-content font-mono text-sm">
                  <p className="text-muted-foreground">$ flow247 agent status --all</p>
                  <p className="text-green-400 mt-3">✓ tracking_agent: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ rate_bot: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ lfd_watchdog: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ quote_engine: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ email_agent: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ doc_processor: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ billing_agent: <span className="text-primary">online</span></p>
                  <p className="text-green-400">✓ report_generator: <span className="text-primary">online</span></p>
                  <p className="text-muted-foreground mt-3">All 8 agents operational.</p>
                  <p className="text-muted-foreground animate-pulse mt-2">_ awaiting commands...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MessageSquare className="h-4 w-4" />
              Testimonials
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Loved by freight professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-lg mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to transform your
              <span className="gradient-text"> freight operations?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of forward-thinking logistics companies already using Flow247.
              Start your free trial today.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                'No credit card required',
                '14-day free trial',
                'Full feature access',
                'Cancel anytime',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="gradient-primary text-white px-12 h-14 text-lg glow-cyan-lg" asChild>
              <Link to="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer brand="flow247" />
    </div>
  );
}
