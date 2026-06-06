import type {
  SDKConfig,
  Theme,
  Language,
  ComponentType,
  ComponentOptions,
  ParkingLot,
  ParkingOrder,
  Coupon,
  Vehicle,
  MonthlyCard,
  VisitorCode,
  ParkingSpot,
  PriceEstimate,
  Invoice,
} from '../types';
import { EventBus } from './EventBus';
import { ConfigManager } from './ConfigManager';
import { I18n } from './I18n';
import { Tracker } from './Tracker';
import { CacheManager } from './CacheManager';
import { UIStateManager } from './UIStateManager';
import { HttpService } from '../services/HttpService';
import { ParkingService } from '../services/ParkingService';
import { ComponentManager } from './ComponentManager';

import '../styles/theme.css';

export class SmartParkingSDK {
  private static instance: SmartParkingSDK | null = null;
  private isInitialized: boolean = false;

  public eventBus: EventBus;
  public config: ConfigManager;
  public i18n: I18n;
  public tracker: Tracker;
  public cache: CacheManager;
  public uiState: UIStateManager;
  public http: HttpService;
  public parking: ParkingService;
  public components: ComponentManager;

  private constructor() {
    this.eventBus = new EventBus();
    this.config = new ConfigManager(this.eventBus);
    this.i18n = new I18n();
    this.tracker = new Tracker();
    this.cache = new CacheManager();
    this.uiState = new UIStateManager(this.eventBus);
    
    this.http = new HttpService({
      apiBaseUrl: '',
      appId: '',
    });
    
    this.parking = new ParkingService(this.http, this.cache);
    this.components = new ComponentManager(this.eventBus, this.config, this.i18n);
  }

  public static getInstance(): SmartParkingSDK {
    if (!SmartParkingSDK.instance) {
      SmartParkingSDK.instance = new SmartParkingSDK();
    }
    return SmartParkingSDK.instance;
  }

  public init(config: SDKConfig): void {
    if (this.isInitialized) {
      console.warn('SmartParkingSDK is already initialized');
      return;
    }

    this.config.init(config);
    this.i18n.setLanguage(config.language || 'zh-CN');
    this.cache.setEnabled(config.enableCache !== false);
    this.cache.setDefaultTTL(config.cacheTTL || 300000);

    if (config.trackEvent) {
      this.tracker.setTrackCallback(config.trackEvent);
    }

    if (config.onError) {
      this.uiState.setErrorCallback(config.onError);
    }

    if (config.onLoadingChange) {
      this.uiState.setLoadingCallback(config.onLoadingChange);
    }

    if (config.refreshToken) {
      this.http.setRefreshTokenCallback(config.refreshToken);
    }

    this.http = new HttpService(this.config.getConfig());
    this.parking = new ParkingService(this.http, this.cache);

    document.documentElement.setAttribute('data-parking-theme', config.theme || 'light');

    this.isInitialized = true;
    this.track('sdk_init', { appId: config.appId });
  }

  public setToken(token: string): void {
    this.http.setToken(token);
  }

  public getToken(): string {
    return this.http.getToken();
  }

  public clearToken(): void {
    this.http.clearToken();
  }

  public async refreshLogin(): Promise<string | null> {
    try {
      const token = await this.config.get('refreshToken')?.();
      if (token) {
        this.setToken(token);
        this.track('login_refresh', { success: true });
        return token;
      }
      return null;
    } catch (error) {
      this.track('login_refresh', { success: false, error });
      this.uiState.showError('AUTH_REFRESH_FAILED', '登录态刷新失败');
      return null;
    }
  }

  public setTheme(theme: Theme): void {
    this.config.setTheme(theme);
    this.track('theme_change', { theme });
  }

  public getTheme(): Theme {
    return this.config.getTheme();
  }

