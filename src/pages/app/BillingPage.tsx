import { useState } from 'react';
import { Check, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with basic features',
    features: ['5 AI chats per day', 'Basic shipment tracking', 'Email support'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'Unlock all premium features',
    features: [
      'Unlimited AI chats',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
    ],
    current: false,
    highlighted: true,
  },
];

const mockInvoices = [
  { id: 'INV-2024-001', date: 'Oct 15, 2024', amount: '$12,450.00', status: 'Paid' },
  { id: 'INV-2024-002', date: 'Nov 01, 2024', amount: '$4,500.00', status: 'Paid' },
  { id: 'INV-2024-003', date: 'Nov 15, 2024', amount: '$8,200.00', status: 'Pending' },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('Free');

  return (
    <div className="p-6">
      <h1 className="mb-6 font-display text-2xl font-bold">Billing & Subscription</h1>

      {/* Plans Section */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-semibold">Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card relative overflow-hidden p-6 ${
                plan.highlighted ? 'border-primary/50' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute right-0 top-0 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="font-display text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.current ? 'outline' : 'hero'}
                className="w-full"
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Section */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Recent Invoices
        </h2>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
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
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={invoice.status === 'Paid' ? 'default' : 'secondary'}
                      className={invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : ''}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
