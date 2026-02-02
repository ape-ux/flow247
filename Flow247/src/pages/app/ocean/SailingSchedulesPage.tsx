import { useState } from 'react';
import { Calendar, Search, Filter, Ship, MapPin, Clock, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const mockSchedules = [
  {
    id: 'SCH-001',
    carrier: 'Maersk Line',
    vessel: 'MSC ISTANBUL',
    voyage: 'FA425E',
    service: 'TP6 - Transpacific',
    pol: 'Shanghai, CN',
    pod: 'Long Beach, CA',
    etd: 'Feb 01, 2025',
    eta: 'Feb 18, 2025',
    transitDays: 17,
    cutoff: 'Jan 30, 2025',
    spaces: 'Available',
    frequency: 'Weekly',
  },
  {
    id: 'SCH-002',
    carrier: 'CMA CGM',
    vessel: 'CMA CGM MARCO POLO',
    voyage: 'WS234N',
    service: 'Pearl River Express',
    pol: 'Ningbo, CN',
    pod: 'Los Angeles, CA',
    etd: 'Feb 05, 2025',
    eta: 'Feb 22, 2025',
    transitDays: 17,
    cutoff: 'Feb 03, 2025',
    spaces: 'Limited',
    frequency: 'Weekly',
  },
  {
    id: 'SCH-003',
    carrier: 'Hapag-Lloyd',
    vessel: 'HAMBURG EXPRESS',
    voyage: 'HL890W',
    service: 'EC1 - East Coast',
    pol: 'Yantian, CN',
    pod: 'New York, NY',
    etd: 'Feb 03, 2025',
    eta: 'Mar 03, 2025',
    transitDays: 28,
    cutoff: 'Feb 01, 2025',
    spaces: 'Available',
    frequency: 'Weekly',
  },
  {
    id: 'SCH-004',
    carrier: 'COSCO',
    vessel: 'COSCO SHIPPING ARIES',
    voyage: 'CS456E',
    service: 'AAC - All Water',
    pol: 'Qingdao, CN',
    pod: 'Savannah, GA',
    etd: 'Feb 08, 2025',
    eta: 'Mar 05, 2025',
    transitDays: 25,
    cutoff: 'Feb 06, 2025',
    spaces: 'Full',
    frequency: 'Bi-Weekly',
  },
  {
    id: 'SCH-005',
    carrier: 'Evergreen',
    vessel: 'EVER GIVEN',
    voyage: 'EG789S',
    service: 'NWC - Northwest',
    pol: 'Busan, KR',
    pod: 'Seattle, WA',
    etd: 'Feb 03, 2025',
    eta: 'Feb 15, 2025',
    transitDays: 12,
    cutoff: 'Feb 01, 2025',
    spaces: 'Available',
    frequency: 'Weekly',
  },
  {
    id: 'SCH-006',
    carrier: 'MSC',
    vessel: 'MSC OSCAR',
    voyage: 'MS123W',
    service: 'Dragon - TP',
    pol: 'Xiamen, CN',
    pod: 'Oakland, CA',
    etd: 'Feb 10, 2025',
    eta: 'Feb 28, 2025',
    transitDays: 18,
    cutoff: 'Feb 08, 2025',
    spaces: 'Available',
    frequency: 'Weekly',
  },
];

const getSpacesBadge = (spaces: string) => {
  switch (spaces) {
    case 'Available':
      return <Badge variant="success">Available</Badge>;
    case 'Limited':
      return <Badge variant="warning">Limited</Badge>;
    case 'Full':
      return <Badge variant="destructive">Full</Badge>;
    default:
      return <Badge variant="secondary">{spaces}</Badge>;
  }
};

export default function SailingSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('Feb 01 - Feb 07, 2025');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sailing Schedules</h1>
            <p className="text-sm text-muted-foreground">View available sailings and book space</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Schedules
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Origin Port</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="e.g., Shanghai" className="pl-10 bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Port</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="e.g., Los Angeles" className="pl-10 bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Departure Date</label>
            <Input type="date" className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <Button className="w-full gradient-primary glow-cyan">
              <Search className="mr-2 h-4 w-4" />
              Search Sailings
            </Button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">{selectedWeek}</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Carriers</Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid gap-4">
        {mockSchedules.map((schedule, i) => (
          <div
            key={schedule.id}
            className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Carrier & Vessel */}
              <div className="flex items-center gap-4 lg:w-1/4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{schedule.carrier}</p>
                  <p className="text-sm text-muted-foreground">{schedule.vessel}</p>
                  <p className="text-xs text-muted-foreground">Voyage: {schedule.voyage}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 lg:w-1/4">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-medium">{schedule.pol}</p>
                    <p className="text-xs text-muted-foreground">{schedule.etd}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{schedule.transitDays}d</span>
                  </div>
                  <div>
                    <p className="font-medium">{schedule.pod}</p>
                    <p className="text-xs text-muted-foreground">{schedule.eta}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-4 lg:w-1/4">
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="text-sm font-medium">{schedule.service}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cutoff</p>
                  <p className="text-sm font-medium text-amber-500">{schedule.cutoff}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="text-sm">{schedule.frequency}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 lg:w-1/4 lg:justify-end">
                {getSpacesBadge(schedule.spaces)}
                <Button
                  size="sm"
                  className={schedule.spaces === 'Full' ? '' : 'gradient-primary glow-cyan'}
                  disabled={schedule.spaces === 'Full'}
                >
                  {schedule.spaces === 'Full' ? 'Waitlist' : 'Book Now'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
