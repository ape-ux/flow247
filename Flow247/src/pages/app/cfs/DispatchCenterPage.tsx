import { useState, useEffect, useCallback } from 'react';
import {
  Truck, Package, Loader2, RefreshCw, Search, MapPin, Calendar,
  Container, Send, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getDispatchPending, requestDispatch,
  type DispatchRequest
} from '@/lib/xano';

export default function DispatchCenterPage() {
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cfsFilter, setCfsFilter] = useState('');
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const [dispatchForm, setDispatchForm] = useState<DispatchRequest>({
    house_bill_number: '',
    delivery_company: '',
    delivery_contact: '',
    delivery_street: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip: '',
    delivery_phone: '',
    preferred_pickup_date: '',
    customer_reference: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDispatchPending({
        page: 1,
        per_page: 50,
        cfs_code: cfsFilter || undefined,
      });
      if (res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any).items || [];
        setPendingItems(items);
      } else {
        toast.error(res.error || 'Failed to load dispatch data');
      }
    } catch {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  }, [cfsFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDispatch = async () => {
    if (!dispatchForm.house_bill_number) {
      toast.error('HBL number is required');
      return;
    }
    setDispatching(true);
    try {
      const res = await requestDispatch(dispatchForm);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Dispatch request submitted');
        setShowDispatchForm(false);
        setDispatchForm({
          house_bill_number: '', delivery_company: '', delivery_contact: '',
          delivery_street: '', delivery_city: '', delivery_state: '',
          delivery_zip: '', delivery_phone: '', preferred_pickup_date: '',
          customer_reference: '',
        });
        loadData();
      }
    } catch {
      toast.error('Failed to submit dispatch request');
    } finally {
      setDispatching(false);
    }
  };

  const startDispatch = (item: any) => {
    setDispatchForm(prev => ({
      ...prev,
      house_bill_number: item.house_bill_number || item.hbl || '',
    }));
    setShowDispatchForm(true);
  };

  const filtered = searchQuery
    ? pendingItems.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.house_bill_number?.toLowerCase().includes(q) ||
          item.container_number?.toLowerCase().includes(q) ||
          item.consignee?.toLowerCase().includes(q)
        );
      })
    : pendingItems;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Truck className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dispatch Center</h1>
            <p className="text-sm text-muted-foreground">Manage pickup requests and dispatches</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="gradient-primary glow-cyan" size="sm" onClick={() => setShowDispatchForm(!showDispatchForm)}>
            <Send className="mr-2 h-4 w-4" />
            New Dispatch
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Pickup', value: pendingItems.length, icon: Package, color: 'text-amber-500' },
          { label: 'Ready for Dispatch', value: pendingItems.filter((i: any) => i.available_for_pickup || i.status === 'AVAILABLE_PICKUP').length, icon: Truck, color: 'text-green-500' },
          { label: 'Awaiting Docs', value: pendingItems.filter((i: any) => i.status === 'DOCS_PENDING').length, icon: Clock, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Form */}
      {showDispatchForm && (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">New Dispatch Request</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">HBL Number *</label>
              <Input
                value={dispatchForm.house_bill_number}
                onChange={(e) => setDispatchForm(f => ({ ...f, house_bill_number: e.target.value }))}
                placeholder="HBL number"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Company</label>
              <Input
                value={dispatchForm.delivery_company}
                onChange={(e) => setDispatchForm(f => ({ ...f, delivery_company: e.target.value }))}
                placeholder="Delivery company"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Contact</label>
              <Input
                value={dispatchForm.delivery_contact}
                onChange={(e) => setDispatchForm(f => ({ ...f, delivery_contact: e.target.value }))}
                placeholder="Contact name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Street</label>
              <Input
                value={dispatchForm.delivery_street}
                onChange={(e) => setDispatchForm(f => ({ ...f, delivery_street: e.target.value }))}
                placeholder="Street address"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">City</label>
              <Input
                value={dispatchForm.delivery_city}
                onChange={(e) => setDispatchForm(f => ({ ...f, delivery_city: e.target.value }))}
                placeholder="City"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">State</label>
                <Input
                  value={dispatchForm.delivery_state}
                  onChange={(e) => setDispatchForm(f => ({ ...f, delivery_state: e.target.value }))}
                  placeholder="FL"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">ZIP</label>
                <Input
                  value={dispatchForm.delivery_zip}
                  onChange={(e) => setDispatchForm(f => ({ ...f, delivery_zip: e.target.value }))}
                  placeholder="33101"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input
                value={dispatchForm.delivery_phone}
                onChange={(e) => setDispatchForm(f => ({ ...f, delivery_phone: e.target.value }))}
                placeholder="305-555-1234"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Preferred Pickup Date</label>
              <Input
                type="date"
                value={dispatchForm.preferred_pickup_date}
                onChange={(e) => setDispatchForm(f => ({ ...f, preferred_pickup_date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Customer Reference</label>
              <Input
                value={dispatchForm.customer_reference}
                onChange={(e) => setDispatchForm(f => ({ ...f, customer_reference: e.target.value }))}
                placeholder="Reference #"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gradient-primary" onClick={handleDispatch} disabled={dispatching}>
              {dispatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Dispatch
            </Button>
            <Button variant="outline" onClick={() => setShowDispatchForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Search / Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by HBL, container, or consignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Pending Items */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No pending dispatches</p>
          <p className="text-sm text-muted-foreground">HBLs ready for pickup will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any, i: number) => (
            <div
              key={item.id || i}
              className="glass-card rounded-xl p-4 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-primary">{item.house_bill_number || item.hbl || 'Unknown HBL'}</span>
                    {item.container_number && (
                      <Badge variant="outline" className="text-xs">
                        <Container className="mr-1 h-3 w-3" />
                        {item.container_number}
                      </Badge>
                    )}
                    {(item.available_for_pickup || item.status === 'AVAILABLE_PICKUP') && (
                      <Badge variant="success" className="text-xs">Ready for Pickup</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {item.consignee && <span>{item.consignee}</span>}
                    {item.cfs_code && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.cfs_code}
                      </span>
                    )}
                    {item.pieces && <span>{item.pieces} pcs</span>}
                    {item.weight && <span>{item.weight} kg</span>}
                    {item.lfd && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> LFD: {new Date(item.lfd).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => startDispatch(item)}>
                  <Truck className="mr-1 h-4 w-4" />
                  Dispatch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
