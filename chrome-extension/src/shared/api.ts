import type { RecordedEvent } from './types';

/** Minimal API client for the Fanavari server (token header, no cookies). */
export class FanavariApi {
  constructor(
    private serverUrl: string,
    private token: string | null,
    private userId: string | null = null,
    private permissions = 0
  ) {}

  private get base(): string {
    return this.serverUrl.replace(/\/+$/, '');
  }

  private headers(json = false): HeadersInit {
    const h: Record<string, string> = {};
    if (this.token) h['x-extension-token'] = this.token;
    if (this.userId) {
      h['x-user-id'] = this.userId;
      h['x-user-permissions'] = String(this.permissions);
    }
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  async me(): Promise<{ id: string; name: string; email: string; roleName: string; permissions: number } | null> {
    if (!this.token) return null;
    const res = await fetch(`${this.base}/api/extension/me`, { headers: this.headers() });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.user ?? null;
    if (user) {
      this.userId = user.id;
      this.permissions = Number(user.permissions) || 0;
    }
    return user;
  }

  async listProcesses(): Promise<Array<{ id: string; slug: string; title: string; steps: Array<{ id: string; title: string; orderIndex: number }> }>> {
    const res = await fetch(`${this.base}/api/processes`, { headers: this.headers() });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async sendEvents(
    processId: string,
    stepId: string,
    events: RecordedEvent[]
  ): Promise<{ appendedMenuSegments: number; appendedEvents: number }> {
    const res = await fetch(
      `${this.base}/api/processes/${encodeURIComponent(processId)}/steps/${encodeURIComponent(stepId)}/events`,
      { method: 'POST', headers: this.headers(true), body: JSON.stringify({ events }) }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Server responded ${res.status}`);
    return {
      appendedMenuSegments: Number(data.appendedMenuSegments) || 0,
      appendedEvents: Number(data.appendedEvents) || 0,
    };
  }
}
