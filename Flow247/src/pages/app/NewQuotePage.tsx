import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Package,
  Calculator,
  DollarSign,
  Truck,
  Check,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  Clock,
  Zap,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  getLtlRateQuote,
  bookShipment,
  type LtlCommodity,
  type LtlRateQuoteRequest,
  type LtlRateQuoteResponse,
  type ShipmentRate,
  type BookShipmentRequest,
} from '@/lib/xano';

const FREIGHT_CLASSES = [
  '50', '55', '60', '65', '70', '77.5', '85', '92.5',
  '100', '110', '125', '150', '175', '200', '250', '300', '400', '500',
];

const PACKAGING_TYPES: { value: string; label: string }[] = [
  { value: '120', label: 'Pallet' },
  { value: '107', label: 'Crate' },
  { value: '102', label: 'Box' },
  { value: '110', label: 'Drum' },
  { value: '130', label: 'Roll' },
  { value: '100', label: 'Bundle' },
];

const defaultCommodity: LtlCommodity = {
  HandlingQuantity: 1,
  PackagingType: '120',
  Length: 48,
  Width: 40,
  Height: 36,
  WeightTotal: 500,
  HazardousMaterial: false,
  PiecesTotal: 1,
  FreightClass: 100,
  NMFC: '',
  Description: 'Freight',
};

