import { useState, useEffect, useCallback } from 'react';
import { Ship, Plus, Search, Filter, MapPin, MoreHorizontal, Plane, Truck, Package, Loader2, RefreshCw } from 'lucide-react';
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
import { getShipments, type Shipment } from '@/lib/xano';

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'in_transit': case 'in transit': return 'info';
    case 'booked': case 'at port': return 'warning';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
};

const formatLocation = (loc: any): string => {
  if (!loc) return '-';
  if (typeof loc === 'string') return loc;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(', ') || loc.zip || '-';
};

export default function ShipmentsPage() {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShipments({ limit: 50 });
      if (res.data) {
        const d = res.data;
        setShipments(Array.isArray(d) ? d : (d as any).items || []);
      } else if (res.error) {
        toast.error('Failed to load shipments: ' + res.error);
      }
    } catch {
      toast.error('Failed to load shipments');
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
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Shipments</h1>
            <p className="text-sm text-muted-foreground">Track and manage your shipments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gradient-primary glow-cyan" asChild>
            <Link to="/app/shipments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Shipments', value: loading ? '-' : String(shipments.length), change: '', color: 'text-primary' },
          { label: 'In Transit', value: loading ? '-' : String(shipments.filter(s => s.status === 'in_transit').length), change: '', color: 'text-blue-400' },
          { label: 'Pending', value: loading ? '-' : String(shipments.filter(s => s.status === 'pending').length), change: '', color: 'text-yellow-400' },
          { label: 'Delivered', value: loading ? '-' : String(shipments.filter(s => s.status === 'delivered').length), change: '', color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
            </p>
            {stat.change && <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shipments, carriers, or tracking numbers..."
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
              <TableHead>Tracking #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
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
              shipments.map((shipment, i) => (
                <TableRow
                  key={shipment.id}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <TableCell className="font-medium text-primary">
                    {shipment.tracking_number || `SHP-${shipment.id}`}
                  </TableCell>
                  <TableCell>{shipment.carrier_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {formatLocation(shipment.origin)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {formatLocation(shipment.destination)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(shipment.status)}>
                      {shipment.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {shipment.total_cost != null ? `$${Number(shipment.total_cost).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : '-'}
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
