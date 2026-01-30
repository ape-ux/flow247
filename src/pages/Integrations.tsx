import { useState } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Code, Package, Webhook, FileCode, Terminal } from 'lucide-react';

const Integrations = () => {
  const [apiDocsOpen, setApiDocsOpen] = useState(false);

  const integrations = [
    {
      icon: Code,
      title: 'REST API',
      description: 'Full REST API access to all shipping and logistics features',
      category: 'API'
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Real-time event notifications for shipment updates',
      category: 'API'
    },
    {
      icon: Package,
      title: 'SDK Libraries',
      description: 'Official SDKs for JavaScript, Python, PHP, and more',
      category: 'Development'
    },
    {
      icon: FileCode,
      title: 'GraphQL API',
      description: 'Flexible GraphQL endpoint for custom queries',
      category: 'API'
    },
    {
      icon: Terminal,
      title: 'CLI Tools',
      description: 'Command-line interface for automation and scripting',
      category: 'Development'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Comprehensive guides and API references',
      category: 'Resources'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Integrations & <span className="text-[hsl(175,84%,50%)]">API</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect APE Global with your existing tools and workflows
            </p>
          </div>

          {/* API Documentation Section */}
          <section id="api-docs" className="mb-16">
            <Card className="border-[hsl(175,84%,50%/0.3)] bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-[hsl(175,84%,50%)]" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Complete API reference with examples and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-4">
                      Access our comprehensive API documentation to integrate APE Global's shipping 
                      and logistics capabilities into your applications. Get started with our RESTful 
                      API, webhooks, and real-time tracking features.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Authentication & API Keys</li>
                      <li>✓ Shipment Management</li>
                      <li>✓ Real-time Tracking</li>
                      <li>✓ Rate Calculation</li>
                      <li>✓ Webhook Events</li>
                    </ul>
                  </div>
                  
                  <Dialog open={apiDocsOpen} onOpenChange={setApiDocsOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-[hsl(175,84%,50%)] text-[hsl(175,84%,50%)] hover:bg-[hsl(175,84%,50%/0.1)]"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Documentation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>API Documentation</DialogTitle>
                        <DialogDescription>
                          Complete reference for APE Global API
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Documentation content will be added here */}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <h3>Getting Started</h3>
                          <p>
                            Welcome to the APE Global API documentation. This section will be populated 
                            with your provided documentation content.
                          </p>
                          
                          <h3>Authentication</h3>
                          <p>
                            All API requests require authentication using API keys. You can generate 
                            API keys from your dashboard.
                          </p>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <code>Authorization: Bearer YOUR_API_KEY</code>
                          </div>
                          
                          <h3>Example Request</h3>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://api.apeglobal.io/v1/shipments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Miami, FL",
    "destination": "New York, NY",
    "weight": 10,
    "dimensions": {
      "length": 12,
      "width": 8,
      "height": 6
    }
  }'`}
                          </pre>
                          
                          <h3>Full API Reference</h3>
                          <p>
                            Access the complete Swagger API documentation with all endpoints, 
                            request/response schemas, and interactive testing:
                          </p>
                          
                          <div className="my-4">
                            <a 
                              href="https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o?token=B4K7NQBntCtCJyzsaYPaBD2yGwI"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(175,84%,50%)] text-black rounded-lg hover:bg-[hsl(175,84%,60%)] transition-colors font-medium"
                            >
                              <BookOpen className="h-4 w-4" />
                              Open Swagger Documentation
                            </a>
                          </div>
                          
                          <div className="border rounded-lg overflow-hidden mt-4">
                            <iframe 
                              src="https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o?token=B4K7NQBntCtCJyzsaYPaBD2yGwI"
                              className="w-full h-[500px] border-0"
                              title="API Documentation"
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Integrations Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Available Integrations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => (
                <Card 
                  key={index}
                  className="border-border/50 hover:border-[hsl(175,84%,50%/0.5)] transition-all hover:shadow-lg hover:shadow-[hsl(175,84%,50%/0.1)]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <integration.icon className="h-8 w-8 text-[hsl(175,84%,50%)]" />
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(175,84%,50%/0.1)] text-[hsl(175,84%,50%)]">
                        {integration.category}
                      </span>
                    </div>
                    <CardTitle className="mt-4">{integration.title}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className="w-full text-[hsl(175,84%,50%)] hover:text-[hsl(175,84%,50%)] hover:bg-[hsl(175,84%,50%/0.1)]"
                    >
                      Learn More →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <Card className="border-[hsl(175,84%,50%/0.3)] bg-gradient-to-br from-card to-[hsl(175,84%,50%/0.05)]">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription>
                  Sign up for a free account and get your API keys today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/auth?mode=signup">
                  <Button 
                    size="lg"
                    className="bg-[hsl(175,84%,50%)] hover:bg-[hsl(175,84%,60%)] text-black font-semibold"
                  >
                    Get API Access
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Integrations;




