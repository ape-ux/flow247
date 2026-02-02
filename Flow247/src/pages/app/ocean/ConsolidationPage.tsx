import { useState } from 'react';
import { Layers, Plus, Search, Filter, Ship, Calendar, Package, Container, MoreHorizontal, CheckCircle2, Clock, Users, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const mockConsolidations = [
  {
    id: 'CON-2024-W05',
    week: 'Week 05 (Feb 01-07)',
    destination: 'Los Angeles, CA',
    carrier: 'Maersk Line',
    vessel: 'MSC ISTANBUL',
    cutoff: 'Jan 30, 2025',
    etd: 'Feb 01, 2025',
    eta: 'Feb 18, 2025',
    shipments: 8,
    totalPieces: 245,
    totalWeight: '12,500 kg',
    totalVolume: '58.5 CBM',
    containerType: "40' HC",
    utilization: 85,
    status: 'Open',
  },
  {
    id: 'CON-2024-W05-NY',
    week: 'Week 05 (Feb 01-07)',
    destination: 'New York, NY',
    carrier: 'Hapag-Lloyd',
    vessel: 'HAMBURG EXPRESS',
    cutoff: 'Feb 01, 2025',
    etd: 'Feb 03, 2025',
    eta: 'Mar 03, 2025',
    shipments: 5,
    totalPieces: 180,
    totalWeight: '8,200 kg',
    totalVolume: '42.0 CBM',
    containerType: "40' HC",
    utilization: 62,
    status: 'Open',
  },
  {
    id: 'CON-2024-W04',
    week: 'Week 04 (Jan 25-31)',
    destination: 'Los Angeles, CA',
    carrier: 'CMA CGM',
    vessel: 'CMA CGM MARCO POLO',
    cutoff: 'Jan 23, 2025',
    etd: 'Jan 25, 2025',
    eta: 'Feb 12, 2025',
    shipments: 12,
    totalPieces: 380,
    totalWeight: '18,900 kg',
    totalVolume: '67.2 CBM',
    containerType: "40' HC",
    utilization: 98,
    status: 'Closed',
  },
  {
    id: 'CON-2024-W04-SEA',
    week: 'Week 04 (Jan 25-31)',
    destination: 'Seattle, WA',
    carrier: 'Evergreen',
    vessel: 'EVER GIVEN',
    cutoff: 'Jan 22, 2025',
    etd: 'Jan 24, 2025',
    eta: 'Feb 05, 2025',
    shipments: 6,
    totalPieces: 150,
    totalWeight: '9,500 kg',
    totalVolume: '45.0 CBM',
    containerType: "40' GP",
    utilization: 75,
    status: 'Shipped',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Open':
      return { variant: 'success' as const, color: 'text-green-500' };
    case 'Closed':
      return { variant: 'warning' as const, color: 'text-amber-500' };
    case 'Shipped':
      return { variant: 'info' as const, color: 'text-blue-500' };
    default:
      return { variant: 'secondary' as const, color: 'text-muted-foreground' };
  }
};

const getUtilizationColor = (utilization: number) => {
  if (utilization >= 90) return 'bg-green-500';
  if (utilization >= 70) return 'bg-amber-500';
  return 'bg-blue-500';
};

export default function ConsolidationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Weekly Consolidation</h1>
            <p className="text-sm text-muted-foreground">Manage LCL consolidation shipments</p>
          </div>
        </div>
        <Button className="gradient-primary glow-cyan">
          <Plus className="mr-2 h-4 w-4" />
          New Consolidation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Open Consols', value: '4', change: 'Accepting cargo', color: 'text-green-500' },
          { label: 'This Week', value: '2', change: 'Departing soon', color: 'text-primary' },
          { label: 'Avg Utilization', value: '82%', change: 'Last 4 weeks', color: 'text-amber-500' },
          { label: 'Total Shipments', value: '31', change: 'In consolidation', color: 'text-blue-500' },
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
            placeholder="Search by consolidation ID or destination..."
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

      {/* Consolidation Cards */}
      <div className="grid gap-4">
        {mockConsolidations.map((consol, i) => {
          const statusConfig = getStatusConfig(consol.status);
          return (
            <div
              key={consol.id}
              className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Container className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-primary">{consol.id}</p>
                        <Badge variant={statusConfig.variant}>{consol.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{consol.week}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {consol.status === 'Open' && (
                      <Button size="sm" className="gradient-primary glow-cyan">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Cargo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-medium">{consol.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carrier / Vessel</p>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{consol.carrier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{consol.vessel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{consol.etd}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{consol.eta}</span>
                    </div>
                    <p className="text-xs text-amber-500">Cutoff: {consol.cutoff}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo Summary</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{consol.shipments} shipments</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{consol.totalPieces} pcs / {consol.totalVolume}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Container Utilization</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getUtilizationColor(consol.utilization)}`}
                          style={{ width: `${consol.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{consol.utilization}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{consol.containerType}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
