import { useState } from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MapPin,
    title: 'ADDRESS',
    content: ['Ape Global LL - 150 SE', '2nd Avenue, Suite 300', 'Miami, FL 33126 USA'],
  },
  {
    icon: Phone,
    title: 'PHONE',
    content: ['+1 786 305 3888'],
  },
  {
    icon: Mail,
    title: 'EMAIL',
    content: ['ape@apeglobal.io'],
  },
  {
    icon: Globe,
    title: 'WEBSITE',
    content: ['www.apeglobal.io'],
  },
];

export function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message Sent',
      description: 'We will get back to you soon!',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="relative py-20 px-4 bg-gradient-to-b from-[hsl(222,47%,6%)] to-[hsl(260,40%,8%)]">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-[hsl(175,84%,50%)]" />
        <div className="absolute top-1/3 right-20 w-1 h-1 rounded-full bg-[hsl(175,84%,50%)]" />
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[hsl(200,84%,50%)]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-[hsl(175,84%,50%)] to-[hsl(200,84%,50%)] bg-clip-text text-transparent">
            CONTACT US
          </span>
        </h2>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info) => (
            <div key={info.title} className="text-center">
              <div className="mb-4 flex justify-center">
                <info.icon className="h-12 w-12 text-[hsl(175,84%,50%)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {info.title}
              </h3>
              {info.content.map((line, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl font-bold text-foreground">
            SEND US A MESSAGE
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[hsl(222,30%,12%)] border-[hsl(175,84%,50%/0.3)] focus:border-[hsl(175,84%,50%)] text-foreground placeholder:text-muted-foreground"
              required
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[hsl(222,30%,12%)] border-[hsl(175,84%,50%/0.3)] focus:border-[hsl(175,84%,50%)] text-foreground placeholder:text-muted-foreground"
              required
            />
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="bg-[hsl(222,30%,12%)] border-[hsl(175,84%,50%/0.3)] focus:border-[hsl(175,84%,50%)] text-foreground placeholder:text-muted-foreground"
              required
            />
            <Input
              placeholder="Message"
              className="bg-[hsl(222,30%,12%)] border-[hsl(175,84%,50%/0.3)] focus:border-[hsl(175,84%,50%)] text-foreground placeholder:text-muted-foreground md:hidden"
            />
          </div>
          
          <Textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            className="bg-[hsl(222,30%,12%)] border-[hsl(175,84%,50%/0.3)] focus:border-[hsl(175,84%,50%)] text-foreground placeholder:text-muted-foreground resize-none"
            required
          />

          <div className="flex justify-center">
            <Button 
              type="submit"
              className="px-12 py-6 text-lg font-semibold bg-transparent border-2 border-[hsl(175,84%,50%)] text-[hsl(175,84%,50%)] hover:bg-[hsl(175,84%,50%/0.1)] transition-all duration-300"
              style={{ boxShadow: '0 0 20px hsl(175,84%,50%/0.3)' }}
            >
              SEND MESSAGE
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
