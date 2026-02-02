import { useState } from 'react';
import { Anchor, Plus, Search, Filter, Ship, Calendar, MapPin, Package, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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

const mockBookings = [
  {
    id: 'BKG-2024-001',
    customer: 'Acme Corporation',
    carrier: 'Maersk Line',
    vessel: 'MSC ISTANBUL',
    voyage: 'FA425E',
    pol: 'Shanghai, CN',
    pod: 'Long Beach, CA',
    etd: 'Feb 01, 2025',
    eta: 'Feb 18, 2025',
    containers: '2 x 40HC',
    status: 'Confirmed',
    commodity: 'Electronics',
  },
  {
    id: 'BKG-2024-002',
    customer: 'Global Trade Inc',
    carrier: 'CMA CGM',
    vessel: 'CMA CGM MARCO POLO',
    voyage: 'WS234N',
    pol: 'Ningbo, CN',
    pod: 'Los Angeles, CA',
    etd: 'Feb 05, 2025',
    eta: 'Feb 22, 2025',
    containers: '1 x 40HC',
    status: 'Pending',
    commodity: 'Furniture',
  },
  {
    id: 'BKG-2024-003',
    customer: 'Swift Logistics',
    carrier: 'Hapag-Lloyd',
    vessel: 'HAMBURG EXPRESS',
    voyage: 'HL890W',
    pol: 'Yantian, CN',
    pod: 'New York, NY',
    etd: 'Jan 30, 2025',
    eta: 'Feb 28, 2025',
    containers: '3 x 20GP',
    status: 'Confirmed',
    commodity: 'Textiles',
  },
  {
    id: 'BKG-2024-004',
    customer: 'Metro Imports',
    carrier: 'COSCO',
    vessel: 'COSCO SHIPPING ARIES',
    voyage: 'CS456E',
    pol: 'Qingdao, CN',
    pod: 'Savannah, GA',
    etd: 'Feb 08, 2025',
    eta: 'Mar 05, 2025',
    containers: '1 x 40HC, 1 x 20GP',
    status: 'Draft',
    commodity: 'Auto Parts',
  },
  {
    id: 'BKG-2024-005',
    customer: 'Pacific Traders',
    carrier: 'Evergreen',
    vessel: 'EVER GIVEN',
    voyage: 'EG789S',
    pol: 'Busan, KR',
    pod: 'Seattle, WA',
    etd: 'Feb 03, 2025',
    eta: 'Feb 15, 2025',
    containers: '2 x 40GP',
    status: 'Confirmed',
    commodity: 'Machinery',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return { variant: 'success' as const, icon: CheckCircle2 };
    case 'Pending':
      return { variant: 'warning' as const, icon: Clock };
    case 'Draft':
      return { variant: 'secondary' as const, icon: AlertCircle };
    default:
      return { variant: 'secondary' as const, icon: AlertCircle };
  }
};

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Anchor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ocean Bookings</h1>
            <p className="text-sm text-muted-foreground">Manage your ocean freight bookings</p>
          </div>
        </div>
        <Button className="gradient-primary glow-cyan">
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Bookings', value: '28', change: 'This month', color: 'text-primary' },
          { label: 'Confirmed', value: '18', change: '64% of total', color: 'text-green-500' },
          { label: 'Pending', value: '7', change: 'Awaiting confirmation', color: 'text-amber-500' },
          { label: 'Draft', value: '3', change: 'Incomplete', color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings by ID, customer, or vessel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <TableHead>Booking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Carrier / Vessel</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>ETD</TableHead>
              <TableHead>Containers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBookings.map((booking, i) => {
              const statusConfig = getStatusConfig(booking.status);
              return (
                <TableRow
                  key={booking.id}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <TableCell className="font-medium text-primary">{booking.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.customer}</p>
                      <p className="text-xs text-muted-foreground">{booking.commodity}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{booking.carrier}</p>
                        <p className="text-xs text-muted-foreground">{booking.vessel}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <span>{booking.pol}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{booking.pod}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{booking.etd}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{booking.containers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
