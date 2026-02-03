import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Truck,
  FileText,
  Package,
  CheckCircle2,
  Send,
  ClipboardCheck,
  XCircle,
  Upload,
  File,
  RefreshCw,
  DollarSign,
  Calendar,
  Building2,
  User,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getShipmentByTaiId, updateShipment, type Shipment } from '@/lib/xano';
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

// Status workflow order
const STATUS_FLOW: Shipment['status'][] = ['Committed', 'Booked', 'Ready', 'InTransit', 'Delivered'];

const STATUS_ACTIONS: Record<string, { label: string; icon: React.ElementType; color: string; next: Shipment['status'] }> = {
  Committed: { label: 'Book Shipment', icon: ClipboardCheck, color: 'bg-amber-500 hover:bg-amber-600', next: 'Booked' },
  Booked: { label: 'Mark Ready', icon: Package, color: 'bg-blue-500 hover:bg-blue-600', next: 'Ready' },
  Ready: { label: 'Dispatch', icon: Send, color: 'bg-indigo-500 hover:bg-indigo-600', next: 'InTransit' },
  InTransit: { label: 'Mark Delivered', icon: CheckCircle2, color: 'bg-green-500 hover:bg-green-600', next: 'Delivered' },
};

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { xanoReady, xanoUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Shipment>>({});

  const loadShipment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Always search by TAI shipment ID via the list endpoint (works for both TAI IDs and SHP-* names)
      const res = await getShipmentByTaiId(id);
      if (res.data) {
        setShipment(res.data);
        setForm(res.data);
      } else {
        toast.error('Shipment not found');
        navigate('/app/shipments');
      }
    } catch {
      toast.error('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (xanoReady && xanoUser) {
      loadShipment();
    }
  }, [xanoReady, xanoUser, loadShipment]);

  const handleSave = async () => {
    if (!shipment) return;
    setSaving(true);
    try {
      const res = await updateShipment(shipment.id, form);
      if (res.data) {
        setShipment(res.data);
        setForm(res.data);
        setEditMode(false);
        toast.success('Shipment updated successfully');
      } else {
        toast.error('Failed to update: ' + (res.error || 'Unknown error'));
      }
    } catch {
      toast.error('Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Shipment['status']) => {
    if (!shipment) return;
    setSaving(true);
    try {
      const updates: Partial<Shipment> = { status: newStatus };
      if (newStatus === 'InTransit') {
        updates.dispatched_at = new Date().toISOString();
      }
      if (newStatus === 'Delivered') {
        updates.actual_delivery = new Date().toISOString();
      }
      const res = await updateShipment(shipment.id, updates);
      if (res.data) {
        setShipment(res.data);
        setForm(res.data);
        toast.success(`Status updated to ${formatStatus(newStatus)}`);
      } else {
        toast.error('Failed to update status: ' + (res.error || 'Unknown error'));
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!shipment) return;
    if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
    setSaving(true);
    try {
      const res = await updateShipment(shipment.id, { status: 'Canceled' });
      if (res.data) {
        setShipment(res.data);
        setForm(res.data);
        toast.success('Shipment canceled');
      } else {
        toast.error('Failed to cancel: ' + (res.error || 'Unknown error'));
      }
    } catch {
      toast.error('Failed to cancel shipment');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Shipment not found.
        <br />
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/shipments')}>
          Back to Shipments
        </Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(shipment.status);
  const nextAction = STATUS_ACTIONS[shipment.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/shipments')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Shipment {shipment.tai_shipment_id || `#${shipment.id}`}
              <Badge variant={getStatusVariant(shipment.status)} className="ml-2">
                {formatStatus(shipment.status)}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : '-'}
              {shipment.tenant_id ? ` | Tenant: ${shipment.tenant_id}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadShipment} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" size="sm" onClick={() => { setEditMode(false); setForm(shipment); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Status Workflow Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Shipment Status</h3>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 mb-5">
            {STATUS_FLOW.map((status, i) => {
              const isActive = i <= currentStatusIndex;
              const isCurrent = status === shipment.status;
              return (
                <div key={status} className="flex-1 flex items-center">
                  <div className={`flex-1 h-2 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-muted'} ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-5">
            {STATUS_FLOW.map(s => (
              <span key={s} className={s === shipment.status ? 'text-primary font-semibold' : ''}>{formatStatus(s)}</span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {nextAction && shipment.status !== 'Canceled' && shipment.status !== 'Delivered' && (
              <Button
                className={`${nextAction.color} text-white`}
                onClick={() => handleStatusChange(nextAction.next)}
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <nextAction.icon className="mr-2 h-4 w-4" />}
                {nextAction.label}
              </Button>
            )}
            {shipment.status !== 'Canceled' && shipment.status !== 'Delivered' && (
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={saving}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Shipment
              </Button>
            )}
            {shipment.quote_id && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/quotes`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Quote #{shipment.quote_id}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Origin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-green-500" /> Origin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Company" field="origin_company" value={form.origin_company} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Contact" field="origin_contact" value={form.origin_contact} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Street" field="origin_street" value={form.origin_street} editMode={editMode} onChange={updateForm} />
            <div className="grid grid-cols-3 gap-2">
              <FieldRow label="City" field="origin_city" value={form.origin_city} editMode={editMode} onChange={updateForm} />
              <FieldRow label="State" field="origin_state" value={form.origin_state} editMode={editMode} onChange={updateForm} />
              <FieldRow label="Zip" field="origin_zip" value={form.origin_zip} editMode={editMode} onChange={updateForm} />
            </div>
            <FieldRow label="Country" field="origin_country" value={form.origin_country} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Phone" field="origin_phone" value={form.origin_phone} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Instructions" field="origin_instructions" value={form.origin_instructions} editMode={editMode} onChange={updateForm} />
          </CardContent>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-red-500" /> Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Company" field="destination_company" value={form.destination_company} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Contact" field="destination_contact" value={form.destination_contact} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Street" field="destination_street" value={form.destination_street} editMode={editMode} onChange={updateForm} />
            <div className="grid grid-cols-3 gap-2">
              <FieldRow label="City" field="destination_city" value={form.destination_city} editMode={editMode} onChange={updateForm} />
              <FieldRow label="State" field="destination_state" value={form.destination_state} editMode={editMode} onChange={updateForm} />
              <FieldRow label="Zip" field="destination_zip" value={form.destination_zip} editMode={editMode} onChange={updateForm} />
            </div>
            <FieldRow label="Country" field="destination_country" value={form.destination_country} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Phone" field="destination_phone" value={form.destination_phone} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Instructions" field="destination_instructions" value={form.destination_instructions} editMode={editMode} onChange={updateForm} />
          </CardContent>
        </Card>

        {/* Carrier & Transport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" /> Carrier & Transport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Carrier" field="carrier_name" value={form.carrier_name} editMode={editMode} onChange={updateForm} />
            <FieldRow label="SCAC" field="carrier_scac" value={form.carrier_scac} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Service Level" field="service_level" value={form.service_level} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Equipment" field="equipment_type" value={form.equipment_type} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Shipment Type" field="shipment_type" value={form.shipment_type} editMode={editMode} onChange={updateForm} />
            <FieldRow label="PRO #" field="pro_number" value={form.pro_number} editMode={editMode} onChange={updateForm} />
            <FieldRow label="BOL #" field="bol_number" value={form.bol_number} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Tracking #" field="tracking_number" value={form.tracking_number} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Provider" field="provider" value={form.provider} editMode={editMode} onChange={updateForm} />
          </CardContent>
        </Card>

        {/* Dates & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Dates & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Pickup Date" field="pickup_date" value={form.pickup_date} editMode={editMode} onChange={updateForm} type="date" />
            <FieldRow label="Est. Delivery" field="estimated_delivery" value={form.estimated_delivery} editMode={editMode} onChange={updateForm} type="date" />
            <FieldRow label="Actual Delivery" field="actual_delivery" value={form.actual_delivery ? new Date(Number(form.actual_delivery)).toLocaleDateString() : ''} editMode={false} onChange={updateForm} />
            <FieldRow label="Dispatched" field="dispatched_at" value={form.dispatched_at ? new Date(Number(form.dispatched_at)).toLocaleDateString() : ''} editMode={false} onChange={updateForm} />
          </CardContent>
        </Card>

        {/* Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" /> Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Linehaul" field="linehaul_charge" value={form.linehaul_charge?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <FieldRow label="Fuel Surcharge" field="fuel_surcharge" value={form.fuel_surcharge?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <FieldRow label="Accessorial" field="accessorial_charge" value={form.accessorial_charge?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <FieldRow label="Discount" field="discount_amount" value={form.discount_amount?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Charge</span>
                <span className="text-xl font-bold text-primary">
                  ${Number(form.total_charge || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* References & IDs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" /> References & IDs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="TAI Shipment ID" field="tai_shipment_id" value={form.tai_shipment_id} editMode={false} onChange={updateForm} />
            <FieldRow label="Customer Ref" field="customer_reference" value={form.customer_reference} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Shipper Ref" field="shipper_reference" value={form.shipper_reference} editMode={editMode} onChange={updateForm} />
            <FieldRow label="PO Ref" field="po_reference" value={form.po_reference} editMode={editMode} onChange={updateForm} />
            <FieldRow label="File #" field="file_number" value={form.file_number} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Quote ID" field="quote_id" value={form.quote_id?.toString()} editMode={false} onChange={updateForm} />
            <FieldRow label="Tenant ID" field="tenant_id" value={form.tenant_id?.toString()} editMode={false} onChange={updateForm} />
          </CardContent>
        </Card>

        {/* Cargo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" /> Cargo Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FieldRow label="Total Weight" field="total_weight" value={form.total_weight?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <FieldRow label="Weight Units" field="weight_units" value={form.weight_units} editMode={editMode} onChange={updateForm} />
            <FieldRow label="Total Pieces" field="total_pieces" value={form.total_pieces?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
            <FieldRow label="Handling Units" field="total_handling_units" value={form.total_handling_units?.toString()} editMode={editMode} onChange={(f, v) => updateForm(f, Number(v))} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Internal Notes</label>
              {editMode ? (
                <textarea
                  className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm min-h-[80px]"
                  value={form.internal_notes || ''}
                  onChange={e => updateForm('internal_notes', e.target.value)}
                />
              ) : (
                <p className="text-sm">{shipment.internal_notes || <span className="text-muted-foreground">-</span>}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Carrier Notes</label>
              {editMode ? (
                <textarea
                  className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm min-h-[80px]"
                  value={form.carrier_notes || ''}
                  onChange={e => updateForm('carrier_notes', e.target.value)}
                />
              ) : (
                <p className="text-sm">{shipment.carrier_notes || <span className="text-muted-foreground">-</span>}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <File className="h-4 w-4" /> Documents
            </CardTitle>
            <CardDescription>BOL, invoices, POD, and other shipment documents</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* BOL */}
            <DocumentCard
              title="Bill of Lading"
              description="BOL document"
              hasFile={!!shipment.bol_number}
              url={shipment.label_url}
            />
            {/* Shipping Label */}
            <DocumentCard
              title="Shipping Label"
              description="Carrier label"
              hasFile={!!shipment.label_url}
              url={shipment.label_url}
            />
            {/* POD */}
            <DocumentCard
              title="Proof of Delivery"
              description="Delivery confirmation"
              hasFile={shipment.status === 'Delivered'}
            />
            {/* Invoice */}
            <DocumentCard
              title="Invoice"
              description="Freight invoice"
              hasFile={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable field row component
function FieldRow({
  label,
  field,
  value,
  editMode,
  onChange,
  type = 'text',
}: {
  label: string;
  field: string;
  value?: string | number | null;
  editMode: boolean;
  onChange: (field: string, value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">{label}</label>
      {editMode ? (
        <Input
          type={type}
          className="h-8 text-sm bg-muted/50"
          value={value ?? ''}
          onChange={e => onChange(field, e.target.value)}
        />
      ) : (
        <span className="text-sm text-right truncate">{value || <span className="text-muted-foreground">-</span>}</span>
      )}
    </div>
  );
}

// Document card component
function DocumentCard({
  title,
  description,
  hasFile,
  url,
}: {
  title: string;
  description: string;
  hasFile: boolean;
  url?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${hasFile ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/20'}`}>
      <File className={`h-8 w-8 mb-2 ${hasFile ? 'text-primary' : 'text-muted-foreground'}`} />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {hasFile && url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-primary hover:underline">
          Download
        </a>
      ) : hasFile ? (
        <span className="mt-2 text-xs text-green-500">Available</span>
      ) : (
        <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
          <Upload className="mr-1 h-3 w-3" /> Upload
        </Button>
      )}
    </div>
  );
}
