import type { ComponentOptions, Vehicle } from '../types';
import { BaseComponent } from './BaseComponent';
import { EventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { I18n } from '../core/I18n';

interface PlateInputData {
  plateNumber?: string;
  vehicles?: Vehicle[];
  showVehicleList?: boolean;
  showBindButton?: boolean;
  provinces?: string[];
}

const DEFAULT_PROVINCES = ['京', '津', '沪', '渝', '冀', '豫', '云', '辽', '黑', '湘', '皖', '鲁', '新', '苏', '浙', '赣', '鄂', '桂', '甘', '晋', '蒙', '陕', '吉', '闽', '贵', '粤', '青', '藏', '川', '宁', '琼'];

export class PlateInput extends BaseComponent {
  private plateNumber: string = '';
  private vehicles: Vehicle[] = [];
  private showVehicleList: boolean = true;
  private showBindButton: boolean = true;
  private provinces: string[];
  private showProvincePicker: boolean = false;
  private isValid: boolean = true;

  constructor(
    options: ComponentOptions,
    eventBus: EventBus,
    config: ConfigManager,
    i18n: I18n
  ) {
    super(options, eventBus, config, i18n);
    this.provinces = DEFAULT_PROVINCES;
    this.initData();
    this.render();
  }

  private initData(): void {
    const data = this.componentData as PlateInputData;
    this.plateNumber = data.plateNumber || '';
    this.vehicles = data.vehicles || [];
    this.showVehicleList = data.showVehicleList !== false;
    this.showBindButton = data.showBindButton !== false;
    if (data.provinces) {
      this.provinces = data.provinces;
    }
  }

  render(): void {
    if (this.isDestroyed) return;

    this.element.innerHTML = '';
    this.element.className = 'parking-sdk plate-input';

    this.renderInputSection();

    if (this.showVehicleList && this.vehicles.length > 0) {
      this.renderVehicleList();
    }
  }

  private renderInputSection(): void {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    const label = document.createElement('label');
    label.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
    `;
    label.textContent = this.t('plate.title');

    const inputRow = document.createElement('div');
    inputRow.style.cssText = `
      display: flex;
      gap: 8px;
      position: relative;
    `;

    const provinceBtn = document.createElement('button');
    provinceBtn.type = 'button';
    provinceBtn.style.cssText = `
      width: 60px;
      padding: 10px 8px;
      border: 1px solid var(--parking-color-border);
      border-radius: var(--parking-radius-md);
      background: var(--parking-color-bg-secondary);
      font-size: 16px;
      font-weight: 600;
      color: var(--parking-color-text-primary);
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    provinceBtn.textContent = this.plateNumber.charAt(0) || '京';

    provinceBtn.addEventListener('click', () => {
      this.showProvincePicker = !this.showProvincePicker;
      this.renderProvincePicker(inputRow);
    });

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      flex: 1;
      position: relative;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'parking-sdk-input';
    input.placeholder = this.t('plate.placeholder');
    input.value = this.plateNumber;
    input.maxLength = 8;
    input.style.cssText = `
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 16px;
      font-weight: 500;
      padding-left: 12px;
    `;

    input.addEventListener('input', (e) => {
      let value = (e.target as HTMLInputElement).value.toUpperCase();
      if (value.length > 0 && !this.provinces.includes(value.charAt(0))) {
        value = '京' + value;
      }
      this.plateNumber = value;
      this.isValid = this.validatePlate(value);
      this.emit('change', { plateNumber: value, valid: this.isValid });
    });

    input.addEventListener('blur', () => {
      this.isValid = this.validatePlate(this.plateNumber);
      if (!this.isValid && this.plateNumber) {
        this.emit('error', { message: this.t('plate.invalid') });
      }
    });

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.emit('confirm', { plateNumber: this.plateNumber, valid: this.isValid });
      }
    });

    inputWrapper.appendChild(input);

    if (this.showBindButton) {
      const bindBtn = document.createElement('button');
      bindBtn.type = 'button';
      bindBtn.className = 'parking-sdk-btn parking-sdk-btn-primary';
      bindBtn.style.cssText = `
        white-space: nowrap;
      `;
      bindBtn.textContent = this.t('plate.bind');
      bindBtn.addEventListener('click', () => {
        if (this.validatePlate(this.plateNumber)) {
          this.emit('bind', { plateNumber: this.plateNumber });
        }
      });
      inputRow.appendChild(bindBtn);
    }

    inputRow.insertBefore(provinceBtn, inputWrapper);
    inputRow.appendChild(inputWrapper);

    if (!this.isValid && this.plateNumber) {
      const errorTip = document.createElement('div');
      errorTip.style.cssText = `
        font-size: 12px;
        color: var(--parking-color-error);
      `;
      errorTip.textContent = this.t('plate.invalid');
      wrapper.appendChild(errorTip);
    }

    wrapper.appendChild(label);
    wrapper.appendChild(inputRow);
    this.element.appendChild(wrapper);
  }

  private renderProvincePicker(container: HTMLElement): void {
    const existingPicker = container.querySelector('.province-picker');
    if (existingPicker) {
      existingPicker.remove();
      if (!this.showProvincePicker) return;
    }

    if (!this.showProvincePicker) return;

    const picker = document.createElement('div');
    picker.className = 'province-picker';
    picker.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 100;
      margin-top: 8px;
      padding: 12px;
      background: var(--parking-color-bg-primary);
      border: 1px solid var(--parking-color-border);
      border-radius: var(--parking-radius-md);
      box-shadow: var(--parking-shadow-lg);
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      max-width: 400px;
    `;

    this.provinces.forEach((province) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        padding: 8px 4px;
        border: 1px solid var(--parking-color-border-light);
        border-radius: var(--parking-radius-sm);
        background: ${this.plateNumber.charAt(0) === province ? 'var(--parking-color-primary)' : 'var(--parking-color-bg-secondary)'};
        color: ${this.plateNumber.charAt(0) === province ? 'white' : 'var(--parking-color-text-primary)'};
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      btn.textContent = province;

      btn.addEventListener('click', () => {
        if (this.plateNumber.length > 0) {
          this.plateNumber = province + this.plateNumber.slice(1);
        } else {
          this.plateNumber = province;
        }
        this.showProvincePicker = false;
        this.emit('change', { plateNumber: this.plateNumber, valid: this.validatePlate(this.plateNumber) });
        this.render();
      });

      picker.appendChild(btn);
    });

    document.addEventListener('click', function closePicker(e: MouseEvent) {
      if (!picker.contains(e.target as Node)) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });

    container.appendChild(picker);
  }

  private renderVehicleList(): void {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      margin-top: 16px;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: var(--parking-color-text-primary);
      margin-bottom: 12px;
    `;
    title.textContent = '我的车辆';

    const list = document.createElement('div');
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    this.vehicles.forEach((vehicle) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid var(--parking-color-border-light);
        border-radius: var(--parking-radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
      `;

      item.addEventListener('mouseenter', () => {
        item.style.borderColor = 'var(--parking-color-primary)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.borderColor = 'var(--parking-color-border-light)';
      });

      item.addEventListener('click', () => {
        this.plateNumber = vehicle.plateNumber;
        this.emit('select', vehicle);
        this.render();
      });

      const plateInfo = document.createElement('div');
      plateInfo.style.cssText = `
        flex: 1;
      `;

      const plateText = document.createElement('div');
      plateText.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        color: var(--parking-color-text-primary);
        letter-spacing: 2px;
      `;
      plateText.textContent = vehicle.plateNumber;

      const typeText = document.createElement('div');
      typeText.style.cssText = `
        font-size: 12px;
        color: var(--parking-color-text-secondary);
        margin-top: 2px;
      `;
      typeText.textContent = vehicle.type;

      plateInfo.appendChild(plateText);
      plateInfo.appendChild(typeText);

      if (vehicle.isDefault) {
        const defaultTag = document.createElement('span');
        defaultTag.className = 'parking-sdk-tag parking-sdk-tag-primary';
        defaultTag.textContent = '默认';
        item.appendChild(defaultTag);
      }

      item.appendChild(plateInfo);
      list.appendChild(item);
    });

    wrapper.appendChild(title);
    wrapper.appendChild(list);
    this.element.appendChild(wrapper);
  }

  private validatePlate(plate: string): boolean {
    if (!plate || plate.length < 7) return false;
    const pattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-Z][A-Z0-9]{5,6}$/;
    return pattern.test(plate);
  }

  public getPlateNumber(): string {
    return this.plateNumber;
  }

  public setPlateNumber(plate: string): void {
    this.plateNumber = plate.toUpperCase();
    this.isValid = this.validatePlate(this.plateNumber);
    this.render();
  }

  public setVehicles(vehicles: Vehicle[]): void {
    this.vehicles = vehicles;
    this.render();
  }

  public isValidPlate(): boolean {
    return this.validatePlate(this.plateNumber);
  }
}
