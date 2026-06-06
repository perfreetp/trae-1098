import type { ComponentOptions, ParkingLot } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface ParkingLotSelectorData {
  parkingLots?: ParkingLot[];
  selectedLotId?: string;
  showSearch?: boolean;
  showDistance?: boolean;
}

export class ParkingLotSelector extends BaseComponent {
  private parkingLots: ParkingLot[] = [];
  private selectedLotId?: string;
  private showSearch: boolean = true;
  private showDistance: boolean = true;
  private searchKeyword: string = '';

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
    const data = this.componentData as ParkingLotSelectorData;
    this.parkingLots = data.parkingLots || [];
    this.selectedLotId = data.selectedLotId;
    this.showSearch = data.showSearch !== false;
    this.showDistance = data.showDistance !== false;
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk parking-lot-selector';

    if (this.showSearch) {
      this.renderSearchBar();
    }

    this.renderLotList();
  }

  private renderSearchBar(): void {
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'parking-lot-selector__search';
    searchWrapper.style.cssText = `
      position: relative;
      margin-bottom: 16px;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'parking-sdk-input';
    searchInput.placeholder = this.t('parking.searchPlaceholder');
    searchInput.value = this.searchKeyword;
    searchInput.style.cssText = `
      padding-left: 40px;
    `;

    searchInput.addEventListener('input', (e) => {
      this.searchKeyword = (e.target as HTMLInputElement).value;
      this.emit('search', { keyword: this.searchKeyword });
      this.renderLotList();
    });

    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = '🔍';
    searchIcon.style.cssText = `
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      opacity: 0.5;
    `;

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    this.element.appendChild(searchWrapper);
  }

  private renderLotList(): void {
    const listWrapper = document.createElement('div');
    listWrapper.className = 'parking-lot-selector__list';
    listWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    `;

    const filteredLots = this.getFilteredLots();

    if (filteredLots.length === 0) {
      this.renderEmptyState(listWrapper);
    } else {
      filteredLots.forEach((lot) => {
        this.renderLotItem(listWrapper, lot);
      });
    }

    this.element.appendChild(listWrapper);
  }

  private getFilteredLots(): ParkingLot[] {
    if (!this.searchKeyword) return this.parkingLots;

    const keyword = this.searchKeyword.toLowerCase();
    return this.parkingLots.filter(
      (lot) =>
        lot.name.toLowerCase().includes(keyword) ||
        lot.address.toLowerCase().includes(keyword)
    );
  }

  private renderEmptyState(container: HTMLElement): void {
    const empty = document.createElement('div');
    empty.className = 'parking-sdk-empty';
    empty.innerHTML = `
      <div class="parking-sdk-empty-icon">🅿️</div>
      <div>${this.t('common.noData')}</div>
    `;
    container.appendChild(empty);
  }

  private renderLotItem(container: HTMLElement, lot: ParkingLot): void {
    const isSelected = lot.id === this.selectedLotId;
    const item = document.createElement('div');
    item.className = `parking-lot-selector__item ${isSelected ? 'is-selected' : ''}`;
    item.style.cssText = `
      padding: 16px;
      border-radius: var(--parking-radius-lg);
      background: var(--parking-color-bg-primary);
      border: 2px solid ${isSelected ? 'var(--parking-color-primary)' : 'var(--parking-color-border-light)'};
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    item.addEventListener('mouseenter', () => {
      if (!isSelected) {
        item.style.borderColor = 'var(--parking-color-border)';
      }
    });

    item.addEventListener('mouseleave', () => {
      if (!isSelected) {
        item.style.borderColor = 'var(--parking-color-border-light)';
      }
    });

    item.addEventListener('click', () => {
      this.selectedLotId = lot.id;
      this.emit('select', lot);
      this.render();
    });

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 8px;
    `;

    const nameWrapper = document.createElement('div');
    nameWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const name = document.createElement('div');
    name.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
    `;
    name.textContent = lot.name;

    const typeTag = document.createElement('span');
    typeTag.className = 'parking-sdk-tag parking-sdk-tag-primary';
    typeTag.textContent = this.getTypeLabel(lot.type);

    nameWrapper.appendChild(name);
    nameWrapper.appendChild(typeTag);

    const spaceTag = document.createElement('span');
    spaceTag.className = `parking-sdk-tag ${lot.availableSpaces > 0 ? 'parking-sdk-tag-success' : 'parking-sdk-tag-error'}`;
    spaceTag.textContent = `${lot.availableSpaces}/${lot.totalSpaces}`;

    header.appendChild(nameWrapper);
    header.appendChild(spaceTag);

    const address = document.createElement('div');
    address.style.cssText = `
      font-size: 13px;
      color: var(--parking-color-text-secondary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    address.innerHTML = `📍 ${lot.address}`;

    if (this.showDistance && lot.distance !== undefined) {
      const distance = document.createElement('span');
      distance.style.cssText = `
        margin-left: auto;
        color: var(--parking-color-text-tertiary);
      `;
      distance.textContent = this.t('parking.distance', { distance: lot.distance.toFixed(1) });
      address.appendChild(distance);
    }

    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
    `;

    const price = document.createElement('span');
    price.style.cssText = `
      color: var(--parking-color-primary);
      font-weight: 500;
    `;
    price.textContent = `¥${lot.pricePerHour}${this.t('parking.pricePerHour')}`;

    const features = document.createElement('div');
    features.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    lot.features.slice(0, 3).forEach((feature) => {
      const featureTag = document.createElement('span');
      featureTag.style.cssText = `
        padding: 2px 6px;
        background: var(--parking-color-bg-secondary);
        border-radius: 4px;
        font-size: 12px;
        color: var(--parking-color-text-secondary);
      `;
      featureTag.textContent = feature;
      features.appendChild(featureTag);
    });

    footer.appendChild(price);
    footer.appendChild(features);

    if (lot.freeMinutes) {
      const freeTime = document.createElement('span');
      freeTime.style.cssText = `
        margin-left: auto;
        color: var(--parking-color-success);
        font-size: 12px;
      `;
      freeTime.textContent = this.t('parking.freeMinutes', { minutes: lot.freeMinutes });
      footer.appendChild(freeTime);
    }

    item.appendChild(header);
    item.appendChild(address);
    item.appendChild(footer);
    container.appendChild(item);
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      indoor: '室内',
      outdoor: '室外',
      underground: '地下',
    };
    return labels[type] || type;
  }

  public setParkingLots(lots: ParkingLot[]): void {
    this.parkingLots = lots;
    this.render();
  }

  public getSelectedLot(): ParkingLot | undefined {
    return this.parkingLots.find((lot) => lot.id === this.selectedLotId);
  }

  public setSelectedLot(lotId: string): void {
    this.selectedLotId = lotId;
    this.render();
  }
}
