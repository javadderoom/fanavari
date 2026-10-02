export type StepType = 'action' | 'decision' | 'warning' | 'end';

export interface Hotspot {
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  title: string;
  note: string;
}

export interface CopyableField {
  label: string;
  value: string;
  description?: string;
}

export interface ErrorGuideItem {
  id: string;
  errorCode: string;
  errorTitle: string;
  cause: string;
  solution: string;
  escalationContact?: string;
  screenshotUrl?: string;
}

export interface ProcessStep {
  id: string;
  orderIndex: number;
  stepKey: string;
  title: string;
  contentMarkdown: string;
  stepType: StepType;
  targetMenuPath?: string;
  imageUrl?: string;
  hotspots?: Hotspot[];
  copyableFields?: CopyableField[];
  tips?: string[];
  errorGuides?: ErrorGuideItem[];
}

export interface Process {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'hr' | 'finance' | 'it' | 'legal' | 'support';
  departmentName: string;
  estimatedMinutes: number;
  targetSystem: string;
  targetUrl?: string;
  isPopular?: boolean;
  totalSteps: number;
  tags: string[];
  steps: ProcessStep[];
  updatedAt: string;
}

export type MatchLocationType = 'overview' | 'title' | 'step' | 'error' | 'field' | 'system' | 'description' | 'tag';

export interface SearchMatchDetail {
  type: MatchLocationType;
  locationLabel: string;
  snippet: string;
  matchedText: string;
  stepIndex?: number;
}

export interface SearchResult {
  process: Process;
  score: number;
  bestMatch: SearchMatchDetail;
  allMatchesCount: number;
}
