import type { ComponentOptions, Coupon } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface CouponListData {
  coupons?: Coupon[];
  selectedCouponId?: string;
  showSelect?: boolean;
  orderAmount?: number;
}

export class CouponList extends BaseComponent {
  private coupons: Coupon[] = [];
  private selectedCouponId?: string;
  private showSelect: boolean = true;
  private orderAmount: number = 0;

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
    const data = this.componentData as CouponListData;
    this.coupons = data.coupons || [];
    this.selectedCouponId = data.selectedCouponId;
    this.showSelect = data.showSelect !== false;
    this.orderAmount = data.orderAmount || 0;
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk coupon-list';

    const availableCoupons = this.coupons.filter((c) => c.status === 'available');
    const unavailableCoupons = this.coupons.filter((c) => c.status !== 'available');

    if (this.coupons.length === 0) {
      this.renderEmpty();
      return;
    }

    if (availableCoupons.length > 0) {
      this.renderSection(this.t('coupon.available'), availableCoupons, true);
    }

    if (unavailableCoupons.length > 0) {
      const sectionTitle = document.createElement('div');
      sectionTitle.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: var(--parking-color-text-secondary);
        margin: 20px 0 12px;
      `;
      sectionTitle.textContent = this.t('coupon.unavailable');
      this.element.appendChild(sectionTitle);
      this.renderSection('', unavailableCoupons, false);
    }
  }

  private renderEmpty(): void {
    const empty = document.createElement('div');
    empty.className = 'parking-sdk-empty';
    empty.innerHTML = `
      <div class="parking-sdk-empty-icon">🎫</div>
      <div>${this.t('coupon.noAvailable')}</div>
    `;
    this.element.appendChild(empty);
  }

  private renderSection(title: string, coupons: Coupon[], isAvailable: boolean): void {
    if (title) {
      const sectionTitle = document.createElement('div');
      sectionTitle.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: var(--parking-color-text-primary);
        margin-bottom: 12px;
      `;
      sectionTitle.textContent = title;
      this.element.appendChild(sectionTitle);
    }

    const list = document.createElement('div');
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    coupons.forEach((coupon) => {
      this.renderCouponItem(list, coupon, isAvailable);
    });

    this.element.appendChild(list);
  }

  private renderCouponItem(container: HTMLElement, coupon: Coupon, isAvailable: boolean): void {
    const isSelected = coupon.id === this.selectedCouponId;
    const isUsable = isAvailable && this.isCouponUsable(coupon);

    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      border-radius: var(--parking-radius-lg);
      overflow: hidden;
      background: var(--parking-color-bg-primary);
      border: 2px solid ${isSelected ? 'var(--parking-color-primary)' : 'var(--parking-color-border-light)'};
      opacity: ${isUsable ? 1 : 0.6};
      ${this.showSelect && isUsable ? 'cursor: pointer;' : ''}
      transition: all 0.2s ease;
    `;

    if (this.showSelect && isUsable) {
      item.addEventListener('click', () => {
        if (isSelected) {
          this.selectedCouponId = undefined;
          this.emit('unselect', { coupon });
        } else {
          this.selectedCouponId = coupon.id;
          this.emit('select', { coupon });
        }
        this.render();
      });
    }

    const leftSection = document.createElement('div');
    leftSection.style.cssText = `
      width: 100px;
      padding: 16px 8px;
      background: ${isUsable ? 'linear-gradient(135deg, var(--parking-color-primary) 0%, var(--parking-color-primary-hover) 100%)' : 'var(--parking-color-bg-secondary)'};
      color: ${isUsable ? 'white' : 'var(--parking-color-text-tertiary)'};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    const valueText = document.createElement('div');
    valueText.style.cssText = `
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    `;
    valueText.textContent = this.getCouponValueText(coupon);

    const descText = document.createElement('div');
    descText.style.cssText = `
      font-size: 12px;
      opacity: 0.9;
    `;
    descText.textContent = this.getCouponTypeText(coupon);

    leftSection.appendChild(valueText);
    leftSection.appendChild(descText);

    const circleTop = document.createElement('div');
    circleTop.style.cssText = `
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--parking-color-bg-primary);
      top: -8px;
      right: -8px;
    `;

    const circleBottom = document.createElement('div');
    circleBottom.style.cssText = `
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--parking-color-bg-primary);
      bottom: -8px;
      right: -8px;
    `;

    leftSection.appendChild(circleTop);
    leftSection.appendChild(circleBottom);

    const rightSection = document.createElement('div');
    rightSection.style.cssText = `
      flex: 1;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    const topRow = document.createElement('div');
    topRow.style.cssText = `
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    `;

    const name = document.createElement('div');
    name.style.cssText = `
      font-size: 15px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
    `;
    name.textContent = coupon.name;

    if (isSelected) {
      const checkIcon = document.createElement('span');
      checkIcon.style.cssText = `
        color: var(--parking-color-primary);
        font-size: 18px;
      `;
      checkIcon.textContent = '✓';
      topRow.appendChild(checkIcon);
    }

    topRow.insertBefore(name, topRow.firstChild);

    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--parking-color-text-tertiary);
    `;

    const expireTime = document.createElement('span');
    expireTime.textContent = this.t('coupon.expireTime', {
      time: this.formatDate(coupon.expireTime),
    });

    bottomRow.appendChild(expireTime);

    if (!isUsable && coupon.minAmount && this.orderAmount < coupon.minAmount) {
      const tip = document.createElement('span');
      tip.style.cssText = `
        color: var(--parking-color-warning);
      `;
      tip.textContent = this.t('coupon.minAmount', { amount: coupon.minAmount });
      bottomRow.appendChild(tip);
    }

    if (!isAvailable) {
      const statusTip = document.createElement('span');
      statusTip.style.cssText = `
        color: ${coupon.status === 'used' ? 'var(--parking-color-text-tertiary)' : 'var(--parking-color-error)'};
      `;
      statusTip.textContent = coupon.status === 'used' ? this.t('coupon.used') : this.t('coupon.expired');
      bottomRow.appendChild(statusTip);
    }

    rightSection.appendChild(topRow);
    rightSection.appendChild(bottomRow);

    item.appendChild(leftSection);
    item.appendChild(rightSection);
    container.appendChild(item);
  }

  private getCouponValueText(coupon: Coupon): string {
    switch (coupon.type) {
      case 'discount':
        return coupon.value + '';
      case 'amount':
        return `¥${coupon.value}`;
      case 'free_hours':
        return coupon.value + 'h';
      default:
        return '';
    }
  }

  private getCouponTypeText(coupon: Coupon): string {
    switch (coupon.type) {
      case 'discount':
        return this.t('coupon.discountSuffix');
      case 'amount':
        return this.t('coupon.couponSuffix');
      case 'free_hours':
        return this.t('coupon.freeHoursSuffix');
      default:
        return '';
    }
  }

  private isCouponUsable(coupon: Coupon): boolean {
    if (coupon.status !== 'available') return false;
    if (coupon.minAmount && this.orderAmount < coupon.minAmount) return false;
    return true;
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  public setCoupons(coupons: Coupon[]): void {
    this.coupons = coupons;
    this.render();
  }

  public setSelectedCoupon(couponId: string | undefined): void {
    this.selectedCouponId = couponId;
    this.render();
  }

  public getSelectedCoupon(): Coupon | undefined {
    return this.coupons.find((c) => c.id === this.selectedCouponId);
  }

  public setOrderAmount(amount: number): void {
    this.orderAmount = amount;
    this.render();
  }
}
