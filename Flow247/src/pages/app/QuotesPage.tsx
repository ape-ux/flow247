import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Truck,
  DollarSign,
  Clock,
  Hash,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getQuoteResultById, type QuoteRequest, type QuoteResultDetail } from '@/lib/xano';
import { useQuotes } from '@/hooks/useXanoQuery';

const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'destructive' | 'secondary' | 'default' => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': case 'expired': return 'destructive';
    default: return 'secondary';
  }
};

export default function QuotesPage() {
  const { data: quotesData, isLoading: loading, refetch } = useQuotes({ limit: 50 });
  const quotes: QuoteRequest[] = quotesData?.items || [];

  // Quote Result lookup
  const [lookupId, setLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<QuoteResultDetail | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      toast.error('Please enter a Quote ID');
      return;
    }
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await getQuoteResultById(lookupId.trim());
      if (res.data) {
        setLookupResult(res.data);
        toast.success('Quote result found');
      } else {
        toast.error('Quote not found: ' + (res.error || 'Unknown error'));
      }
    } catch {
      toast.error('Failed to look up quote');
    } finally {
      setLookupLoading(false);
    }
  };

  // Stats
  const completedQuotes = quotes.filter(q => q.status === 'completed');
  const totalRatesReceived = quotes.reduce((sum, q) => sum + (q.quotes_received || 0), 0);
  const avgCheapestPrice = completedQuotes.length > 0
    ? completedQuotes.reduce((sum, q) => sum + (q.cheapest_price || 0), 0) / completedQuotes.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quotes</h1>
            <p className="text-sm text-muted-foreground">LTL rate quotes and carrier comparisons</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gradient-primary" asChild>
            <Link to="/app/quotes/new">
              <Plus className="mr-2 h-4 w-4" />
              New LTL Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Quotes</p>
          </div>
          <p className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : quotes.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <p className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : completedQuotes.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Rates</p>
          </div>
          <p className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalRatesReceived.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Avg. Cheapest</p>
          </div>
          <p className="text-2xl font-bold">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : avgCheapestPrice > 0 ? `$${Math.round(avgCheapestPrice).toLocaleString()}` : '-'}
          </p>
        </div>
      </div>

      {/* Quote Result Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-primary" /> Look Up Quote Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="flex gap-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter quote_id (e.g. 126)"
                className="pl-10 bg-muted/30"
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={lookupLoading}>
              {lookupLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Look Up
            </Button>
          </form>

          {/* Lookup Result */}
          {lookupResult && (
            <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {lookupResult.carrierName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Carrier</p>
                    <p className="font-medium text-sm">{lookupResult.carrierName}</p>
                    {lookupResult.carrierSCAC && <p className="text-xs text-muted-foreground">{lookupResult.carrierSCAC}</p>}
                  </div>
                )}
                {lookupResult.serviceLevel && (
                  <div>
                    <p className="text-xs text-muted-foreground">Service Level</p>
                    <p className="font-medium text-sm">{lookupResult.serviceLevel}</p>
                  </div>
                )}
                {lookupResult.priceTotal != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Total Price</p>
                    <p className="font-bold text-lg text-primary">
                      ${Number(lookupResult.priceTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {lookupResult.priceLineHaul != null && (
                      <p className="text-xs text-muted-foreground">
                        Linehaul: ${Number(lookupResult.priceLineHaul).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {(lookupResult.priceFuelSurcharge ?? 0) > 0 && ` | Fuel: $${Number(lookupResult.priceFuelSurcharge).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </p>
                    )}
                  </div>
                )}
                {lookupResult.transitTime != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Transit Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="font-medium text-sm">{lookupResult.transitTime} {lookupResult.transitTime === 1 ? 'day' : 'days'}</p>
                    </div>
                  </div>
                )}
              </div>
              {lookupResult.apiQuoteNumber && (
                <p className="text-xs text-muted-foreground mt-3">
                  API Quote: {lookupResult.apiQuoteNumber}
                  {lookupResult.tariffDescription && ` | ${lookupResult.tariffDescription}`}
                </p>
              )}
              <details className="mt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Show raw data</summary>
                <pre className="mt-2 text-xs bg-muted/50 rounded p-3 overflow-x-auto max-h-48">
                  {JSON.stringify(lookupResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Quote ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>Cheapest</TableHead>
                <TableHead>Fastest</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No quotes found. Click "New LTL Quote" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setLookupId(String(quote.id));
                    }}
                  >
                    <TableCell className="font-mono text-xs font-medium text-primary">
                      #{quote.id}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-medium">
                          {quote.origin_city || quote.origin_zip}
                          {quote.origin_state && `, ${quote.origin_state}`}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">
                          {quote.destination_city || quote.destination_zip}
                          {quote.destination_state && `, ${quote.destination_state}`}
                        </span>
                      </div>
                      {quote.distance_miles > 0 && (
                        <p className="text-xs text-muted-foreground">{Math.round(quote.distance_miles)} mi</p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm">{quote.total_weight.toLocaleString()} lbs</div>
                      <div className="text-xs text-muted-foreground">
                        {quote.total_handling_units} unit{quote.total_handling_units !== 1 ? 's' : ''}, {quote.total_pieces} pc{quote.total_pieces !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)}>
                        {quote.status || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{quote.quotes_received || 0}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {quote.cheapest_price > 0 ? (
                        <div>
                          <span className="font-semibold text-green-500">
                            ${quote.cheapest_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{quote.cheapest_carrier}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {quote.fastest_carrier && quote.fastest_carrier !== '' ? (
                        <div>
                          {quote.fastest_transit > 0 && (
                            <span className="font-medium text-blue-500">{quote.fastest_transit}d transit</span>
                          )}
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{quote.fastest_carrier}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                      {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
