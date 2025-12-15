import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NeuralBrain } from './NeuralBrain';

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,47%,5%)] to-[hsl(260,40%,10%)]" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(hsl(175,84%,50%/0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(175,84%,50%/0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-[hsl(175,84%,50%/0.1)] rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-[hsl(200,84%,50%/0.1)] rounded-full blur-[80px]" />

      <div className="container relative z-10 mx-auto grid lg:grid-cols-2 gap-8 py-20 px-4">
        {/* Left content */}
        <div className="flex flex-col justify-center">
          <div className="relative mb-8">
            <NeuralBrain />
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Intelligent Systems</span>
              <br />
              <span className="bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
                for Global Shipping
              </span>
            </h1>
          </div>
          
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            AI-powered solutions for optimizing logistics and streamlining global trade.
          </p>
          
          <Link to="/auth?mode=signup">
            <Button 
              className="w-fit px-8 py-6 text-lg font-semibold bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(175,84%,40%)] hover:from-[hsl(175,84%,55%)] hover:to-[hsl(175,84%,45%)] text-[hsl(222,47%,5%)] border-0 shadow-[0_0_30px_hsl(175,84%,50%/0.3)]"
            >
              Explore Solutions
            </Button>
          </Link>
        </div>

        {/* Right content - Stats */}
        <div className="flex flex-col items-center justify-center gap-6">
          {/* 3D Cube visualization placeholder */}
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-[hsl(175,84%,50%/0.5)] rounded-lg transform rotate-12 animate-pulse" 
                   style={{ boxShadow: '0 0 40px hsl(175,84%,50%/0.3)' }} />
              <div className="absolute w-40 h-40 border-2 border-[hsl(200,84%,50%/0.5)] rounded-lg transform -rotate-6" 
                   style={{ boxShadow: '0 0 30px hsl(200,84%,50%/0.2)' }} />
            </div>
          </div>

          {/* Stats cards */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <div className="glass-card p-6 text-center border border-[hsl(175,84%,50%/0.3)]"
                 style={{ boxShadow: '0 0 20px hsl(175,84%,50%/0.2)' }}>
              <p className="text-sm text-[hsl(175,84%,50%)] font-medium uppercase tracking-wider">Uptime</p>
              <p className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
                99.99%
              </p>
            </div>
            <div className="glass-card p-6 text-center border border-[hsl(175,84%,50%/0.3)]"
                 style={{ boxShadow: '0 0 20px hsl(175,84%,50%/0.2)' }}>
              <p className="text-sm text-[hsl(175,84%,50%)] font-medium uppercase tracking-wider">Shipments</p>
              <p className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
                1.2 BILLION+
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
