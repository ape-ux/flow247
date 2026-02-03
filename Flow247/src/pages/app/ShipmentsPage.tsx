import { useState, useEffect, useCallback } from 'react';
import { Ship, Plus, Search, Filter, Loader2, RefreshCw, ArrowUpDown } from 'lucide-react';
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
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getShipments, type Shipment } from '@/lib/xano';
import { useAuth } from '@/contexts/AuthContext';

const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'destructive' | 'secondary' | 'default' => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'InTransit': return 'info';
    case 'Booked': case 'Ready': return 'warning';
    case 'Committed': return 'default';
    case 'Canceled': return 'destructive';
    default: return 'secondary';
  }
};

const formatStatus = (status: string) => {
  if (status === 'InTransit') return 'In Transit';
  return status || '-';
};

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { xanoReady, xanoUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShipments({
        limit: 20,
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (res.data) {
        setShipments(res.data.items || []);
        setTotal(res.data.total || 0);
      } else if (res.error) {
        toast.error('Failed to load shipments: ' + res.error);
      }
    } catch {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (xanoReady && xanoUser) {
      loadData();
    }
  }, [xanoReady, xanoUser, loadData]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const statusOptions = ['', 'Committed', 'Booked', 'Ready', 'InTransit', 'Delivered', 'Canceled'];

  const stats = [
    { label: 'Total', value: total, color: 'text-primary' },
    { label: 'Booked', value: shipments.filter(s => s.status === 'Booked').length, color: 'text-amber-400' },
    { label: 'In Transit', value: shipments.filter(s => s.status === 'InTransit').length, color: 'text-blue-400' },
    { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Shipments</h1>
            <p className="text-sm text-muted-foreground">Track and manage all shipments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gradient-primary" asChild>
            <Link to="/app/shipments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by TAI ID, tracking #, carrier, city..."
            className="pl-10 bg-muted/50 border-border/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
        <select
          className="h-10 rounded-md border border-border/50 bg-muted/50 px-3 text-sm"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {statusOptions.filter(Boolean).map(s => (
            <option key={s} value={s}>{s === 'InTransit' ? 'In Transit' : s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="cursor-pointer" onClick={() => handleSort('tai_shipment_id')}>
                  <span className="flex items-center gap-1">TAI ID <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('total_charge')}>
                  <span className="flex items-center justify-end gap-1">Total <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead>Pickup Date</TableHead>
                <TableHead>Tenant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No shipments found.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/shipments/${shipment.tai_shipment_id || shipment.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-primary">
                      {shipment.tai_shipment_id || `SHP-${shipment.id}`}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <span className="font-medium">{shipment.origin_city || '-'}</span>
                        {shipment.origin_state && <span className="text-muted-foreground">, {shipment.origin_state}</span>}
                      </div>
                      {shipment.origin_zip && <span className="text-xs text-muted-foreground">{shipment.origin_zip}</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <span className="font-medium">{shipment.destination_city || '-'}</span>
                        {shipment.destination_state && <span className="text-muted-foreground">, {shipment.destination_state}</span>}
                      </div>
                      {shipment.destination_zip && <span className="text-xs text-muted-foreground">{shipment.destination_zip}</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{shipment.carrier_name || '-'}</div>
                      {shipment.carrier_scac && <span className="text-xs text-muted-foreground">{shipment.carrier_scac}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(shipment.status)}>
                        {formatStatus(shipment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {shipment.total_charge ? `$${Number(shipment.total_charge).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {shipment.pickup_date || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {shipment.tenant_id || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && total > 20 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / 20)} ({total} shipments)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
