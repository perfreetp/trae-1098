import { SmartParkingSDK } from './core/SDK';

export { SmartParkingSDK };

export * from './types';

export { ParkingLotSelector } from './components/ParkingLotSelector';
export { SpacePanel } from './components/SpacePanel';
export { PlateInput } from './components/PlateInput';
export { OrderCard } from './components/OrderCard';
export { CouponList } from './components/CouponList';
export { PaymentResult } from './components/PaymentResult';
export { InvoiceApply } from './components/InvoiceApply';

export { EventBus } from './core/EventBus';
export { ConfigManager } from './core/ConfigManager';
export { I18n } from './core/I18n';
export { Tracker } from './core/Tracker';
export { CacheManager } from './core/CacheManager';
export { UIStateManager } from './core/UIStateManager';
export { ComponentManager } from './core/ComponentManager';

export { HttpService } from './services/HttpService';
export { ParkingService } from './services/ParkingService';

const sdk = SmartParkingSDK.getInstance();
export default sdk;
