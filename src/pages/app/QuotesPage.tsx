import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    // Load quotes from localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    setQuotes(savedQuotes);
  }, []);

  const handleEditQuote = (quoteId: string) => {
    navigate(`/app/quotes/new?edit=${quoteId}`);
  };

  const handleRequote = (quoteId: string) => {
    navigate(`/app/quotes/new?requote=${quoteId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Quotes
        </h1>
        <Button variant="hero" onClick={() => navigate('/app/quotes/new')}>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No quotes found. Create your first quote to get started.
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">#{quote.id}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{quote.origin.city}, {quote.origin.state}</TableCell>
                  <TableCell>{quote.destination.city}, {quote.destination.state}</TableCell>
                  <TableCell>${quote.cheapestRate.priceTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        quote.status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : quote.status === 'Expired'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }
                  >
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit/Requote
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditQuote(quote.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRequote(quote.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Get New Rates
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
