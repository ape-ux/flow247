import { FileText, Plus } from 'lucide-react';
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

const mockQuotes = [
  { id: 'QT-2024-001', customer: 'Acme Corp', origin: 'Los Angeles, CA', destination: 'New York, NY', amount: '$2,450.00', status: 'Accepted', date: 'Dec 10, 2024' },
  { id: 'QT-2024-002', customer: 'Tech Industries', origin: 'Chicago, IL', destination: 'Miami, FL', amount: '$1,800.00', status: 'Pending', date: 'Dec 12, 2024' },
  { id: 'QT-2024-003', customer: 'Global Imports', origin: 'Seattle, WA', destination: 'Dallas, TX', amount: '$3,200.00', status: 'Rejected', date: 'Dec 14, 2024' },
];

export default function QuotesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Quotes
        </h1>
        <Button variant="hero">
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell>{quote.customer}</TableCell>
                <TableCell>{quote.origin}</TableCell>
                <TableCell>{quote.destination}</TableCell>
                <TableCell>{quote.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      quote.status === 'Accepted'
                        ? 'bg-green-500/20 text-green-400'
                        : quote.status === 'Rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }
                  >
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell>{quote.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
