// Shipping Types for Xano API Integration

// ============ Location Types ============
export interface Location {
  zip: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// ============ Commodity Types ============
export interface Commodity {
  HandlingQuantity: number;
  PackagingType?: number;
  Length: number;
  Width: number;
  Height: number;
  WeightTotal: number;
  HazardousMaterial?: boolean;
  PiecesTotal: number;
  FreightClass?: number;
  NMFC?: string;
  Description?: string;
  AdditionalMarkings?: string;
  UNNumber?: string;
  PackingGroup?: number;
}

// ============ Rate Quote Request ============
export interface RateQuoteRequest {
  OriginZipCode: string;
  OriginCountry?: number;
  DestinationZipCode: string;
  DestinationCountry?: number;
  WeightUnits?: string;
  DimensionUnits?: string;
  AccessorialCodes?: string[];
  LegacySupport?: boolean;
  CustomerReferenceNumber?: string;
  Commodities: Commodity[];
}

// ============ Rate Quote Result ============
export interface PriceAccessorial {
  accessorialCode: string;
  accessorialPrice: number;
}

export interface QuoteResult {
  id?: number;
  quote_result_id?: number;
  db_id?: number;
  priceTotal: number;
  carrierName: string;
  carrierSCAC: string;
  transitTime: number;
  serviceLevel?: string;
  priceLineHaul: number;
  tsaCompliance?: string;
  apiQuoteNumber?: string;
  api_quote_number?: string;
  priceAccessorials?: PriceAccessorial[];
  tariffDescription?: string;
  priceFuelSurcharge: number;
  pricingInstructions?: string;
  newLiabilityCoverage?: number;
  usedLiabilityCoverage?: number;
}

// Full Quote API Response (from /shipping/getRateQuote)
export interface QuoteApiResponse {
  success: boolean;
  quote_id: number;
  quote_request_id: string;
  origin: {
    zip: string;
    city: string | null;
    state: string | null;
    latitude: number;
    longitude: number;
  };
  destination: {
    zip: string;
    city: string | null;
    state: string | null;
    latitude: number;
    longitude: number;
  };
  distance_miles: number;
  total_rates_returned: number;
  top_rates_stored: number;
  cheapest_rate: QuoteResult;
  fastest_rate: QuoteResult;
  ShipmentRates: QuoteResult[];
}

// ============ Exfreight Quote Types ============
export interface ExfreightQuoteItem {
  quantity: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  freight_class?: number;
  stackable?: boolean;
  description?: string;
}

export interface ExfreightQuoteRequest {
  accessorials?: string[];
  pickup_date?: number;
  origin: Location;
  destination: Location;
  items: ExfreightQuoteItem[];
}

// ============ Shipment Booking ============
export interface BookShipmentRequest {
  quote_result_id: number;
  origin_company: string;
  origin_contact: string;
  origin_address: string;
  origin_phone: string;
  destination_company: string;
  destination_contact: string;
  destination_address: string;
  destination_phone: string;
  CustomerReferenceNumber?: string;
}

export interface ShipmentCarrier {
  name: string;
  scac: string;
}

export interface ShipmentCharges {
  fuel: number;
  total: number;
  linehaul: number;
}

export interface ShipmentLocation {
  zip: string;
  city?: string;
  state?: string;
}

export interface Shipment {
  id: number;
  created_at?: number;
  origin: ShipmentLocation;
  destination: ShipmentLocation;
  status: 'Quote' | 'Booked' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled';
  carrier: ShipmentCarrier;
  charges: ShipmentCharges;
  bol_number?: string;
  bol_url?: string;
  pro_number?: string;
  pickup_number?: string;
  transit_days: number;
  service_level?: string;
  tai_shipment_id?: number;
  customer_reference?: string;
  estimated_delivery?: string;
  pickup_date?: string;
  current_location?: string;
  last_location?: string;
  // Additional fields for UI display
  origin_company?: string;
  origin_contact?: string;
  origin_address?: string;
  origin_phone?: string;
  destination_company?: string;
  destination_contact?: string;
  destination_address?: string;
  destination_phone?: string;
}

export interface BookShipmentResponse {
  success: boolean;
  shipment: Shipment;
  tai_response?: {
    result: {
      billToType: string;
      shipmentID: number;
      priceDetail: {
        priceTotal: number;
        carrierName: string;
        carrierSCAC: string;
        transitTime: number;
        priceLineHaul: number;
        apiQuoteNumber: string;
        priceAccessorials: PriceAccessorial[];
        tariffDescription: string;
        priceFuelSurcharge: number;
      };
      billToAddress: {
        city: string;
        phone: string;
        state: string;
        country: string;
        zipCode: string;
        companyName: string;
        streetAddress: string;
        streetAddressTwo: string;
      };
      apiQuoteNumber: string;
      shipmentStatus: string;
      billOfLadingURL?: string;
    };
    status: number;
  };
}

// ============ Shipment Update ============
export interface UpdateShipmentRequest {
  shipment_id: number;
  origin_company?: string;
  origin_contact?: string;
  origin_address?: string;
  origin_phone?: string;
  destination_company?: string;
  destination_contact?: string;
  destination_address?: string;
  destination_phone?: string;
  pickup_date?: string;
  special_instructions?: string;
}

// ============ Shipment Dispatch ============
export interface DispatchShipmentRequest {
  shipment_id: number;
  pickup_date?: string;
  special_instructions?: string;
  // Add other dispatch fields as needed
}

export interface DispatchShipmentResponse {
  success: boolean;
  shipment: Shipment;
  pro_number?: string;
  bol_url?: string;
}

// ============ TAI Tracking Update ============
export type TAITransitType = 'PickupLocal' | 'DeliveryLocal' | 'PickupDray' | 'DeliveryDray' | 'LineHaul';

export type TAIShipmentStatus =
  | 'Quote'
  | 'Booked'
  | 'Dispatched'
  | 'PickedUp'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Exception'
  | 'Cancelled';

export interface TAIReferenceNumber {
  referenceType: 'Reference Number' | 'PRO Number' | 'BOL Number' | 'PO Number';
  value: string;
}

export interface TAITrackingUpdate {
  pickupNumber?: string;
  shipmentStatus: TAIShipmentStatus;
  pickupReadyDateTime?: string;
  pickupCloseDateTime?: string;
  deliveryEstimatedDateTime?: string;
  deliveryCloseDateTime?: string;
  proofOfDeliveryArrivalDateTime?: string;
  proofOfDeliveryDepartureDateTime?: string;
  proofOfDeliverySignedBy?: string;
  actualPickupArrivalDateTime?: string;
  actualPickupDepartureDateTime?: string;
  pickupAppointmentBeginDateTime?: string;
  pickupAppointmentEndDateTime?: string;
  deliveryAppointmentBeginDateTime?: string;
  deliveryAppointmentEndDateTime?: string;
}

export interface TAITrackingUpdateRequest {
  referenceNumbers: TAIReferenceNumber[];
  transitType: TAITransitType;
  trackingUpdate: TAITrackingUpdate;
}

export interface TAITrackingUpdateResponse {
  success: boolean;
  message?: string;
  shipmentId?: number;
  status?: string;
}

// ============ Customer Profile ============
export interface CustomerProfile {
  id: number;
  created_at: number;
  tai_customer_id?: number;
}
