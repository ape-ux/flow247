import { useState } from 'react';
import { Warehouse, Plus, Search, Filter, Package, Calendar, MapPin, FileText, MoreHorizontal, CheckCircle2, Clock, Truck, Download } from 'lucide-react';
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

const mockReceipts = [
  {
    id: 'WR-2024-001',
    customer: 'Acme Corporation',
    warehouse: 'LA CFS Terminal',
    receiptDate: 'Jan 25, 2025',
    pieces: 45,
    weight: '2,450 kg',
    volume: '12.5 CBM',
    commodity: 'Electronics',
    status: 'Received',
    booking: 'BKG-2024-001',
    notes: 'Fragile - Handle with care',
  },
  {
    id: 'WR-2024-002',
    customer: 'Global Trade Inc',
    warehouse: 'LA CFS Terminal',
    receiptDate: 'Jan 26, 2025',
    pieces: 120,
    weight: '5,800 kg',
    volume: '28.0 CBM',
    commodity: 'Furniture',
    status: 'Stuffed',
    booking: 'BKG-2024-002',
    notes: 'Consolidation shipment',
  },
  {
    id: 'WR-2024-003',
    customer: 'Swift Logistics',
    warehouse: 'NY CFS Terminal',
    receiptDate: 'Jan 24, 2025',
    pieces: 80,
    weight: '3,200 kg',
    volume: '15.0 CBM',
    commodity: 'Textiles',
    status: 'Pending',
    booking: 'BKG-2024-003',
    notes: '',
  },
  {
    id: 'WR-2024-004',
    customer: 'Metro Imports',
    warehouse: 'LA CFS Terminal',
    receiptDate: 'Jan 27, 2025',
    pieces: 25,
    weight: '4,100 kg',
    volume: '8.5 CBM',
    commodity: 'Auto Parts',
    status: 'In Transit',
    booking: 'BKG-2024-004',
    notes: 'Heavy items - Forklift required',
  },
  {
    id: 'WR-2024-005',
    customer: 'Pacific Traders',
    warehouse: 'SEA CFS Terminal',
    receiptDate: 'Jan 23, 2025',
    pieces: 60,
    weight: '8,500 kg',
    volume: '22.0 CBM',
    commodity: 'Machinery',
    status: 'Stuffed',
    booking: 'BKG-2024-005',
    notes: 'Oversized pieces',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Received':
      return { variant: 'info' as const, icon: Package };
    case 'Stuffed':
      return { variant: 'success' as const, icon: CheckCircle2 };
    case 'In Transit':
      return { variant: 'warning' as const, icon: Truck };
    case 'Pending':
      return { variant: 'secondary' as const, icon: Clock };
    default:
      return { variant: 'secondary' as const, icon: Clock };
  }
};

export default function WarehouseReceiptsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Warehouse className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Warehouse Receipts</h1>
            <p className="text-sm text-muted-foreground">Track cargo received at CFS warehouses</p>
          </div>
        </div>
        <Button className="gradient-primary glow-cyan">
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Receipts', value: '156', change: 'This month', color: 'text-primary' },
          { label: 'Pending Stuffing', value: '12', change: 'Awaiting container', color: 'text-amber-500' },
          { label: 'Stuffed', value: '98', change: 'Ready to ship', color: 'text-green-500' },
          { label: 'Total Volume', value: '1,245 CBM', change: 'In warehouse', color: 'text-blue-500' },
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
            placeholder="Search by receipt #, customer, or booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Receipt #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReceipts.map((receipt, i) => {
              const statusConfig = getStatusConfig(receipt.status);
              return (
                <TableRow
                  key={receipt.id}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">{receipt.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{receipt.customer}</p>
                      <p className="text-xs text-muted-foreground">{receipt.commodity}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{receipt.warehouse}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{receipt.receiptDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{receipt.pieces} pcs</p>
                      <p className="text-xs text-muted-foreground">{receipt.weight} / {receipt.volume}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-primary">{receipt.booking}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {receipt.status}
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
