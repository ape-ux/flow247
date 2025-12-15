import { FileText, HandshakeIcon, Globe } from 'lucide-react';

const services = [
  {
    icon: FileText,
    title: 'Invoice Generation',
    description: 'Automate and manage international shipping invoices with precision.',
  },
  {
    icon: HandshakeIcon,
    title: 'AR/AP Solutions',
    description: 'Seamless Accounts Receivable and Payable integration for global commerce.',
  },
  {
    icon: Globe,
    title: 'Global Shipping Marketplace',
    description: 'Scalable, intelligent payment processing for streamlined transactions.',
  },
];

export function ServicesSection() {
  return (
    <section className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(222,47%,6%)] to-transparent" />
      
      <div className="container relative z-10 mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">Key </span>
            <span className="bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className="group glass-card p-8 border border-[hsl(175,84%,50%/0.2)] hover:border-[hsl(175,84%,50%/0.5)] transition-all duration-300"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                boxShadow: '0 0 20px hsl(222,47%,5%/0.5)'
              }}
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(175,84%,50%/0.2)] to-[hsl(200,84%,50%/0.1)] border border-[hsl(175,84%,50%/0.3)]">
                  <service.icon className="h-10 w-10 text-[hsl(175,84%,50%)]" />
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-center mb-3 text-foreground group-hover:text-[hsl(175,84%,50%)] transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-center text-sm leading-relaxed">
                {service.description}
              </p>
              
              {/* Bottom accent line */}
              <div className="mt-6 h-1 w-full bg-gradient-to-r from-transparent via-[hsl(175,84%,50%/0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
