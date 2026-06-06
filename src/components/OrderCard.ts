import type { ComponentOptions, ParkingOrder } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface OrderCardData {
  order?: ParkingOrder;
  showActions?: boolean;
}

export class OrderCard extends BaseComponent {
  private order?: ParkingOrder;
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
    const data = this.componentData as OrderCardData;
    this.order = data.order;
    this.showActions = data.showActions !== false;
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk order-card';

    if (!this.order) {
      this.renderEmpty();
      return;
    }

    const card = document.createElement('div');
    card.className = 'parking-sdk-card';
    card.style.cssText = `
      overflow: hidden;
    `;

    this.renderHeader(card);
    this.renderInfo(card);
    this.renderPrice(card);

    if (this.showActions) {
      this.renderActions(card);
    }

    this.element.appendChild(card);
  }

  private renderEmpty(): void {
    const empty = document.createElement('div');
    empty.className = 'parking-sdk-empty';
    empty.innerHTML = `
      <div class="parking-sdk-empty-icon">📋</div>
      <div>${this.t('common.noData')}</div>
    `;
    this.element.appendChild(empty);
  }

  private renderHeader(container: HTMLElement): void {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--parking-color-border-light);
      margin-bottom: 16px;
    `;

    const left = document.createElement('div');
    left.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const icon = document.createElement('span');
    icon.style.cssText = `
      font-size: 20px;
    `;
    icon.textContent = '🚗';

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
    `;
    title.textContent = this.order!.parkingLotName;

    left.appendChild(icon);
    left.appendChild(title);

    const statusTag = document.createElement('span');
    const statusClass = this.getStatusClass(this.order!.status);
    statusTag.className = `parking-sdk-tag ${statusClass}`;
    statusTag.textContent = this.t(`order.status.${this.order!.status}`);

    header.appendChild(left);
    header.appendChild(statusTag);
    container.appendChild(header);
  }

  private renderInfo(container: HTMLElement): void {
    const info = document.createElement('div');
    info.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
    `;

    this.renderInfoRow(info, this.t('order.orderNo'), this.order!.orderNo);
    this.renderInfoRow(info, this.t('plate.title'), this.order!.plateNumber, true);
    this.renderInfoRow(info, this.t('order.entryTime'), this.formatDateTime(this.order!.entryTime));
    
    if (this.order!.exitTime) {
      this.renderInfoRow(info, this.t('order.exitTime'), this.formatDateTime(this.order!.exitTime));
    }

    this.renderInfoRow(info, this.t('order.duration'), this.formatDuration(this.order!.duration));

    container.appendChild(info);
  }

  private renderInfoRow(container: HTMLElement, label: string, value: string, highlight?: boolean): void {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
    `;

    const labelEl = document.createElement('span');
    labelEl.style.cssText = `
      color: var(--parking-color-text-secondary);
    `;
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = `
      color: var(--parking-color-text-primary);
      ${highlight ? 'font-weight: 600; letter-spacing: 1px;' : ''}
    `;
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  }

  private renderPrice(container: HTMLElement): void {
    const priceSection = document.createElement('div');
    priceSection.style.cssText = `
      padding: 16px;
      background: var(--parking-color-bg-secondary);
      border-radius: var(--parking-radius-md);
      margin-bottom: ${this.showActions ? '16px' : '0'};
    `;

    const rows: { label: string; value: string; type?: 'strike' | 'primary' }[] = [
      { label: this.t('order.totalAmount'), value: `¥${this.order!.totalAmount.toFixed(2)}` },
    ];

    if (this.order!.discountAmount > 0) {
      rows.push({ label: this.t('order.discountAmount'), value: `-¥${this.order!.discountAmount.toFixed(2)}`, type: 'strike' });
    }

    rows.push({ label: this.t('order.payableAmount'), value: `¥${this.order!.payableAmount.toFixed(2)}`, type: 'primary' });

    rows.forEach((row, index) => {
      const priceRow = document.createElement('div');
      priceRow.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: ${row.type === 'primary' ? '16px' : '14px'};
        ${index > 0 ? 'margin-top: 8px;' : ''}
      `;

      const label = document.createElement('span');
      label.style.cssText = `
        color: var(--parking-color-text-secondary);
      `;
      label.textContent = row.label;

      const value = document.createElement('span');
      value.style.cssText = `
        color: ${row.type === 'primary' ? 'var(--parking-color-error)' : 'var(--parking-color-text-primary)'};
        ${row.type === 'primary' ? 'font-weight: 700;' : ''}
        ${row.type === 'strike' ? 'text-decoration: line-through; opacity: 0.6;' : ''}
      `;
      value.textContent = row.value;

      priceRow.appendChild(label);
      priceRow.appendChild(value);
      priceSection.appendChild(priceRow);
    });

    container.appendChild(priceSection);
  }

  private renderActions(container: HTMLElement): void {
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    if (this.order!.status === 'pending' || this.order!.status === 'parking') {
      const payBtn = document.createElement('button');
      payBtn.className = 'parking-sdk-btn parking-sdk-btn-primary parking-sdk-btn-block';
      payBtn.textContent = this.t('payment.pay');
      payBtn.addEventListener('click', () => {
        this.emit('pay', { order: this.order });
      });

      const couponBtn = document.createElement('button');
      couponBtn.className = 'parking-sdk-btn parking-sdk-btn-default parking-sdk-btn-block';
      couponBtn.textContent = this.t('coupon.title');
      couponBtn.addEventListener('click', () => {
        this.emit('select-coupon', { order: this.order });
      });

      actions.appendChild(couponBtn);
      actions.appendChild(payBtn);
    } else if (this.order!.status === 'paid' || this.order!.status === 'completed') {
      const invoiceBtn = document.createElement('button');
      invoiceBtn.className = 'parking-sdk-btn parking-sdk-btn-default parking-sdk-btn-block';
      invoiceBtn.textContent = this.t('invoice.pageTitle');
      invoiceBtn.addEventListener('click', () => {
        this.emit('apply-invoice', { order: this.order });
      });

      const detailBtn = document.createElement('button');
      detailBtn.className = 'parking-sdk-btn parking-sdk-btn-primary parking-sdk-btn-block';
      detailBtn.textContent = this.t('common.viewDetail');
      detailBtn.addEventListener('click', () => {
        this.emit('view-detail', { order: this.order });
      });

      actions.appendChild(invoiceBtn);
      actions.appendChild(detailBtn);
    }

    container.appendChild(actions);
  }

  private getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      parking: 'parking-sdk-tag-primary',
      pending: 'parking-sdk-tag-warning',
      paid: 'parking-sdk-tag-success',
      completed: 'parking-sdk-tag-success',
      cancelled: 'parking-sdk-tag-error',
    };
    return classMap[status] || 'parking-sdk-tag-primary';
  }

  private formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}小时`;
    }
    return `${hours}小时${mins}分钟`;
  }

  public setOrder(order: ParkingOrder): void {
    this.order = order;
    this.render();
  }

  public getOrder(): ParkingOrder | undefined {
    return this.order;
  }
}
