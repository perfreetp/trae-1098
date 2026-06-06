import type { ComponentOptions, ParkingOrder } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface PaymentResultData {
  success: boolean;
  order?: ParkingOrder;
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  errorMessage?: string;
  showActions?: boolean;
}

export class PaymentResult extends BaseComponent {
  private success: boolean = false;
  private order?: ParkingOrder;
  private paidAmount: number = 0;
  private paymentMethod?: string;
  private transactionId?: string;
  private errorMessage?: string;
  private showActions: boolean = true;

  constructor(
    options: ComponentOptions,
    eventBus: EventBus,
    config: ConfigManager,
    i18n: I18n
  ) {
    super(options, eventBus, config, i18n);
    this.initData();
    this.render();
  }

  private initData(): void {
    const data = this.componentData as unknown as PaymentResultData;
    this.success = data.success ?? true;
    this.order = data.order;
    this.paidAmount = data.paidAmount || (data.order?.paidAmount ?? 0);
    this.paymentMethod = data.paymentMethod;
    this.transactionId = data.transactionId;
    this.errorMessage = data.errorMessage;
    this.showActions = data.showActions !== false;
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk payment-result';

    const wrapper = document.createElement('div');
    wrapper.className = 'parking-sdk-card';
    wrapper.style.cssText = `
      text-align: center;
      padding: 40px 24px;
    `;

    this.renderIcon(wrapper);
    this.renderTitle(wrapper);
    this.renderAmount(wrapper);
    this.renderInfo(wrapper);

    if (this.showActions) {
      this.renderActions(wrapper);
    }

    this.element.appendChild(wrapper);
  }

  private renderIcon(container: HTMLElement): void {
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      background: ${this.success ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)'};
    `;
    iconWrapper.textContent = this.success ? '✅' : '❌';
    container.appendChild(iconWrapper);
  }

  private renderTitle(container: HTMLElement): void {
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
      margin-bottom: 8px;
    `;
    title.textContent = this.success ? this.t('payment.success') : this.t('payment.failed');

    container.appendChild(title);

    if (!this.success && this.errorMessage) {
      const msg = document.createElement('div');
      msg.style.cssText = `
        font-size: 14px;
        color: var(--parking-color-text-secondary);
        margin-bottom: 20px;
      `;
      msg.textContent = this.errorMessage;
      container.appendChild(msg);
    }
  }

  private renderAmount(container: HTMLElement): void {
    if (!this.success) return;

    const amountWrapper = document.createElement('div');
    amountWrapper.style.cssText = `
      margin: 24px 0;
    `;

    const amountLabel = document.createElement('div');
    amountLabel.style.cssText = `
      font-size: 14px;
      color: var(--parking-color-text-secondary);
      margin-bottom: 8px;
    `;
    amountLabel.textContent = this.t('order.paidAmount');

    const amountValue = document.createElement('div');
    amountValue.style.cssText = `
      font-size: 36px;
      font-weight: 700;
      color: var(--parking-color-primary);
    `;
    amountValue.textContent = `¥${this.paidAmount.toFixed(2)}`;

    amountWrapper.appendChild(amountLabel);
    amountWrapper.appendChild(amountValue);
    container.appendChild(amountWrapper);
  }

  private renderInfo(container: HTMLElement): void {
    if (!this.order && !this.paymentMethod && !this.transactionId) return;

    const infoWrapper = document.createElement('div');
    infoWrapper.style.cssText = `
      background: var(--parking-color-bg-secondary);
      border-radius: var(--parking-radius-md);
      padding: 16px;
      margin: 20px 0;
      text-align: left;
    `;

    if (this.order) {
      this.renderInfoRow(infoWrapper, this.t('parking.parkingLot'), this.order.parkingLotName);
      this.renderInfoRow(infoWrapper, this.t('plate.title'), this.order.plateNumber);
      this.renderInfoRow(infoWrapper, this.t('order.orderNo'), this.order.orderNo);
    }

    if (this.paymentMethod) {
      this.renderInfoRow(infoWrapper, this.t('payment.title'), this.getPaymentMethodName(this.paymentMethod));
    }

    if (this.transactionId) {
      this.renderInfoRow(infoWrapper, this.t('payment.transactionId'), this.transactionId);
    }

    container.appendChild(infoWrapper);
  }

  private renderInfoRow(container: HTMLElement, label: string, value: string): void {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
    `;

    const labelEl = document.createElement('span');
    labelEl.style.cssText = `
      color: var(--parking-color-text-secondary);
    `;
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = `
      color: var(--parking-color-text-primary);
      font-weight: 500;
    `;
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  }

  private renderActions(container: HTMLElement): void {
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 12px;
      margin-top: 24px;
    `;

    if (this.success) {
      const orderBtn = document.createElement('button');
      orderBtn.className = 'parking-sdk-btn parking-sdk-btn-default parking-sdk-btn-block';
      orderBtn.textContent = this.t('payment.viewOrder');
      orderBtn.addEventListener('click', () => {
        this.emit('view-order', { order: this.order });
      });

      const homeBtn = document.createElement('button');
      homeBtn.className = 'parking-sdk-btn parking-sdk-btn-primary parking-sdk-btn-block';
      homeBtn.textContent = this.t('payment.backToHome');
      homeBtn.addEventListener('click', () => {
        this.emit('back-home', {});
      });

      actions.appendChild(orderBtn);
      actions.appendChild(homeBtn);
    } else {
      const retryBtn = document.createElement('button');
      retryBtn.className = 'parking-sdk-btn parking-sdk-btn-primary parking-sdk-btn-block';
      retryBtn.textContent = this.t('common.retry');
      retryBtn.addEventListener('click', () => {
        this.emit('retry', { order: this.order });
      });

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'parking-sdk-btn parking-sdk-btn-default parking-sdk-btn-block';
      cancelBtn.textContent = this.t('common.cancel');
      cancelBtn.addEventListener('click', () => {
        this.emit('cancel', {});
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(retryBtn);
    }

    container.appendChild(actions);
  }

  private getPaymentMethodName(method: string): string {
    const names: Record<string, string> = {
      wechat: this.t('payment.wechat'),
      alipay: this.t('payment.alipay'),
      balance: this.t('payment.balance'),
    };
    return names[method] || method;
  }

  public setResult(success: boolean, data?: Partial<PaymentResultData>): void {
    this.success = success;
    if (data) {
      if (data.order) this.order = data.order;
      if (data.paidAmount !== undefined) this.paidAmount = data.paidAmount;
      if (data.paymentMethod) this.paymentMethod = data.paymentMethod;
      if (data.transactionId) this.transactionId = data.transactionId;
      if (data.errorMessage) this.errorMessage = data.errorMessage;
    }
    this.render();
  }
}
