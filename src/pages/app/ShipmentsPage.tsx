import { useState, useEffect } from 'react';
import { Ship, Plus, MapPin, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    // Load shipments from localStorage
    const savedShipments = JSON.parse(localStorage.getItem('savedShipments') || '[]');
    setShipments(savedShipments);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Ship className="h-6 w-6 text-primary" />
          Shipments
        </h1>
        <Button variant="hero" onClick={() => navigate('/app/shipments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Shipment
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment ID</TableHead>
              <TableHead>TAI Shipment ID</TableHead>
              <TableHead>PRO Number</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transit Days</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Est. Delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No shipments found. Book a shipment from a quote to get started.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">#{shipment.id}</TableCell>
                  <TableCell>{shipment.tai_shipment_id}</TableCell>
                  <TableCell>{shipment.pro_number || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shipment.carrier.name}</div>
                      <div className="text-xs text-muted-foreground">{shipment.carrier.scac}</div>
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {shipment.origin.city}, {shipment.origin.state} {shipment.origin.zip}
                  </TableCell>
                  <TableCell>{shipment.destination.city}, {shipment.destination.state} {shipment.destination.zip}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        shipment.status === 'Delivered'
                          ? 'bg-green-500/20 text-green-400'
                          : shipment.status === 'In Transit'
                          ? 'bg-blue-500/20 text-blue-400'
                          : shipment.status === 'Booked'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }
                    >
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{shipment.transit_days} days</TableCell>
                  <TableCell>${shipment.charges.total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(shipment.estimated_delivery).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/app/shipments/edit', { state: { shipment } })}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Record
                      </Button>
                      {shipment.needs_dispatch && (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                          Needs BOL
                        </Badge>
                      )}
                    </div>
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
