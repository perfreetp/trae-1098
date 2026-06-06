import type { SDKConfig, Theme, Language } from '../types';
import { EventBus } from './EventBus';

export class ConfigManager {
  private config: SDKConfig;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.config = {
      apiBaseUrl: '',
      appId: '',
      theme: 'light',
      language: 'zh-CN',
      timeout: 30000,
      enableCache: true,
      cacheTTL: 300000,
    };
  }

  init(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
    this.eventBus.emit('config:changed', this.config);
  }

  getConfig(): SDKConfig {
    return { ...this.config };
  }

  set<K extends keyof SDKConfig>(key: K, value: SDKConfig[K]): void {
    this.config[key] = value;
    this.eventBus.emit('config:changed', this.config);
  }

  get<K extends keyof SDKConfig>(key: K): SDKConfig[K] {
    return this.config[key];
  }

  getTheme(): Theme {
    return this.config.theme || 'light';
  }

  setTheme(theme: Theme): void {
    this.config.theme = theme;
    this.eventBus.emit('theme:changed', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-parking-theme', theme);
  }

  getLanguage(): Language {
    return this.config.language || 'zh-CN';
  }

  setLanguage(language: Language): void {
    this.config.language = language;
    this.eventBus.emit('language:changed', language);
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  getAppId(): string {
    return this.config.appId;
  }

  getTimeout(): number {
    return this.config.timeout || 30000;
  }

  isCacheEnabled(): boolean {
    return this.config.enableCache !== false;
  }

  getCacheTTL(): number {
    return this.config.cacheTTL || 300000;
  }
}
