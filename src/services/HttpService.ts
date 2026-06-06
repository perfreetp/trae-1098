import type { SDKConfig, SDKError } from '../types';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  skipAuth?: boolean;
  cache?: boolean;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class HttpService {
  private baseUrl: string;
  private appId: string;
  private timeout: number;
  private token: string = '';
  private refreshTokenCallback?: () => Promise<string>;
  private onError?: (error: SDKError) => void;

  constructor(config: SDKConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.appId = config.appId;
    this.timeout = config.timeout || 30000;
    this.refreshTokenCallback = config.refreshToken;
    this.onError = config.onError;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  clearToken(): void {
    this.token = '';
  }

  setRefreshTokenCallback(callback: () => Promise<string>): void {
    this.refreshTokenCallback = callback;
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      skipAuth = false,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-App-Id': this.appId,
      };

      if (!skipAuth && this.token) {
        defaultHeaders['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers: { ...defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await this.refreshToken();
          if (newToken) {
            this.token = newToken;
            return this.request<T>(url, options);
          }
        }

        const errorData = await this.parseErrorResponse(response);
        const error: SDKError = {
          code: String(response.status),
          message: errorData.message || response.statusText,
          details: errorData,
        };

        if (this.onError) {
          this.onError(error);
        }

        throw error;
      }

      const result = (await response.json()) as ApiResponse<T>;

      if (result.code !== 0 && result.code !== 200) {
        const error: SDKError = {
          code: String(result.code),
          message: result.message || 'Request failed',
          details: result.data,
        };

        if (this.onError) {
          this.onError(error);
        }

        throw error;
      }

      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        const sdkError: SDKError = {
          code: 'TIMEOUT',
          message: 'Request timeout',
        };
        if (this.onError) {
          this.onError(sdkError);
        }
        throw sdkError;
      }

      throw error;
    }
  }

  private async parseErrorResponse(response: Response): Promise<{ message?: string }> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshTokenCallback) {
      try {
        return await this.refreshTokenCallback();
      } catch (error) {
        console.error('Refresh token failed:', error);
        return null;
      }
    }
    return null;
  }

  get<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  put<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  delete<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  patch<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }
}
