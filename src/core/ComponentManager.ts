import type { ComponentOptions, ComponentType } from '../types';
import { EventBus } from './EventBus';
import { ConfigManager } from './ConfigManager';
import { I18n } from './I18n';
import { ParkingLotSelector } from '../components/ParkingLotSelector';
import { SpacePanel } from '../components/SpacePanel';
import { PlateInput } from '../components/PlateInput';
import { OrderCard } from '../components/OrderCard';
import { CouponList } from '../components/CouponList';
import { PaymentResult } from '../components/PaymentResult';
import { InvoiceApply } from '../components/InvoiceApply';

type ComponentInstance = 
  | ParkingLotSelector
  | SpacePanel
  | PlateInput
  | OrderCard
  | CouponList
  | PaymentResult
  | InvoiceApply;

export class ComponentManager {
  private eventBus: EventBus;
  private config: ConfigManager;
  private i18n: I18n;
  private components: Map<string, ComponentInstance> = new Map();
  private componentIdCounter: number = 0;

  constructor(eventBus: EventBus, config: ConfigManager, i18n: I18n) {
    this.eventBus = eventBus;
    this.config = config;
    this.i18n = i18n;
  }

  create(type: 'parking-lot-selector', options: ComponentOptions): ParkingLotSelector;
  create(type: 'space-panel', options: ComponentOptions): SpacePanel;
  create(type: 'plate-input', options: ComponentOptions): PlateInput;
  create(type: 'order-card', options: ComponentOptions): OrderCard;
  create(type: 'coupon-list', options: ComponentOptions): CouponList;
  create(type: 'payment-result', options: ComponentOptions): PaymentResult;
  create(type: 'invoice-apply', options: ComponentOptions): InvoiceApply;
  create(type: ComponentType, options: ComponentOptions): ComponentInstance {
    const id = `component_${++this.componentIdCounter}`;
    let component: ComponentInstance;

    switch (type) {
      case 'parking-lot-selector':
        component = new ParkingLotSelector(options, this.eventBus, this.config, this.i18n);
        break;
      case 'space-panel':
        component = new SpacePanel(options, this.eventBus, this.config, this.i18n);
        break;
      case 'plate-input':
        component = new PlateInput(options, this.eventBus, this.config, this.i18n);
        break;
      case 'order-card':
        component = new OrderCard(options, this.eventBus, this.config, this.i18n);
        break;
      case 'coupon-list':
        component = new CouponList(options, this.eventBus, this.config, this.i18n);
        break;
      case 'payment-result':
        component = new PaymentResult(options, this.eventBus, this.config, this.i18n);
        break;
      case 'invoice-apply':
        component = new InvoiceApply(options, this.eventBus, this.config, this.i18n);
        break;
      default:
        throw new Error(`Unknown component type: ${type}`);
    }

    this.components.set(id, component);
    return component;
  }

  destroy(component: ComponentInstance): void {
    const entries = Array.from(this.components.entries());
    const entry = entries.find(([, comp]) => comp === component);
    
    if (entry) {
      const [id] = entry;
      component.destroy();
      this.components.delete(id);
    }
  }

  destroyAll(): void {
    this.components.forEach((component) => {
      component.destroy();
    });
    this.components.clear();
  }

  getComponentCount(): number {
    return this.components.size;
  }
}
