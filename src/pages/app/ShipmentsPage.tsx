import { Ship, Plus, MapPin } from 'lucide-react';
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

const mockShipments = [
  { id: 'SHP-2024-001', carrier: 'FedEx Freight', origin: 'Los Angeles, CA', destination: 'New York, NY', status: 'In Transit', eta: 'Dec 18, 2024' },
  { id: 'SHP-2024-002', carrier: 'UPS Freight', origin: 'Chicago, IL', destination: 'Miami, FL', status: 'Delivered', eta: 'Dec 15, 2024' },
  { id: 'SHP-2024-003', carrier: 'Old Dominion', origin: 'Seattle, WA', destination: 'Dallas, TX', status: 'Pending', eta: 'Dec 20, 2024' },
  { id: 'SHP-2024-004', carrier: 'XPO Logistics', origin: 'Denver, CO', destination: 'Phoenix, AZ', status: 'In Transit', eta: 'Dec 17, 2024' },
];

export default function ShipmentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Ship className="h-6 w-6 text-primary" />
          Shipments
        </h1>
        <Button variant="hero">
          <Plus className="mr-2 h-4 w-4" />
          New Shipment
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">{shipment.id}</TableCell>
                <TableCell>{shipment.carrier}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {shipment.origin}
                </TableCell>
                <TableCell>{shipment.destination}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      shipment.status === 'Delivered'
                        ? 'bg-green-500/20 text-green-400'
                        : shipment.status === 'In Transit'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }
                  >
                    {shipment.status}
                  </Badge>
                </TableCell>
                <TableCell>{shipment.eta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