export default function NewQuotePage() {
  const navigate = useNavigate();

  // Form state
  const [originZip, setOriginZip] = useState('');
  const [destZip, setDestZip] = useState('');
  const [customerRef, setCustomerRef] = useState('');
  const [commodities, setCommodities] = useState<LtlCommodity[]>([{ ...defaultCommodity }]);
  const [accessorialCodes, setAccessorialCodes] = useState<string[]>([]);

  // Booking details state
  const [originCompany, setOriginCompany] = useState('');
  const [originContact, setOriginContact] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [originPhone, setOriginPhone] = useState('');
  const [destCompany, setDestCompany] = useState('');
  const [destContact, setDestContact] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [destPhone, setDestPhone] = useState('');

  // API state
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [rateResponse, setRateResponse] = useState<LtlRateQuoteResponse | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const updateCommodity = (index: number, field: keyof LtlCommodity, value: unknown) => {
    setCommodities(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCommodity = () => {
    setCommodities(prev => [...prev, { ...defaultCommodity }]);
  };

  const removeCommodity = (index: number) => {
    if (commodities.length <= 1) return;
    setCommodities(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetRates = async () => {
    if (!originZip || !destZip) {
      toast.error('Please enter both origin and destination zip codes');
      return;
    }
    if (commodities.some(c => !c.Length || !c.Width || !c.Height || !c.WeightTotal)) {
      toast.error('Please fill in all commodity dimensions and weight');
      return;
    }

    setLoading(true);
    setRateResponse(null);
    setSelectedRate(null);
    setShowBookingForm(false);

    try {
      const request: LtlRateQuoteRequest = {
        OriginZipCode: originZip,
        OriginCountry: 1,
        DestinationZipCode: destZip,
        DestinationCountry: 1,
        WeightUnits: 'lb',
        DimensionUnits: 'in',
        LegacySupport: false,
        CustomerReferenceNumber: customerRef || undefined,
        AccessorialCodes: accessorialCodes.length > 0 ? accessorialCodes : null,
        Commodities: commodities.map(c => ({
          ...c,
          PackagingType: c.PackagingType || '120',
          Description: c.Description || 'Freight',
        })),
      };

      const res = await getLtlRateQuote(request);

      if (res.data && res.data.success) {
        setRateResponse(res.data);
        toast.success(`${res.data.total_rates_returned} rates returned from ${res.data.top_rates_stored} carriers`);
      } else {
        toast.error('Failed to get rates: ' + (res.error || 'No rates available'));
      }
    } catch (err) {
      toast.error('Failed to get rate quotes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookShipment = async () => {
    if (selectedRate === null || !rateResponse) return;
    const rate = rateResponse.ShipmentRates[selectedRate];
    if (!rate?.quote_result_id && !rate?.db_id) {
      toast.error('No quote result ID available for booking');
      return;
    }

    setBooking(true);
    try {
      const request: BookShipmentRequest = {
        quote_result_id: rate.quote_result_id || rate.db_id || 0,
        origin_company: originCompany || undefined,
        origin_contact: originContact || undefined,
        origin_address: originAddress || undefined,
        origin_phone: originPhone || undefined,
        destination_company: destCompany || undefined,
        destination_contact: destContact || undefined,
        destination_address: destAddress || undefined,
        destination_phone: destPhone || undefined,
        CustomerReferenceNumber: customerRef || undefined,
      };

      const res = await bookShipment(request);

      if (res.data && res.data.success) {
        const s = res.data.shipment;
        toast.success(`Shipment booked! TAI ID: ${s.tai_shipment_id}`);
        // Navigate to the new shipment detail
        navigate(`/app/shipments/${s.tai_shipment_id}`);
      } else {
        toast.error('Booking failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Failed to book shipment');
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  const totalWeight = commodities.reduce((sum, c) => sum + (c.WeightTotal || 0), 0);
  const totalPieces = commodities.reduce((sum, c) => sum + (c.PiecesTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/quotes')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Get LTL Rate Quote</h1>
          <p className="text-sm text-muted-foreground">Get real-time carrier rates for your LTL shipment</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Route Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" /> Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Origin Zip Code *</Label>
                  <Input
                    placeholder="e.g. 33076"
                    value={originZip}
                    onChange={e => setOriginZip(e.target.value)}
                    className="bg-muted/30"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destination Zip Code *</Label>
                  <Input
                    placeholder="e.g. 07047"
                    value={destZip}
                    onChange={e => setDestZip(e.target.value)}
                    className="bg-muted/30"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label>Customer Reference Number</Label>
                  <Input
                    placeholder="e.g. 10325638"
                    value={customerRef}
                    onChange={e => setCustomerRef(e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commodities Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" /> Commodities
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addCommodity}>
                <Plus className="mr-1 h-3 w-3" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {commodities.map((commodity, idx) => (
                <div key={idx} className="relative rounded-lg border border-border/50 p-4 bg-muted/10">
                  {commodities.length > 1 && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCommodity(idx)} className="h-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Handling Qty *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={commodity.HandlingQuantity}
                        onChange={e => updateCommodity(idx, 'HandlingQuantity', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pieces Total *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={commodity.PiecesTotal}
                        onChange={e => updateCommodity(idx, 'PiecesTotal', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Packaging Type</Label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-muted/30 px-3 text-sm"
                        value={commodity.PackagingType}
                        onChange={e => updateCommodity(idx, 'PackagingType', e.target.value)}
                      >
                        {PACKAGING_TYPES.map(pt => (
                          <option key={pt.value} value={pt.value}>{pt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Length (in) *</Label>
                      <Input
                        type="number"
                        value={commodity.Length}
                        onChange={e => updateCommodity(idx, 'Length', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (in) *</Label>
                      <Input
                        type="number"
                        value={commodity.Width}
                        onChange={e => updateCommodity(idx, 'Width', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (in) *</Label>
                      <Input
                        type="number"
                        value={commodity.Height}
                        onChange={e => updateCommodity(idx, 'Height', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Weight (lbs) *</Label>
                      <Input
                        type="number"
                        value={commodity.WeightTotal}
                        onChange={e => updateCommodity(idx, 'WeightTotal', Number(e.target.value))}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Freight Class</Label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-muted/30 px-3 text-sm"
                        value={commodity.FreightClass ?? ''}
                        onChange={e => updateCommodity(idx, 'FreightClass', e.target.value ? Number(e.target.value) : undefined)}
                      >
                        <option value="">Auto</option>
                        {FREIGHT_CLASSES.map(fc => (
                          <option key={fc} value={fc}>Class {fc}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">NMFC</Label>
                      <Input
                        placeholder="Optional"
                        value={commodity.NMFC ?? ''}
                        onChange={e => updateCommodity(idx, 'NMFC', e.target.value)}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="Freight"
                        value={commodity.Description ?? ''}
                        onChange={e => updateCommodity(idx, 'Description', e.target.value)}
                        className="h-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={commodity.HazardousMaterial}
                        onChange={e => updateCommodity(idx, 'HazardousMaterial', e.target.checked)}
                        className="rounded border-border"
                      />
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      Hazardous Material
                    </label>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                <span>Total Items: <strong className="text-foreground">{commodities.length}</strong></span>
                <span>Total Weight: <strong className="text-foreground">{totalWeight.toLocaleString()} lbs</strong></span>
                <span>Total Pieces: <strong className="text-foreground">{totalPieces}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Get Rates Button */}
          <Button
            onClick={handleGetRates}
            disabled={loading}
            className="w-full py-6 text-lg gradient-primary"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Getting Rates...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-5 w-5" />
                Get LTL Rates
              </>
            )}
          </Button>

          {/* Booking Details Form - shown after selecting a rate */}
          {showBookingForm && selectedRate !== null && rateResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-primary" /> Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Origin */}
                  <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/10">
                    <h3 className="font-medium text-green-500 text-sm flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" /> Origin
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-xs">Company</Label>
                      <Input value={originCompany} onChange={e => setOriginCompany(e.target.value)} className="h-9 bg-muted/30" placeholder="Origin company name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Contact</Label>
                      <Input value={originContact} onChange={e => setOriginContact(e.target.value)} className="h-9 bg-muted/30" placeholder="Contact name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Address</Label>
                      <Input value={originAddress} onChange={e => setOriginAddress(e.target.value)} className="h-9 bg-muted/30" placeholder="Pickup address" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Phone</Label>
                      <Input value={originPhone} onChange={e => setOriginPhone(e.target.value)} className="h-9 bg-muted/30" placeholder="Phone number" />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/10">
                    <h3 className="font-medium text-primary text-sm flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" /> Destination
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-xs">Company</Label>
                      <Input value={destCompany} onChange={e => setDestCompany(e.target.value)} className="h-9 bg-muted/30" placeholder="Destination company name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Contact</Label>
                      <Input value={destContact} onChange={e => setDestContact(e.target.value)} className="h-9 bg-muted/30" placeholder="Contact name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Address</Label>
                      <Input value={destAddress} onChange={e => setDestAddress(e.target.value)} className="h-9 bg-muted/30" placeholder="Delivery address" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Phone</Label>
                      <Input value={destPhone} onChange={e => setDestPhone(e.target.value)} className="h-9 bg-muted/30" placeholder="Phone number" />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBookShipment}
                  disabled={booking}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-5"
                  size="lg"
                >
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Booking Shipment...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-5 w-5" />
                      Book Shipment — ${rateResponse.ShipmentRates[selectedRate].priceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rates Panel - Right column */}
        <div className="space-y-4">
          {/* Route Summary */}
          {rateResponse && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-primary">{rateResponse.origin.city}</p>
                    <p className="text-xs text-muted-foreground">{rateResponse.origin.state} {rateResponse.origin.zip}</p>
                  </div>
                  <div className="flex-1 border-t border-dashed border-border relative">
                    {rateResponse.distance_miles && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-card px-1 text-muted-foreground">
                        {Math.round(rateResponse.distance_miles)} mi
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-primary">{rateResponse.destination.city}</p>
                    <p className="text-xs text-muted-foreground">{rateResponse.destination.state} {rateResponse.destination.zip}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{rateResponse.total_rates_returned} rates</span>
                  <span>|</span>
                  <span>Quote #{rateResponse.quote_id}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Picks */}
          {rateResponse && (rateResponse.cheapest_rate || rateResponse.fastest_rate) && (
            <div className="grid gap-2">
              {rateResponse.cheapest_rate && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                  <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium mb-1">
                    <TrendingDown className="h-3 w-3" /> Cheapest
                  </div>
                  <p className="font-bold text-sm">${rateResponse.cheapest_rate.priceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{rateResponse.cheapest_rate.carrierName}</p>
                </div>
              )}
              {rateResponse.fastest_rate && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                  <div className="flex items-center gap-1.5 text-blue-500 text-xs font-medium mb-1">
                    <Zap className="h-3 w-3" /> Fastest
                  </div>
                  <p className="font-bold text-sm">${rateResponse.fastest_rate.priceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{rateResponse.fastest_rate.carrierName}</p>
                </div>
              )}
            </div>
          )}

          {/* Rate Cards */}
          {rateResponse ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
                <DollarSign className="h-4 w-4 text-primary" />
                Available Rates ({rateResponse.ShipmentRates.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {rateResponse.ShipmentRates.map((rate, i) => (
                  <RateCard
                    key={`${rate.carrierSCAC}-${rate.apiQuoteNumber || rate.api_quote_number}-${i}`}
                    rate={rate}
                    selected={selectedRate === i}
                    isCheapest={rateResponse.cheapest_rate?.apiQuoteNumber === (rate.apiQuoteNumber || rate.api_quote_number)}
                    isFastest={rateResponse.fastest_rate?.apiQuoteNumber === (rate.apiQuoteNumber || rate.api_quote_number)}
                    onClick={() => {
                      setSelectedRate(i);
                      setShowBookingForm(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Fetching rates from carriers...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take 10-30 seconds</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Rates Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Enter origin/destination zip codes and cargo details, then click "Get LTL Rates".
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Rate Card Component
function RateCard({
  rate,
  selected,
  isCheapest,
  isFastest,
  onClick,
}: {
  rate: ShipmentRate;
  selected: boolean;
  isCheapest: boolean;
  isFastest: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-3 rounded-lg border text-left transition-all ${
        selected
          ? 'border-primary bg-primary/10 ring-1 ring-primary'
          : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-medium text-sm truncate">{rate.carrierName}</p>
            {isCheapest && <Badge variant="outline" className="text-[10px] h-4 px-1 border-green-500 text-green-500">Cheapest</Badge>}
            {isFastest && <Badge variant="outline" className="text-[10px] h-4 px-1 border-blue-500 text-blue-500">Fastest</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{rate.carrierSCAC} &middot; {rate.serviceLevel}</p>
          {rate.transitTime != null && rate.transitTime > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {rate.transitTime} {rate.transitTime === 1 ? 'day' : 'days'} transit
            </div>
          )}
          {rate.tsaCompliance === 'TSA Compliant' && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-green-500">
              <ShieldCheck className="h-3 w-3" />
              TSA Compliant
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">${rate.priceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          {rate.priceLineHaul !== rate.priceTotal && (
            <p className="text-[10px] text-muted-foreground">Linehaul: ${rate.priceLineHaul.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          )}
          {(rate.priceFuelSurcharge ?? 0) > 0 && (
            <p className="text-[10px] text-muted-foreground">Fuel: ${rate.priceFuelSurcharge!.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          )}
        </div>
      </div>
      {rate.pricingInstructions && (
        <p className="mt-2 text-[10px] text-amber-500 bg-amber-500/10 rounded px-2 py-1">
          {rate.pricingInstructions}
        </p>
      )}
      {selected && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs text-primary">
          <Check className="h-3.5 w-3.5" />
          Selected — fill booking details below to book
        </div>
      )}
    </button>
  );
}
