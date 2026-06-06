import type { ComponentOptions, ParkingOrder } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface InvoiceApplyData {
  orders?: ParkingOrder[];
  orderIds?: string[];
  totalAmount?: number;
}

interface InvoiceFormData {
  invoiceType: 'personal' | 'company';
  title: string;
  taxNumber: string;
  email: string;
}

export class InvoiceApply extends BaseComponent {
  private orders: ParkingOrder[] = [];
  private orderIds: string[] = [];
  private totalAmount: number = 0;
  private formData: InvoiceFormData = {
    invoiceType: 'personal',
    title: '',
    taxNumber: '',
    email: '',
  };
  private errors: Record<string, string> = {};
  private isSubmitting: boolean = false;

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
    const data = this.componentData as InvoiceApplyData;
    this.orders = data.orders || [];
    this.orderIds = data.orderIds || this.orders.map((o) => o.id);
    this.totalAmount = data.totalAmount || this.orders.reduce((sum, o) => sum + (o.paidAmount || o.payableAmount), 0);
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk invoice-apply';

    const wrapper = document.createElement('div');
    wrapper.className = 'parking-sdk-card';
    wrapper.style.cssText = `
      padding: 24px;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
      margin-bottom: 20px;
    `;
    title.textContent = this.t('invoice.pageTitle');
    wrapper.appendChild(title);

    this.renderOrderList(wrapper);
    this.renderAmountInfo(wrapper);
    this.renderForm(wrapper);
    this.renderSubmitBtn(wrapper);

