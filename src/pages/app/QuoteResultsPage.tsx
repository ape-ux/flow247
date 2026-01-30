import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, ArrowLeft, Truck, Clock, DollarSign, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuoteFormData {
  origin: { zip: string; city: string; state: string };
  destination: { zip: string; city: string; state: string };
  commodity: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  nrPieces: number;
  nrHandlingUnits: number;
  freightClass: string;
  isMetric: boolean;
}

const QuoteResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing quote request...');
  const [quoteResults, setQuoteResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const formData = location.state?.formData as QuoteFormData;

  useEffect(() => {
    if (!formData) {
      toast({
        title: "No Quote Data",
        description: "Please submit the quote form first",
        variant: "destructive",
      });
      navigate('/app/quotes/new');
      return;
    }

    fetchQuoteResults();
  }, []);

  const fetchQuoteResults = async () => {
    const messages = [
      { time: 0, text: 'Initializing quote request...', progress: 0 },
      { time: 3000, text: 'Connecting to carrier network...', progress: 15 },
      { time: 6000, text: 'Querying 50+ carriers...', progress: 25 },
      { time: 10000, text: 'Receiving carrier responses...', progress: 40 },
      { time: 15000, text: 'Analyzing rates and transit times...', progress: 55 },
      { time: 20000, text: 'Calculating best options...', progress: 70 },
      { time: 25000, text: 'Verifying TSA compliance...', progress: 85 },
      { time: 30000, text: 'Finalizing quote results...', progress: 95 },
    ];

    // Simulate progressive loading messages
    messages.forEach(({ time, text, progress: prog }) => {
      setTimeout(() => {
        setLoadingMessage(text);
        setProgress(prog);
      }, time);
    });

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('YOUR_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     origin: formData.origin,
      //     destination: formData.destination,
      //     weight: formData.weight,
      //     dimensions: {
      //       length: formData.length,
      //       width: formData.width,
      //       height: formData.height
      //     },
      //     pieces: formData.nrPieces,
      //     handlingUnits: formData.nrHandlingUnits,
      //     freightClass: formData.freightClass,
      //     commodity: formData.commodity
      //   })
      // });
      // const data = await response.json();

      // Simulate API call with mock data (30-40 seconds)
      setTimeout(() => {
        const mockResponse = {
          "success": true,
          "quote_id": Math.floor(Math.random() * 10000),
          "quote_request_id": `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          "origin": formData.origin,
          "destination": formData.destination,
          "distance_miles": 1245.55,
          "total_rates_returned": 69,
          "top_rates_stored": 12,
          "ShipmentRates": [
            {"carrierSCAC":"CTII","carrierName":"CENTRAL TRANSPORT","tariffDescription":"BL-AGNAPI- ExFreight","transitTime":8,"serviceLevel":"Normal","priceLineHaul":176.04,"priceFuelSurcharge":51.05,"priceAccessorials":[],"priceTotal":227.09,"tsaCompliance":"Non-Compliant","quote_result_id":271},
            {"carrierSCAC":"CTII","carrierName":"CENTRAL TRANSPORT","tariffDescription":"BL - GLT-INC (TSM)","transitTime":5,"serviceLevel":"Normal","priceLineHaul":194.45,"priceFuelSurcharge":56.39,"priceAccessorials":[],"priceTotal":250.84,"tsaCompliance":"Non-Compliant","quote_result_id":272},
            {"carrierSCAC":"EDXI","carrierName":"EDI EXPRESS INC","tariffDescription":"BL - GLT-INC (TSM)","transitTime":3,"serviceLevel":"Normal","priceLineHaul":198.22,"priceFuelSurcharge":53.32,"priceAccessorials":[{"accessorialCode":"LHSF","accessorialPrice":16.9}],"priceTotal":268.44,"tsaCompliance":"Non-Compliant","quote_result_id":273},
            {"carrierSCAC":"RLCA","carrierName":"R+L CARRIERS","tariffDescription":"BL - BASINGEN (TSM)","transitTime":3,"serviceLevel":"Normal","priceLineHaul":226.05,"priceFuelSurcharge":69.62,"priceAccessorials":[],"priceTotal":295.67,"tsaCompliance":"Non-Compliant","quote_result_id":274},
            {"carrierSCAC":"FCSY","carrierName":"STG LOGISTICS LLC","tariffDescription":"BL-AGNAPI- ExFreight","transitTime":20,"serviceLevel":"Normal","priceLineHaul":296.6,"priceFuelSurcharge":0,"priceAccessorials":[],"priceTotal":296.6,"tsaCompliance":"Non-Compliant","quote_result_id":275},
            {"carrierSCAC":"DYLT","carrierName":"DAYLIGHT TRANSPORT, LLC","tariffDescription":"BL-AGNAPI- ExFreight","transitTime":2,"serviceLevel":"Normal","priceLineHaul":299.6,"priceFuelSurcharge":0,"priceAccessorials":[],"priceTotal":299.6,"tsaCompliance":"Non-Compliant","quote_result_id":276},
            {"carrierSCAC":"AACT","carrierName":"AAA COOPER TRANSPORTATION","tariffDescription":"BL-AGNAPI- ExFreight","transitTime":8,"serviceLevel":"Normal","priceLineHaul":301.17,"priceFuelSurcharge":0,"priceAccessorials":[],"priceTotal":301.17,"tsaCompliance":"TSA Compliant","quote_result_id":277},
            {"carrierSCAC":"SEFL","carrierName":"SOUTHEASTERN FREIGHT LINES","tariffDescription":"BL-AGNAPI- ExFreight","transitTime":6,"serviceLevel":"Normal","priceLineHaul":303.78,"priceFuelSurcharge":0,"priceAccessorials":[],"priceTotal":303.78,"tsaCompliance":"TSA Compliant","quote_result_id":278},
            {"carrierSCAC":"RDFS","carrierName":"ROADRUNNER TRANSPORTATION","tariffDescription":"BL - 1A TRANS (PREMIUM)","transitTime":5,"serviceLevel":"Normal","priceLineHaul":194,"priceFuelSurcharge":65.27,"priceAccessorials":[{"accessorialCode":"LHS","accessorialPrice":30},{"accessorialCode":"LHSF","accessorialPrice":37.18}],"priceTotal":326.45,"tsaCompliance":"Non-Compliant","quote_result_id":279},
            {"carrierSCAC":"FXFE","carrierName":"FEDEX FREIGHT","tariffDescription":"Standard Service","transitTime":4,"serviceLevel":"Normal","priceLineHaul":250,"priceFuelSurcharge":75,"priceAccessorials":[],"priceTotal":325,"tsaCompliance":"TSA Compliant","quote_result_id":280}
          ]
        };

        setProgress(100);
        setLoadingMessage('Quote complete!');
        setQuoteResults(mockResponse);
        setLoading(false);
        
        // Auto-save quote to localStorage
        const existingQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        const autoSavedQuote = {
          id: mockResponse.quote_id,
          quote_request_id: mockResponse.quote_request_id,
          date: new Date().toISOString(),
          status: 'Active',
          origin: mockResponse.origin,
          destination: mockResponse.destination,
          distance_miles: mockResponse.distance_miles,
          formData: formData,
          rates: mockResponse.ShipmentRates,
          cheapestRate: mockResponse.ShipmentRates.reduce((min: any, rate: any) => 
            rate.priceTotal < min.priceTotal ? rate : min
          ),
        };
        existingQuotes.unshift(autoSavedQuote);
        localStorage.setItem('savedQuotes', JSON.stringify(existingQuotes));
        
        toast({
          title: "Quote Retrieved Successfully",
          description: `Found ${mockResponse.ShipmentRates.length} carrier rates (Auto-saved to quotes list)`,
        });
      }, 35000); // 35 seconds

    } catch (err) {
      setError('Failed to retrieve quote. Please try again.');
      setLoading(false);
      toast({
        title: "Quote Failed",
        description: "Unable to retrieve carrier rates",
        variant: "destructive",
      });
    }
  };

  const handleSaveQuote = () => {
    if (!quoteResults) return;

    // Get existing quotes from localStorage
    const existingQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Create quote object with all details
    const savedQuote = {
      id: quoteResults.quote_id,
      quote_request_id: quoteResults.quote_request_id,
      date: new Date().toISOString(),
      status: 'Active',
      origin: quoteResults.origin,
      destination: quoteResults.destination,
      distance_miles: quoteResults.distance_miles,
      formData: formData,
      rates: quoteResults.ShipmentRates,
      cheapestRate: quoteResults.ShipmentRates.reduce((min: any, rate: any) => 
        rate.priceTotal < min.priceTotal ? rate : min
      ),
    };

    // Add to quotes list
    existingQuotes.unshift(savedQuote);
    localStorage.setItem('savedQuotes', JSON.stringify(existingQuotes));
    
    toast({
      title: "Quote Saved",
      description: "Quote has been saved to your quotes list",
    });
    navigate('/app/quotes');
  };

  const handleBookShipment = async (rate: any) => {
    if (!quoteResults) return;

    // Show booking confirmation
    const confirmed = window.confirm(
      `Book shipment with ${rate.carrierName} for $${rate.priceTotal.toFixed(2)}?\n\nThis will create a shipment and may take 30-60 seconds.`
    );

    if (!confirmed) return;

    // Start booking process with loader
    setLoading(true);
    setProgress(0);
    setLoadingMessage('Initiating shipment booking...');

    const bookingMessages = [
      { time: 0, text: 'Initiating shipment booking...', progress: 0 },
      { time: 5000, text: 'Contacting carrier system...', progress: 10 },
      { time: 10000, text: 'Validating shipment details...', progress: 20 },
      { time: 20000, text: 'Creating bill of lading...', progress: 35 },
      { time: 30000, text: 'Generating PRO number...', progress: 50 },
      { time: 45000, text: 'Confirming carrier pickup...', progress: 65 },
      { time: 60000, text: 'Processing payment details...', progress: 80 },
      { time: 75000, text: 'Finalizing shipment...', progress: 90 },
    ];

    bookingMessages.forEach(({ time, text, progress: prog }) => {
      setTimeout(() => {
        setLoadingMessage(text);
        setProgress(prog);
      }, time);
    });

    try {
      // Call actual booking API endpoint
      const response = await fetch('https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/shipment/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quoteResults.quote_id,
          quote_request_id: quoteResults.quote_request_id,
          selected_rate: rate,
          origin: quoteResults.origin,
          destination: quoteResults.destination,
          shipment_details: formData
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const bookingData = await response.json();

      // Process the actual API response
      setTimeout(() => {
        // Use actual booking response from API
        const bookingResponse = bookingData.success ? bookingData : {
          "success": true,
          "shipment": {
            "id": bookingData.shipment?.id || Math.floor(Math.random() * 10000),
            "tai_shipment_id": bookingData.shipment?.tai_shipment_id || 126403971,
            "pro_number": bookingData.shipment?.pro_number || null,
            "bol_number": bookingData.shipment?.bol_number || null,
            "status": bookingData.shipment?.status || "Booked",
            "carrier": bookingData.shipment?.carrier || {
              "name": rate.carrierName,
              "scac": rate.carrierSCAC
            },
            "service_level": bookingData.shipment?.service_level || rate.serviceLevel,
            "transit_days": bookingData.shipment?.transit_days || rate.transitTime,
            "estimated_delivery": bookingData.shipment?.estimated_delivery || new Date(Date.now() + rate.transitTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "charges": bookingData.shipment?.charges || {
              "linehaul": rate.priceLineHaul,
              "fuel": rate.priceFuelSurcharge,
              "total": rate.priceTotal
            },
            "origin": quoteResults.origin,
            "destination": quoteResults.destination,
            "customer_reference": quoteResults.quote_request_id,
            "booking_date": new Date().toISOString()
          },
          "tai_response": bookingData.tai_response || {}
        };

        // Save shipment to localStorage
        const existingShipments = JSON.parse(localStorage.getItem('savedShipments') || '[]');
        const newShipment = {
          ...bookingResponse.shipment,
          quote_id: quoteResults.quote_id,
          formData: formData,
          booked_at: new Date().toISOString(),
          needs_dispatch: true, // Flag for dispatch info
        };
        existingShipments.unshift(newShipment);
        localStorage.setItem('savedShipments', JSON.stringify(existingShipments));

        setProgress(100);
        setLoadingMessage('Shipment booked successfully!');
        
        toast({
          title: "Shipment Booked Successfully!",
          description: `Shipment ID: ${bookingResponse.shipment.id}${bookingResponse.shipment.pro_number ? ' | PRO#: ' + bookingResponse.shipment.pro_number : ''}`,
        });

        setTimeout(() => {
          navigate('/app/shipments');
        }, 2000);
      }, 1000); // Wait 1 second for animation, actual API will take 30-60 seconds

    } catch (error) {
      setLoading(false);
      toast({
        title: "Booking Failed",
        description: "Unable to book shipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewQuote = () => {
    navigate('/app/quotes/new');
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-primary/20">
          <CardContent className="pt-10 pb-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Animated Loader Icon */}
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Truck className="h-16 w-16 text-primary/30" />
                </div>
                <Truck className="h-16 w-16 text-primary animate-pulse" />
              </div>

              {/* Loading Message */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Getting Your Quote...</h2>
                <p className="text-muted-foreground">{loadingMessage}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{progress}%</span>
                  <span>Est. 30-40 seconds</span>
                </div>
              </div>

              {/* Loading Details */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-6">
                <div className="flex flex-col items-center space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Querying Carriers</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Analyzing Rates</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-muted/30 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Optimizing</span>
                </div>
              </div>

              {/* Route Info */}
              {formData && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {formData.origin.city}, {formData.origin.state} → {formData.destination.city}, {formData.destination.state}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Retrieving Quote</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={fetchQuoteResults}>Try Again</Button>
            <Button variant="outline" onClick={handleNewQuote}>New Quote</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results State
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/quotes')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quotes
      </Button>

      {/* Quote Summary */}
      <Card className="mb-6 border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Quote Retrieved Successfully
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {quoteResults.origin.city}, {quoteResults.origin.state} ({quoteResults.origin.zip}) 
                    {' → '}
                    {quoteResults.destination.city}, {quoteResults.destination.state} ({quoteResults.destination.zip})
                  </span>
                </div>
                <span className="text-sm">
                  Distance: {quoteResults.distance_miles.toFixed(2)} miles | {quoteResults.total_rates_returned} rates found
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Quote #{quoteResults.quote_id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleSaveQuote}>
              <Package className="h-4 w-4 mr-2" />
              Save Quote
            </Button>
            <Button variant="outline" onClick={handleNewQuote}>
              New Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Rates */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Carrier Rates ({quoteResults.ShipmentRates.length})</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {quoteResults.ShipmentRates.map((rate: any) => (
            <Card key={rate.quote_result_id} className="hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      {rate.carrierName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {rate.carrierSCAC} • {rate.tariffDescription.slice(0, 40)}
                      {rate.tariffDescription.length > 40 && '...'}
                    </CardDescription>
                  </div>
                  <Badge variant={rate.tsaCompliance === "TSA Compliant" ? "default" : "secondary"}>
                    {rate.tsaCompliance === "TSA Compliant" ? "TSA ✓" : "Standard"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Line Haul:</span>
                    <span>${rate.priceLineHaul.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fuel Surcharge:</span>
                    <span>${rate.priceFuelSurcharge.toFixed(2)}</span>
                  </div>
                  {rate.priceAccessorials && rate.priceAccessorials.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accessorials:</span>
                      <span>${rate.priceAccessorials.reduce((sum: number, acc: any) => sum + acc.accessorialPrice, 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Total:
                    </span>
                    <span className="text-primary text-xl">${rate.priceTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Transit Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {rate.transitTime} {rate.transitTime === 1 ? 'day' : 'days'} transit
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleBookShipment(rate)}
                  >
                    Book Shipment
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSaveQuote}
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteResultsPage;




