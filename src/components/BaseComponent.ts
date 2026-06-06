import type { ComponentOptions, Theme, Language } from '../types';
import { EventBus } from '../core/EventBus';
import { I18n } from '../core/I18n';
import { ConfigManager } from '../core/ConfigManager';

export abstract class BaseComponent {
  protected container: HTMLElement;
  protected element: HTMLElement;
  protected eventBus: EventBus;
  protected config: ConfigManager;
  protected i18n: I18n;
  protected componentData: Record<string, unknown>;
  protected onEvent?: (event: string, data?: unknown) => void;
  protected isDestroyed: boolean = false;

  constructor(options: ComponentOptions, eventBus: EventBus, config: ConfigManager, i18n: I18n) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container) as HTMLElement
      : options.container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    this.eventBus = eventBus;
    this.config = config;
    this.i18n = i18n;
    this.componentData = options.data || {};
    this.onEvent = options.onEvent;

    this.element = document.createElement('div');
    this.element.className = 'parking-sdk';
    this.container.appendChild(this.element);

    this.bindGlobalEvents();
  }

  protected bindGlobalEvents(): void {
    this.eventBus.on('theme:changed', (theme) => {
      this.onThemeChange(theme as Theme);
    });

    this.eventBus.on('language:changed', (language) => {
      this.onLanguageChange(language as Language);
    });
  }

  protected emit(event: string, data?: unknown): void {
    if (this.onEvent) {
      this.onEvent(event, data);
    }
    this.eventBus.emit(`component:${event}`, data);
  }

  protected t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }

  protected getTheme(): Theme {
    return this.config.getTheme();
  }

  protected getLanguage(): Language {
    return this.config.getLanguage();
  }

  protected abstract render(): void;

  protected onThemeChange(_theme: Theme): void {
    this.render();
  }

  protected onLanguageChange(_language: Language): void {
    this.render();
  }

  public setData(data: Record<string, unknown>): void {
    this.componentData = { ...this.componentData, ...data };
    this.render();
  }

  public getData(): Record<string, unknown> {
    return { ...this.componentData };
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
