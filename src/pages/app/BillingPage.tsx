import { useState, useEffect } from 'react';
import { Check, Download, CreditCard, Zap, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 25,
    shipments: 100,
    users: 2,
    description: 'Ideal for independent brokers & small agencies',
    features: [
      'Up to 100 shipments/month',
      '2 user seats',
      'Basic carrier rate lookups',
      '3 carrier integrations',
      'Email support (48hr)',
    ],
  },
  {
    name: 'Professional',
    icon: Sparkles,
    price: 99,
    shipments: 500,
    users: 10,
    description: 'Perfect for growing freight brokerages',
    features: [
      'Up to 500 shipments/month',
      '10 user seats',
      'Full carrier API integrations',
      'AI-powered rate optimization',
      'Priority support (24hr)',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: null,
    priceLabel: 'Custom',
    shipments: 'Unlimited',
    users: 'Unlimited',
    description: 'For 3PLs & large freight forwarders',
    features: [
      'Unlimited shipments',
      'Unlimited users',
      'Multi-location support',
      'White-label portal',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

const mockInvoices = [
  { id: 'INV-2024-001', date: 'Nov 15, 2024', amount: '$99.00', status: 'Paid', plan: 'Professional' },
  { id: 'INV-2024-002', date: 'Oct 15, 2024', amount: '$99.00', status: 'Paid', plan: 'Professional' },
  { id: 'INV-2024-003', date: 'Sep 15, 2024', amount: '$25.00', status: 'Paid', plan: 'Starter' },
];

export default function BillingPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>('Starter');
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    // Load subscription data from localStorage or API
    const savedSubscription = localStorage.getItem('subscription');
    if (savedSubscription) {
      const data = JSON.parse(savedSubscription);
      setSubscriptionData(data);
      setCurrentPlan(data.plan || 'Starter');
    }
  }, []);

  const handleChangePlan = async (planName: string, price: number | null) => {
    if (planName === currentPlan) {
      toast({
        title: 'Already Subscribed',
        description: `You're currently on the ${planName} plan.`,
      });
      return;
    }

    if (price === null) {
      // Enterprise plan - contact sales
      window.open('mailto:sales@apeglobal.com?subject=Enterprise Upgrade Request', '_blank');
      return;
    }

    setLoading(planName);
    
    try {
      // TODO: Call Stripe API to change subscription
      // const response = await fetch('YOUR_API/stripe/change-subscription', {
      //   method: 'POST',
      //   body: JSON.stringify({ newPlan: planName })
      // });
      
      // Simulate API call
      setTimeout(() => {
        setCurrentPlan(planName);
        localStorage.setItem('subscription', JSON.stringify({
          plan: planName,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        
        toast({
          title: 'Plan Updated',
          description: `Successfully upgraded to ${planName} plan!`,
        });
        setLoading(null);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleManagePayment = () => {
    toast({
      title: 'Opening Payment Portal',
      description: 'Redirecting to Stripe customer portal...',
    });
    // TODO: Redirect to Stripe customer portal
    // window.location.href = stripeCustomerPortalUrl;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-8 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            <Badge variant="outline" className="bg-green-500/20 text-green-400">Active</Badge>
          </CardTitle>
          <CardDescription>
            Your subscription details and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan</p>
              <p className="text-2xl font-bold">{currentPlan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold">
                ${plans.find(p => p.name === currentPlan)?.price || 25}/mo
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
              <p className="text-lg font-semibold">
                {subscriptionData?.currentPeriodEnd 
                  ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()
                  : 'Dec 15, 2024'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleManagePayment} variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payment Method
            </Button>
            <Button onClick={() => navigate('/pricing')} variant="outline">
              View All Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold mb-4">Change Your Plan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-primary/50 shadow-lg' : ''
              } ${currentPlan === plan.name ? 'bg-muted/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  {currentPlan === plan.name && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">{plan.priceLabel}</span>
                  )}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shipments:</span>
                    <span className="font-semibold">{plan.shipments}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>User Seats:</span>
                    <span className="font-semibold">{plan.users}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={currentPlan === plan.name ? 'outline' : 'default'}
                  className="w-full"
                  disabled={currentPlan === plan.name || loading === plan.name}
                  onClick={() => handleChangePlan(plan.name, plan.price)}
                >
                  {loading === plan.name 
                    ? 'Processing...' 
                    : currentPlan === plan.name 
                      ? 'Current Plan' 
                      : plan.price === null
                        ? 'Contact Sales'
                        : plan.price > (plans.find(p => p.name === currentPlan)?.price || 0)
                          ? 'Upgrade'
                          : 'Downgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Alert */}
      <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Shipments Used</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted/50 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <span className="text-sm font-semibold">42/100</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">User Seats</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted/50 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-sm font-semibold">1/2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Download past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
