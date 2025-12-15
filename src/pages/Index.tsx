import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="pt-16">
        <HeroSection />
        <section id="services">
          <ServicesSection />
        </section>
        <section id="tech">
          <TechStackSection />
        </section>
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
