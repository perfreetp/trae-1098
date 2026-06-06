import type { SDKError } from '../types';
import { EventBus } from './EventBus';

export class UIStateManager {
  private eventBus: EventBus;
  private loadingCount: number = 0;
  private errorCallback?: (error: SDKError) => void;
  private loadingCallback?: (isLoading: boolean) => void;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  setErrorCallback(callback: (error: SDKError) => void): void {
    this.errorCallback = callback;
  }

  setLoadingCallback(callback: (isLoading: boolean) => void): void {
    this.loadingCallback = callback;
  }

  showError(code: string, message: string, details?: unknown): void {
    const error: SDKError = { code, message, details };
    this.eventBus.emit('error', error);

    if (this.errorCallback) {
      try {
        this.errorCallback(error);
      } catch (e) {
        console.error('Error callback failed:', e);
      }
    } else {
      this.showDefaultError(message);
    }
  }

  private showDefaultError(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'parking-sdk-toast parking-sdk-toast-error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: #ff4d4f;
      color: white;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: parkingSlideIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'parkingSlideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showLoading(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.eventBus.emit('loading:change', true);
      if (this.loadingCallback) {
        try {
          this.loadingCallback(true);
        } catch (e) {
          console.error('Loading callback failed:', e);
        }
      }
    }
  }

  hideLoading(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      if (this.loadingCount === 0) {
        this.eventBus.emit('loading:change', false);
        if (this.loadingCallback) {
          try {
            this.loadingCallback(false);
          } catch (e) {
            console.error('Loading callback failed:', e);
          }
        }
      }
    }
  }

  isLoading(): boolean {
    return this.loadingCount > 0;
  }

  showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    const colors: Record<string, string> = {
      success: '#52c41a',
      info: '#1890ff',
      warning: '#faad14',
      error: '#ff4d4f',
    };

    const toast = document.createElement('div');
    toast.className = 'parking-sdk-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${colors[type]};
      color: white;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: parkingSlideIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'parkingSlideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
