import type { TrackEvent } from '../types';

export class Tracker {
  private trackCallback?: (event: string, data?: Record<string, unknown>) => void;
  private eventQueue: TrackEvent[] = [];
  private isTrackingEnabled: boolean = true;

  setTrackCallback(callback: (event: string, data?: Record<string, unknown>) => void): void {
    this.trackCallback = callback;
    this.flushQueue();
  }

  setEnabled(enabled: boolean): void {
    this.isTrackingEnabled = enabled;
  }

  track(event: string, data?: Record<string, unknown>): void {
    if (!this.isTrackingEnabled) return;

    const trackEvent: TrackEvent = {
      name: event,
      data,
      timestamp: Date.now(),
    };

    if (this.trackCallback) {
      try {
        this.trackCallback(event, data);
      } catch (error) {
        console.error('Track event callback error:', error);
      }
    } else {
      this.eventQueue.push(trackEvent);
      if (this.eventQueue.length > 100) {
        this.eventQueue.shift();
      }
    }
  }

  private flushQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      if (this.trackCallback) {
        try {
          this.trackCallback(event.name, event.data);
        } catch (error) {
          console.error('Track event callback error:', error);
        }
      }
    }
  }

  clearQueue(): void {
    this.eventQueue = [];
  }

  getQueue(): TrackEvent[] {
    return [...this.eventQueue];
  }
}
