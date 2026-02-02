import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, Container, FileText, UserPlus, ArrowRight, Shield, Clock,
  Headphones, Zap, BarChart3, CheckCircle2, Sparkles, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AmassLanding() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Full CRM integration to manage shipper relationships, track interactions, and close more deals.',
    },
    {
      icon: Container,
      title: 'Container Tracking',
      description: 'Real-time visibility across all your containers with automated status updates and alerts.',
    },
    {
      icon: FileText,
      title: 'Quote Management',
      description: 'Create, send, and manage freight quotes with intelligent margin optimization.',
    },
    {
      icon: UserPlus,
      title: 'Team Collaboration',
      description: 'Role-based access control with seamless team communication tools.',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track KPIs, monitor team performance, and identify growth opportunities.',
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks and streamline your operations workflow.',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and SOC 2 compliance for your peace of mind.',
    },
    {
      icon: Clock,
      title: 'Save 10+ Hours/Week',
      description: 'Automate repetitive tasks and focus on growing your business.',
    },
    {
      icon: Headphones,
      title: '24/7 Dedicated Support',
      description: 'Our support team is always ready to help you succeed.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Operations Teams' },
    { value: '2M+', label: 'Shipments Tracked' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 5min', label: 'Avg Response Time' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar brand="amass" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-40 right-20 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-float" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-glow mb-8 animate-slide-up">
              <Terminal className="h-4 w-4" />
              <span>OPERATIONS HUB</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up animate-delay-100">
              <span className="text-white">Streamline Your</span>
              <br />
              <span className="gradient-text glow-text">Freight Operations.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up animate-delay-200">
              The operations hub for freight professionals. Access Flow247's powerful
              dashboard with tools for managing shipments, quotes, and carrier relationships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up animate-delay-300">
              <Button size="lg" className="gradient-primary text-white px-8 py-6 text-lg glow-cyan animate-pulse-glow" asChild>
                <Link to="/app">
                  Access Operations Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 px-8 py-6 text-lg" asChild>
                <Link to="/auth/signup">
                  Request Demo
                </Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up animate-delay-400">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="text-2xl md:text-3xl font-bold text-secondary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto animate-slide-up animate-delay-500">
            <div className="glass-card rounded-xl p-1 glow-green">
              <div className="bg-gradient-dark rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground ml-2">Operations Dashboard</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="glass-card rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Active Shipments</div>
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-xs text-green-400 mt-1">↑ 12% from last week</div>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Pending Quotes</div>
                    <div className="text-2xl font-bold text-white">89</div>
                    <div className="text-xs text-primary mt-1">23 require attention</div>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">LFD Alerts</div>
                    <div className="text-2xl font-bold text-white">7</div>
                    <div className="text-xs text-yellow-400 mt-1">Action required today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-dark-radial" id="features">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="badge-glow mb-4 inline-block">Operations Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text">dominate operations.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for freight professionals who demand efficiency and control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4 group-hover:glow-green transition-all">
                  <feature.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4 glow-green">
                  <benefit.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration with Flow247 */}
      <section className="py-20 px-4 bg-gradient-dark">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-success badge-glow mb-4 inline-block">Powered by Flow247</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                One platform. <span className="gradient-text">Unlimited potential.</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Amass connects directly to Flow247's AI-powered infrastructure, giving you
                access to intelligent automation, real-time tracking, and enterprise-grade tools.
              </p>
              <ul className="space-y-3">
                {[
                  'Direct access to 8 AI agents',
                  'Real-time container tracking',
                  'Automated LFD monitoring',
                  'Intelligent rate management',
                  'Multi-tenant architecture',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" className="gradient-primary text-white glow-cyan" asChild>
                  <Link to="/app">
                    Start Operating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="terminal-box glow-green">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="text-xs text-muted-foreground ml-2">amass_ops // connected</span>
                </div>
                <div className="terminal-content text-left">
                  <p className="text-muted-foreground">$ connecting to flow247...</p>
                  <p className="text-green-400 mt-2">✓ AI agents: <span className="text-secondary">synchronized</span></p>
                  <p className="text-green-400">✓ Tracking API: <span className="text-secondary">active</span></p>
                  <p className="text-green-400">✓ Rate engine: <span className="text-secondary">online</span></p>
                  <p className="text-green-400">✓ LFD watchdog: <span className="text-secondary">monitoring</span></p>
                  <p className="text-white mt-4">Ready for operations.</p>
                  <p className="text-muted-foreground mt-2 animate-pulse">_ </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="gradient-text">optimize operations?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join hundreds of operations teams who trust Amass for their daily freight management.
          </p>
          <Button size="lg" className="gradient-primary text-white px-12 py-6 text-lg glow-cyan-lg animate-pulse-glow" asChild>
            <Link to="/app">
              Access Dashboard Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer brand="amass" />
    </div>
  );
}