  public setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    this.config.setLanguage(language);
    this.track('language_change', { language });
  }

  public getLanguage(): Language {
    return this.config.getLanguage();
  }

  public getI18n() {
    return this.i18n;
  }

  public getConfig() {
    return this.config.getConfig();
  }

  public t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }

  public track(event: string, data?: Record<string, unknown>): void {
    this.tracker.track(event, data);
  }

  public showError(code: string, message: string, details?: unknown): void {
    this.uiState.showError(code, message, details);
  }

  public showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    this.uiState.showToast(message, type);
  }

  public showLoading(): void {
    this.uiState.showLoading();
  }

  public hideLoading(): void {
    this.uiState.hideLoading();
  }

  public isLoading(): boolean {
    return this.uiState.isLoading();
  }

  public createComponent(type: 'parking-lot-selector', options: ComponentOptions): import('../components/ParkingLotSelector').ParkingLotSelector;
  public createComponent(type: 'space-panel', options: ComponentOptions): import('../components/SpacePanel').SpacePanel;
  public createComponent(type: 'plate-input', options: ComponentOptions): import('../components/PlateInput').PlateInput;
  public createComponent(type: 'order-card', options: ComponentOptions): import('../components/OrderCard').OrderCard;
  public createComponent(type: 'coupon-list', options: ComponentOptions): import('../components/CouponList').CouponList;
  public createComponent(type: 'payment-result', options: ComponentOptions): import('../components/PaymentResult').PaymentResult;
  public createComponent(type: 'invoice-apply', options: ComponentOptions): import('../components/InvoiceApply').InvoiceApply;
  public createComponent(type: ComponentType, options: ComponentOptions): unknown {
    this.track('component_create', { type });
    return this.components.create(type as any, options);
  }

  public async searchParkingLots(
    keyword?: string,
    latitude?: number,
    longitude?: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ParkingLot[]> {
    this.uiState.showLoading();
    try {
      this.track('parking_lot_search', { keyword, page, pageSize });
      const result = await this.parking.searchParkingLots(keyword, latitude, longitude, page, pageSize);
      return result;
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getParkingLotDetail(lotId: string): Promise<ParkingLot> {
    this.uiState.showLoading();
    try {
      this.track('parking_lot_detail', { lotId });
      return await this.parking.getParkingLotDetail(lotId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getAvailableSpaces(lotId: string): Promise<{ available: number; total: number }> {
    this.track('available_spaces', { lotId });
    return this.parking.getAvailableSpaces(lotId);
  }

  public async estimatePrice(lotId: string, durationMinutes: number, plateNumber?: string): Promise<PriceEstimate> {
    this.uiState.showLoading();
    try {
      this.track('price_estimate', { lotId, durationMinutes, plateNumber });
      return await this.parking.estimatePrice(lotId, durationMinutes, plateNumber);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getOrders(status?: string, page: number = 1, pageSize: number = 20): Promise<ParkingOrder[]> {
    this.uiState.showLoading();
    try {
      this.track('order_list', { status, page, pageSize });
      return await this.parking.getOrders(status, page, pageSize);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getOrderDetail(orderId: string): Promise<ParkingOrder> {
    this.uiState.showLoading();
    try {
      this.track('order_detail', { orderId });
      return await this.parking.getOrderDetail(orderId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getOrderByPlate(plateNumber: string, lotId?: string): Promise<ParkingOrder | null> {
    this.uiState.showLoading();
    try {
      this.track('order_by_plate', { plateNumber, lotId });
      return await this.parking.getOrderByPlate(plateNumber, lotId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getCoupons(lotId?: string, availableOnly: boolean = true): Promise<Coupon[]> {
    this.uiState.showLoading();
    try {
      this.track('coupon_list', { lotId, availableOnly });
      return await this.parking.getCoupons(lotId, availableOnly);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async applyCoupon(orderId: string, couponId: string): Promise<{ discountAmount: number; payableAmount: number }> {
    this.uiState.showLoading();
    try {
      this.track('coupon_apply', { orderId, couponId });
      return await this.parking.applyCoupon(orderId, couponId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getVehicles(): Promise<Vehicle[]> {
    this.uiState.showLoading();
    try {
      this.track('vehicle_list');
      return await this.parking.getVehicles();
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async bindVehicle(plateNumber: string, type: string = 'car'): Promise<Vehicle> {
    this.uiState.showLoading();
    try {
      this.track('vehicle_bind', { plateNumber, type });
      const result = await this.parking.bindVehicle(plateNumber, type);
      this.uiState.showToast('车辆绑定成功', 'success');
      return result;
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async unbindVehicle(vehicleId: string): Promise<void> {
    this.uiState.showLoading();
    try {
      this.track('vehicle_unbind', { vehicleId });
      await this.parking.unbindVehicle(vehicleId);
      this.uiState.showToast('车辆解绑成功', 'success');
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async setDefaultVehicle(vehicleId: string): Promise<void> {
    this.uiState.showLoading();
    try {
      this.track('vehicle_set_default', { vehicleId });
      await this.parking.setDefaultVehicle(vehicleId);
      this.uiState.showToast('设置成功', 'success');
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getMonthlyCards(): Promise<MonthlyCard[]> {
    this.uiState.showLoading();
    try {
      this.track('monthly_card_list');
      return await this.parking.getMonthlyCards();
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async validateVisitorCode(code: string, lotId?: string): Promise<VisitorCode> {
    this.uiState.showLoading();
    try {
      this.track('visitor_code_validate', { code, lotId });
      return await this.parking.validateVisitorCode(code, lotId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getParkingSpots(lotId: string, plateNumber?: string): Promise<ParkingSpot[]> {
    this.uiState.showLoading();
    try {
      this.track('parking_spots', { lotId, plateNumber });
      return await this.parking.getParkingSpots(lotId, plateNumber);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async initiatePayment(
    orderId: string,
    paymentMethod: string,
    couponId?: string
  ): Promise<{ paymentId: string; payUrl?: string; qrCode?: string }> {
    this.uiState.showLoading();
    try {
      this.track('payment_initiate', { orderId, paymentMethod, couponId });
      return await this.parking.initiatePayment(orderId, paymentMethod, couponId);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async checkPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'success' | 'failed'; orderId?: string }> {
    this.track('payment_status', { paymentId });
    return this.parking.checkPaymentStatus(paymentId);
  }

  public async applyInvoice(
    orderIds: string[],
    invoiceType: 'personal' | 'company',
    title: string,
    email: string,
    taxNumber?: string
  ): Promise<Invoice> {
    this.uiState.showLoading();
    try {
      this.track('invoice_apply', { orderIds, invoiceType });
      const result = await this.parking.applyInvoice(orderIds, invoiceType, title, email, taxNumber);
      this.uiState.showToast('发票申请提交成功', 'success');
      return result;
    } finally {
      this.uiState.hideLoading();
    }
  }

  public async getInvoiceList(page: number = 1, pageSize: number = 20): Promise<Invoice[]> {
    this.uiState.showLoading();
    try {
      this.track('invoice_list', { page, pageSize });
      return await this.parking.getInvoiceList(page, pageSize);
    } finally {
      this.uiState.hideLoading();
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.parking.clearCache();
  }

  public destroy(): void {
    this.components.destroyAll();
    this.eventBus.clear();
    this.cache.clear();
    this.tracker.clearQueue();
    this.isInitialized = false;
    SmartParkingSDK.instance = null;
  }
}
