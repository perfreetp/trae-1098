export type Theme = 'light' | 'dark';
export type Language = 'zh-CN' | 'en-US';
export type ParkingType = 'indoor' | 'outdoor' | 'underground';

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  type: ParkingType;
  totalSpaces: number;
  availableSpaces: number;
  distance?: number;
  pricePerHour: number;
  maxDailyPrice?: number;
  freeMinutes?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  features: string[];
}

export interface ParkingOrder {
  id: string;
  orderNo: string;
  parkingLotId: string;
  parkingLotName: string;
  plateNumber: string;
  entryTime: string;
  exitTime?: string;
  duration: number;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount?: number;
  status: 'parking' | 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paidTime?: string;
}

export interface Coupon {
  id: string;
  name: string;
  type: 'discount' | 'amount' | 'free_hours';
  value: number;
  minAmount?: number;
  expireTime: string;
  status: 'available' | 'used' | 'expired';
  parkingLotIds?: string[];
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  isDefault: boolean;
  bindTime: string;
}

export interface MonthlyCard {
  id: string;
  cardNo: string;
  type: string;
  parkingLotId: string;
  parkingLotName: string;
  plateNumber: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'frozen';
  remainingDays: number;
}

export interface VisitorCode {
  code: string;
  parkingLotId: string;
  parkingLotName: string;
  plateNumber?: string;
  validFrom: string;
  validTo: string;
  status: 'valid' | 'used' | 'expired';
}

export interface ParkingSpot {
  id: string;
  code: string;
  floor: string;
  area: string;
  distance?: number;
  isAvailable: boolean;
}

export interface PriceEstimate {
  duration: number;
  basePrice: number;
  discountPrice: number;
  finalPrice: number;
  details: PriceDetail[];
}

export interface PriceDetail {
  name: string;
  amount: number;
  type: 'base' | 'discount' | 'surcharge';
}

export interface Invoice {
  id: string;
  orderIds: string[];
  invoiceType: 'personal' | 'company';
  title: string;
  taxNumber?: string;
  amount: number;
  status: 'pending' | 'issued' | 'failed';
  email: string;
  createTime: string;
  issueTime?: string;
}

export interface SDKConfig {
  apiBaseUrl: string;
  appId: string;
  theme?: Theme;
  language?: Language;
  timeout?: number;
  enableCache?: boolean;
  cacheTTL?: number;
  trackEvent?: (event: string, data?: Record<string, unknown>) => void;
  onError?: (error: SDKError) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  refreshToken?: () => Promise<string>;
}

export interface SDKError {
  code: string;
  message: string;
  details?: unknown;
}

export interface TrackEvent {
  name: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export type ComponentType = 
  | 'parking-lot-selector'
  | 'space-panel'
  | 'plate-input'
  | 'order-card'
  | 'coupon-list'
  | 'payment-result'
  | 'invoice-apply';

export interface ComponentOptions {
  container: HTMLElement | string;
  data?: Record<string, unknown>;
  onEvent?: (event: string, data?: unknown) => void;
}
