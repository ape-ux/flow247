import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Filter, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getQuotes, type QuoteResult } from '@/lib/xano';

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'accepted': return 'success';
    case 'rejected': return 'destructive';
    default: return 'warning';
  }
};

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteResult[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQuotes({ limit: 50 });
      if (res.data) {
        const d = res.data;
        setQuotes(Array.isArray(d) ? d : (d as any).items || []);
      } else if (res.error) {
        toast.error('Failed to load quotes: ' + res.error);
      }
    } catch {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quotes</h1>
            <p className="text-sm text-muted-foreground">Manage your freight quotes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gradient-primary glow-cyan" asChild>
            <Link to="/app/quotes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Quotes', value: loading ? '-' : String(quotes.length), change: '' },
          { label: 'Carriers', value: loading ? '-' : String(new Set(quotes.map(q => q.carrier_name)).size), change: '' },
          { label: 'Avg. Rate', value: loading ? '-' : quotes.length > 0 ? `$${Math.round(quotes.reduce((sum, q) => sum + (q.total_rate || 0), 0) / quotes.length).toLocaleString()}` : '-', change: '' },
          { label: 'Avg. Transit', value: loading ? '-' : quotes.length > 0 ? `${Math.round(quotes.reduce((sum, q) => sum + (q.transit_days || 0), 0) / quotes.length)} days` : '-', change: '' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
            </p>
            {stat.change && <p className="mt-1 text-xs text-primary">{stat.change}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Carrier</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Transit Days</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No quotes found.
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote, i) => (
                <TableRow
                  key={`${quote.carrier_id}-${i}`}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <TableCell className="font-medium text-primary">{quote.carrier_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {quote.service_type || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {quote.total_rate != null ? `$${Number(quote.total_rate).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.transit_days != null ? `${quote.transit_days} days` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
