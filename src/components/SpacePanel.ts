import type { ComponentOptions, ParkingLot } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface SpacePanelData {
  parkingLot?: ParkingLot;
  availableSpaces?: number;
  totalSpaces?: number;
  showDetail?: boolean;
}

export class SpacePanel extends BaseComponent {
  private parkingLot?: ParkingLot;
  private availableSpaces: number = 0;
  private totalSpaces: number = 0;
  private showDetail: boolean = true;

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
    const data = this.componentData as SpacePanelData;
    this.parkingLot = data.parkingLot;
    if (this.parkingLot) {
      this.availableSpaces = this.parkingLot.availableSpaces;
      this.totalSpaces = this.parkingLot.totalSpaces;
    } else {
      this.availableSpaces = data.availableSpaces || 0;
      this.totalSpaces = data.totalSpaces || 0;
    }
    this.showDetail = data.showDetail !== false;
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk space-panel';

    const card = document.createElement('div');
    card.className = 'parking-sdk-card';
    card.style.cssText = `
      background: linear-gradient(135deg, var(--parking-color-primary) 0%, var(--parking-color-primary-hover) 100%);
      color: white;
      position: relative;
      overflow: hidden;
    `;

    if (this.parkingLot) {
      const lotName = document.createElement('div');
      lotName.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      const iconSpan = document.createElement('span');
      iconSpan.textContent = '📍';
      const textSpan = document.createElement('span');
      textSpan.textContent = this.parkingLot.name;
      lotName.appendChild(iconSpan);
      lotName.appendChild(textSpan);
      card.appendChild(lotName);
    }

    const statsRow = document.createElement('div');
    statsRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 24px;
    `;

    const availableStat = document.createElement('div');
    availableStat.style.cssText = `
      text-align: center;
    `;

    const availableValue = document.createElement('div');
    availableValue.style.cssText = `
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    `;
    availableValue.textContent = String(this.availableSpaces);

    const availableLabel = document.createElement('div');
    availableLabel.style.cssText = `
      font-size: 13px;
      opacity: 0.9;
    `;
    availableLabel.textContent = this.t('parking.availableSpaces');

    availableStat.appendChild(availableValue);
    availableStat.appendChild(availableLabel);

    const divider = document.createElement('div');
    divider.style.cssText = `
      width: 1px;
      height: 60px;
      background: rgba(255, 255, 255, 0.3);
    `;

    const totalStat = document.createElement('div');
    totalStat.style.cssText = `
      text-align: center;
    `;

    const totalValue = document.createElement('div');
    totalValue.style.cssText = `
      font-size: 32px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 4px;
      opacity: 0.9;
    `;
    totalValue.textContent = String(this.totalSpaces);

    const totalLabel = document.createElement('div');
    totalLabel.style.cssText = `
      font-size: 13px;
      opacity: 0.8;
    `;
    totalLabel.textContent = this.t('parking.totalSpaces');

    totalStat.appendChild(totalValue);
    totalStat.appendChild(totalLabel);

    statsRow.appendChild(availableStat);
    statsRow.appendChild(divider);
    statsRow.appendChild(totalStat);
    card.appendChild(statsRow);

    if (this.showDetail && this.totalSpaces > 0) {
      const progressWrapper = document.createElement('div');
      progressWrapper.style.cssText = `
        margin-top: 20px;
      `;

      const progressHeader = document.createElement('div');
      progressHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 8px;
        opacity: 0.9;
      `;

      const usedPercent = Math.round(((this.totalSpaces - this.availableSpaces) / this.totalSpaces) * 100);

      progressHeader.innerHTML = `
        <span>${this.t('parking.availableSpaces')}</span>
        <span>${100 - usedPercent}%</span>
      `;

      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        overflow: hidden;
      `;

      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        width: ${100 - usedPercent}%;
        background: white;
        border-radius: 4px;
        transition: width 0.5s ease;
      `;

      progressBar.appendChild(progressFill);
      progressWrapper.appendChild(progressHeader);
      progressWrapper.appendChild(progressBar);
      card.appendChild(progressWrapper);
    }

    const decoCircle1 = document.createElement('div');
    decoCircle1.style.cssText = `
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      top: -40px;
      right: -40px;
    `;

    const decoCircle2 = document.createElement('div');
    decoCircle2.style.cssText = `
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      bottom: -20px;
      left: -20px;
    `;

    card.appendChild(decoCircle1);
    card.appendChild(decoCircle2);
    this.element.appendChild(card);
  }

  public updateSpaces(available: number, total: number): void {
    this.availableSpaces = available;
    this.totalSpaces = total;
    this.render();
  }

  public setParkingLot(lot: ParkingLot): void {
    this.parkingLot = lot;
    this.availableSpaces = lot.availableSpaces;
    this.totalSpaces = lot.totalSpaces;
    this.render();
  }
}
