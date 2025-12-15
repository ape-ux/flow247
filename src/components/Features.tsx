import { Truck, Globe, Bot, Shield, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connect with vendors and shipping partners across 50+ countries with seamless integration.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assistant',
    description: 'Get instant answers to shipping queries, rate calculations, and logistics optimization with our AI chatbot.',
  },
  {
    icon: Truck,
    title: 'Real-Time Tracking',
    description: 'Track your shipments in real-time with detailed status updates and ETA predictions.',
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Enterprise-grade security for all your transactions with Stripe-powered payments.',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'Automate repetitive tasks like documentation, customs clearance, and invoicing.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Gain insights into your shipping performance with comprehensive analytics and reports.',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(175_84%_50%/0.05)_0%,transparent_50%)]" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Everything You Need for{' '}
            <span className="gradient-text">Global Shipping</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Our comprehensive platform provides all the tools you need to manage 
            your logistics operations efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card group p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
