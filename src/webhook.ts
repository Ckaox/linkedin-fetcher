import axios from 'axios';
import { WebhookSubscription, WebhookPayload, WebhookEvent } from './types';

export class WebhookManager {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private maxRetries: number;
  private timeout: number;

  constructor(maxRetries: number = 3, timeout: number = 10000) {
    this.maxRetries = maxRetries;
    this.timeout = timeout;
  }

  subscribe(url: string, events: WebhookEvent[]): void {
    const subscription: WebhookSubscription = {
      url,
      events,
      createdAt: new Date().toISOString(),
    };

    this.subscriptions.set(url, subscription);
    console.log(`✅ Webhook subscribed: ${url}`);
  }

  unsubscribe(url: string): boolean {
    const deleted = this.subscriptions.delete(url);
    if (deleted) {
      console.log(`🗑️ Webhook unsubscribed: ${url}`);
    }
    return deleted;
  }

  getSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  async notify(event: WebhookEvent, data: any): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const subscriptionsToNotify = Array.from(this.subscriptions.values())
      .filter(sub => sub.events.includes(event));

    if (subscriptionsToNotify.length === 0) {
      console.log(`ℹ️ No subscribers for event: ${event}`);
      return;
    }

    console.log(`📣 Notifying ${subscriptionsToNotify.length} webhooks for event: ${event}`);

    const notificationPromises = subscriptionsToNotify.map(sub =>
      this.sendWebhook(sub.url, payload)
    );

    await Promise.allSettled(notificationPromises);
  }

  private async sendWebhook(url: string, payload: WebhookPayload, retries: number = 0): Promise<void> {
    try {
      const response = await axios.post(url, payload, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LinkedIn-Clay-Integration/1.0',
        },
      });

      console.log(`✅ Webhook delivered to ${url} - Status: ${response.status}`);
    } catch (error: any) {
      console.error(`❌ Webhook delivery failed to ${url}:`, error.message);

      // Retry logic
      if (retries < this.maxRetries) {
        console.log(`🔄 Retrying webhook (${retries + 1}/${this.maxRetries})...`);
        await this.delay(1000 * (retries + 1)); // Exponential backoff
        await this.sendWebhook(url, payload, retries + 1);
      } else {
        console.error(`❌ Webhook failed after ${this.maxRetries} retries: ${url}`);
        // Optionally: Remove failed subscription
        // this.unsubscribe(url);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