    this.element.appendChild(wrapper);
  }

  private renderOrderList(container: HTMLElement): void {
    if (this.orders.length === 0) return;

    const section = document.createElement('div');
    section.style.cssText = `
      margin-bottom: 20px;
    `;

    const label = document.createElement('div');
    label.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 12px;
    `;
    label.textContent = '开票订单';

    const list = document.createElement('div');
    list.style.cssText = `
      background: var(--parking-color-bg-secondary);
      border-radius: var(--parking-radius-md);
      padding: 12px 16px;
    `;

    this.orders.forEach((order, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        ${index > 0 ? 'border-top: 1px solid var(--parking-color-border-light);' : ''}
      `;

      const left = document.createElement('div');

      const lotNameDiv = document.createElement('div');
      lotNameDiv.style.cssText = 'font-size: 14px; color: var(--parking-color-text-primary);';
      lotNameDiv.textContent = order.parkingLotName;

      const infoDiv = document.createElement('div');
      infoDiv.style.cssText = 'font-size: 12px; color: var(--parking-color-text-tertiary); margin-top: 2px;';
      infoDiv.textContent = `${order.plateNumber} · ${order.orderNo}`;

      left.appendChild(lotNameDiv);
      left.appendChild(infoDiv);

      const right = document.createElement('div');
      right.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: var(--parking-color-text-primary);
      `;
      right.textContent = `¥${(order.paidAmount || order.payableAmount).toFixed(2)}`;

      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    });

    section.appendChild(label);
    section.appendChild(list);
    container.appendChild(section);
  }

  private renderAmountInfo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%);
      border-radius: var(--parking-radius-md);
      margin-bottom: 24px;
    `;

    const left = document.createElement('div');
    left.style.cssText = `
      font-size: 14px;
      color: var(--parking-color-text-secondary);
    `;
    left.textContent = this.t('invoice.amount');

    const right = document.createElement('div');
    right.style.cssText = `
      font-size: 24px;
      font-weight: 700;
      color: var(--parking-color-primary);
    `;
    right.textContent = `¥${this.totalAmount.toFixed(2)}`;

    section.appendChild(left);
    section.appendChild(right);
    container.appendChild(section);
  }

  private renderForm(container: HTMLElement): void {
    const form = document.createElement('div');
    form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    this.renderTypeSelector(form);
    this.renderTitleInput(form);
    
    if (this.formData.invoiceType === 'company') {
      this.renderTaxNumberInput(form);
    }

    this.renderEmailInput(form);

    container.appendChild(form);
  }

  private renderTypeSelector(container: HTMLElement): void {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 8px;
    `;
    label.textContent = this.t('invoice.type');

    const options = document.createElement('div');
    options.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    ['personal', 'company'].forEach((type) => {
      const isSelected = this.formData.invoiceType === type;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        flex: 1;
        padding: 12px 16px;
        border: 2px solid ${isSelected ? 'var(--parking-color-primary)' : 'var(--parking-color-border-light)'};
        border-radius: var(--parking-radius-md);
        background: ${isSelected ? 'rgba(24, 144, 255, 0.05)' : 'var(--parking-color-bg-primary)'};
        color: ${isSelected ? 'var(--parking-color-primary)' : 'var(--parking-color-text-primary)'};
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      btn.textContent = type === 'personal' ? this.t('invoice.personal') : this.t('invoice.company');

      btn.addEventListener('click', () => {
        this.formData.invoiceType = type as 'personal' | 'company';
        if (type === 'personal') {
          this.formData.taxNumber = '';
          delete this.errors.taxNumber;
        }
        this.render();
      });

      options.appendChild(btn);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(options);
    container.appendChild(wrapper);
  }

  private renderTitleInput(container: HTMLElement): void {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 8px;
    `;
    label.textContent = this.t('invoice.title');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'parking-sdk-input';
    input.placeholder = this.formData.invoiceType === 'personal' ? '请输入个人姓名' : '请输入公司名称';
    input.value = this.formData.title;

    input.addEventListener('input', (e) => {
      this.formData.title = (e.target as HTMLInputElement).value;
      delete this.errors.title;
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    if (this.errors.title) {
      const error = document.createElement('div');
      error.style.cssText = `
        font-size: 12px;
        color: var(--parking-color-error);
        margin-top: 4px;
      `;
      error.textContent = this.errors.title;
      wrapper.appendChild(error);
    }

    container.appendChild(wrapper);
  }

  private renderTaxNumberInput(container: HTMLElement): void {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 8px;
    `;
    label.textContent = this.t('invoice.taxNumber');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'parking-sdk-input';
    input.placeholder = '请输入纳税人识别号';
    input.value = this.formData.taxNumber;

    input.addEventListener('input', (e) => {
      this.formData.taxNumber = (e.target as HTMLInputElement).value;
      delete this.errors.taxNumber;
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    if (this.errors.taxNumber) {
      const error = document.createElement('div');
      error.style.cssText = `
        font-size: 12px;
        color: var(--parking-color-error);
        margin-top: 4px;
      `;
      error.textContent = this.errors.taxNumber;
      wrapper.appendChild(error);
    }

    container.appendChild(wrapper);
  }

  private renderEmailInput(container: HTMLElement): void {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 8px;
    `;
    label.textContent = this.t('invoice.email');

    const input = document.createElement('input');
    input.type = 'email';
    input.className = 'parking-sdk-input';
    input.placeholder = this.t('invoice.emailPlaceholder');
    input.value = this.formData.email;

    input.addEventListener('input', (e) => {
      this.formData.email = (e.target as HTMLInputElement).value;
      delete this.errors.email;
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    if (this.errors.email) {
      const error = document.createElement('div');
      error.style.cssText = `
        font-size: 12px;
        color: var(--parking-color-error);
        margin-top: 4px;
      `;
      error.textContent = this.errors.email;
      wrapper.appendChild(error);
    }

    container.appendChild(wrapper);
  }

  private renderSubmitBtn(container: HTMLElement): void {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'parking-sdk-btn parking-sdk-btn-primary parking-sdk-btn-block parking-sdk-btn-lg';
    btn.style.cssText = `
      margin-top: 24px;
    `;
    btn.disabled = this.isSubmitting;

    if (this.isSubmitting) {
      btn.innerHTML = '<span class="parking-sdk-loading" style="margin-right: 8px;"></span> 提交中...';
    } else {
      btn.textContent = this.t('invoice.submit');
    }

    btn.addEventListener('click', () => {
      this.handleSubmit();
    });

    container.appendChild(btn);
  }

  private validateForm(): boolean {
    this.errors = {};

    if (!this.formData.title.trim()) {
      this.errors.title = this.formData.invoiceType === 'personal' ? '请输入姓名' : '请输入公司名称';
    }

    if (this.formData.invoiceType === 'company' && !this.formData.taxNumber.trim()) {
      this.errors.taxNumber = '请输入纳税人识别号';
    }

    if (!this.formData.email.trim()) {
      this.errors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.errors.email = '请输入正确的邮箱地址';
    }

    this.render();
    return Object.keys(this.errors).length === 0;
  }

  private handleSubmit(): void {
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    this.render();

    this.emit('submit', {
      ...this.formData,
      orderIds: this.orderIds,
      amount: this.totalAmount,
    });
  }

  public setSubmitting(submitting: boolean): void {
    this.isSubmitting = submitting;
    this.render();
  }

  public getFormData(): InvoiceFormData & { orderIds: string[]; amount: number } {
    return {
      ...this.formData,
      orderIds: this.orderIds,
      amount: this.totalAmount,
    };
  }

  public setOrders(orders: ParkingOrder[]): void {
    this.orders = orders;
    this.orderIds = orders.map((o) => o.id);
    this.totalAmount = orders.reduce((sum, o) => sum + (o.paidAmount || o.payableAmount), 0);
    this.render();
  }
}
