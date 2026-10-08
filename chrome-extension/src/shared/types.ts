export type RecordedEventType = 'click' | 'input' | 'navigation';

export interface RecordedEvent {
  type: RecordedEventType;
  /** Clicked element text or input field label (never a password value). */
  label: string;
  /** Typed value — only present when the author explicitly approved values. */
  value?: string;
  /** Element tag, e.g. button, input, a. */
  tag?: string;
  /** Page origin + path where the event happened (no query string). */
  page?: string;
  /** Unix ms timestamp. */
  at: number;
}

export interface ExtSettings {
  serverUrl: string;
  token: string | null;
  userName: string | null;
  /** When true, typed values are recorded (labels are always recorded). */
  captureValues: boolean;
}

export interface SessionBuffer {
  events: RecordedEvent[];
  recordingTabId: number | null;
  startedAt: number | null;
  /** Honored by freshly injected recorders after a page load. */
  captureValues: boolean;
}

export type PanelMessage =
  | { type: 'RECORDER_EVENT'; event: RecordedEvent }
  | { type: 'RELAY_TOKEN'; token: string }
  | { type: 'RECORDING_STATE'; recording: boolean; tabId: number | null };

export type TabMessage =
  | { type: 'START_RECORDING'; captureValues: boolean }
  | { type: 'STOP_RECORDING' };
