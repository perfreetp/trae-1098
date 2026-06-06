import type { ParkingLot, ParkingOrder, Coupon, Vehicle, MonthlyCard, VisitorCode, ParkingSpot, PriceEstimate, Invoice } from '../types';
import { HttpService } from './HttpService';
import { CacheManager } from '../core/CacheManager';

export class ParkingService {
  private http: HttpService;
  private cache: CacheManager;

  constructor(http: HttpService, cache: CacheManager) {
    this.http = http;
    this.cache = cache;
  }

  async searchParkingLots(keyword?: string, latitude?: number, longitude?: number, page: number = 1, pageSize: number = 20): Promise<ParkingLot[]> {
    const cacheKey = `parking_lots_${keyword || 'all'}_${latitude}_${longitude}_${page}_${pageSize}`;
    const cached = this.cache.get<ParkingLot[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (latitude !== undefined) params.set('latitude', String(latitude));
    if (longitude !== undefined) params.set('longitude', String(longitude));
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    const data = await this.http.get<ParkingLot[]>(`/api/parking/lots?${params.toString()}`);
    this.cache.set(cacheKey, data, 60000);
    return data;
  }

  async getParkingLotDetail(lotId: string): Promise<ParkingLot> {
    const cacheKey = `parking_lot_${lotId}`;
    const cached = this.cache.get<ParkingLot>(cacheKey);
    if (cached) return cached;

    const data = await this.http.get<ParkingLot>(`/api/parking/lots/${lotId}`);
    this.cache.set(cacheKey, data, 120000);
    return data;
  }

  async getAvailableSpaces(lotId: string): Promise<{ available: number; total: number }> {
    return this.http.get<{ available: number; total: number }>(`/api/parking/lots/${lotId}/spaces`);
  }

  async estimatePrice(lotId: string, durationMinutes: number, plateNumber?: string): Promise<PriceEstimate> {
    return this.http.post<PriceEstimate>(`/api/parking/lots/${lotId}/estimate`, {
      durationMinutes,
      plateNumber,
    });
  }

  async getOrders(status?: string, page: number = 1, pageSize: number = 20): Promise<ParkingOrder[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    return this.http.get<ParkingOrder[]>(`/api/parking/orders?${params.toString()}`);
  }

  async getOrderDetail(orderId: string): Promise<ParkingOrder> {
    return this.http.get<ParkingOrder>(`/api/parking/orders/${orderId}`);
  }

  async getOrderByPlate(plateNumber: string, lotId?: string): Promise<ParkingOrder | null> {
    const params = new URLSearchParams();
    params.set('plateNumber', plateNumber);
    if (lotId) params.set('lotId', lotId);

    const orders = await this.http.get<ParkingOrder[]>(`/api/parking/orders/by-plate?${params.toString()}`);
    return orders.length > 0 ? orders[0] : null;
  }

  async getCoupons(lotId?: string, availableOnly: boolean = true): Promise<Coupon[]> {
    const params = new URLSearchParams();
    if (lotId) params.set('lotId', lotId);
    params.set('availableOnly', String(availableOnly));

    return this.http.get<Coupon[]>(`/api/parking/coupons?${params.toString()}`);
  }

  async applyCoupon(orderId: string, couponId: string): Promise<{ discountAmount: number; payableAmount: number }> {
    return this.http.post<{ discountAmount: number; payableAmount: number }>(`/api/parking/orders/${orderId}/apply-coupon`, {
      couponId,
    });
  }

  async getVehicles(): Promise<Vehicle[]> {
    const cacheKey = 'user_vehicles';
    const cached = this.cache.get<Vehicle[]>(cacheKey);
    if (cached) return cached;

    const data = await this.http.get<Vehicle[]>('/api/user/vehicles');
    this.cache.set(cacheKey, data, 300000);
    return data;
  }

  async bindVehicle(plateNumber: string, type: string = 'car'): Promise<Vehicle> {
    const data = await this.http.post<Vehicle>('/api/user/vehicles', { plateNumber, type });
    this.cache.delete('user_vehicles');
    return data;
  }

  async unbindVehicle(vehicleId: string): Promise<void> {
    await this.http.delete(`/api/user/vehicles/${vehicleId}`);
    this.cache.delete('user_vehicles');
  }

  async setDefaultVehicle(vehicleId: string): Promise<void> {
    await this.http.post(`/api/user/vehicles/${vehicleId}/default`);
    this.cache.delete('user_vehicles');
  }

  async getMonthlyCards(): Promise<MonthlyCard[]> {
    const cacheKey = 'user_monthly_cards';
    const cached = this.cache.get<MonthlyCard[]>(cacheKey);
    if (cached) return cached;

    const data = await this.http.get<MonthlyCard[]>('/api/user/monthly-cards');
    this.cache.set(cacheKey, data, 300000);
    return data;
  }

  async validateVisitorCode(code: string, lotId?: string): Promise<VisitorCode> {
    return this.http.post<VisitorCode>('/api/parking/visitor/validate', { code, lotId });
  }

  async getParkingSpots(lotId: string, plateNumber?: string): Promise<ParkingSpot[]> {
    const params = new URLSearchParams();
    if (plateNumber) params.set('plateNumber', plateNumber);

    return this.http.get<ParkingSpot[]>(`/api/parking/lots/${lotId}/spots?${params.toString()}`);
  }

  async initiatePayment(orderId: string, paymentMethod: string, couponId?: string): Promise<{ paymentId: string; payUrl?: string; qrCode?: string }> {
    return this.http.post<{ paymentId: string; payUrl?: string; qrCode?: string }>(`/api/payment/pay`, {
      orderId,
      paymentMethod,
      couponId,
    });
  }

  async checkPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'success' | 'failed'; orderId?: string }> {
    return this.http.get<{ status: 'pending' | 'success' | 'failed'; orderId?: string }>(`/api/payment/${paymentId}/status`);
  }

  async applyInvoice(orderIds: string[], invoiceType: 'personal' | 'company', title: string, email: string, taxNumber?: string): Promise<Invoice> {
    return this.http.post<Invoice>('/api/invoices/apply', {
      orderIds,
      invoiceType,
      title,
      email,
      taxNumber,
    });
  }

  async getInvoiceList(page: number = 1, pageSize: number = 20): Promise<Invoice[]> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    return this.http.get<Invoice[]>(`/api/invoices?${params.toString()}`);
  }

  clearCache(): void {
    this.cache.clearByPrefix('parking_');
    this.cache.delete('user_vehicles');
    this.cache.delete('user_monthly_cards');
  }
}
