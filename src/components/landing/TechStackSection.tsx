import { Brain, Database, Bell } from 'lucide-react';

const techStack = [
  {
    icon: Brain,
    title: 'AI Business Brain',
    description: 'Advanced cognitive systems for predictive analytics and decision making.',
  },
  {
    icon: Database,
    title: 'Intelligent Database',
    description: 'Scalable, self-optimizing data infrastructure for real-time tracking.',
  },
  {
    icon: Bell,
    title: 'Live Notifications',
    description: 'Instant, intelligent alerts for shipment milestones and exceptions.',
  },
];

export function TechStackSection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-[hsl(222,47%,8%)] to-[hsl(260,40%,8%)]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[hsl(175,84%,50%/0.05)] rounded-full blur-[100px]" />
      
      <div className="container relative z-10 mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="text-foreground">Our </span>
          <span className="bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
            Tech Stack
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {techStack.map((tech, index) => (
            <div 
              key={tech.title}
              className="group relative p-8 rounded-xl bg-gradient-to-b from-[hsl(222,30%,12%)] to-[hsl(222,47%,8%)] border border-[hsl(175,84%,50%/0.2)] hover:border-[hsl(175,84%,50%/0.4)] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ boxShadow: '0 0 40px hsl(175,84%,50%/0.1)' }} />
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    {/* Icon background glow */}
                    <div className="absolute inset-0 bg-[hsl(175,84%,50%/0.2)] rounded-full blur-xl" />
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-[hsl(222,30%,15%)] to-[hsl(222,30%,10%)] border border-[hsl(175,84%,50%/0.3)]">
                      <tech.icon className="h-12 w-12 text-[hsl(175,84%,50%)]" />
                    </div>
                  </div>
                </div>
                
                <h3 className="font-display text-xl font-semibold text-center mb-3 text-foreground">
                  {tech.title}
                </h3>
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  {tech.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
