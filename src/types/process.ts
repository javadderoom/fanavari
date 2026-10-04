export type StepType = 'action' | 'decision' | 'warning' | 'end';

export type WorkflowScope = 'organization' | 'software' | 'portal';

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

export interface SystemTool {
  id?: string;
  slug: string;
  name: string;
  category: 'software' | 'erp' | 'portal' | 'devtools';
  icon: string;
  description: string;
  websiteUrl?: string;
  processCount: number;
  createdAt?: string | Date;
}

export interface OrganizationEntity {
  id?: string;
  slug: string;
  name: string;
  icon?: string;
  category: 'gov' | 'enterprise' | 'tech';
  description: string;
  processCount: number;
}

export interface Process {
  id: string;
  slug: string;
  title: string;
  description: string;
  scope: WorkflowScope; // 'organization' | 'software' | 'portal'
  category: 'hr' | 'finance' | 'it' | 'legal' | 'support' | 'software' | 'design';
  departmentName: string;
  departmentSlug?: string;
  estimatedMinutes: number;
  targetSystem: string;
  targetSystemSlug: string;
  targetUrl?: string;
  isPopular?: boolean;
  totalSteps: number;
  tags: string[];
  steps: ProcessStep[];
  updatedAt: string;
}

export type MatchLocationType = 
  | 'overview' 
  | 'title' 
  | 'step' 
  | 'error' 
  | 'field' 
  | 'system' 
  | 'description' 
  | 'tag'
  | 'announcement'
  | 'circular'
  | 'tip';

export interface SearchMatchDetail {
  type: MatchLocationType;
  locationLabel: string;
  snippet: string;
  matchedText: string;
  stepIndex?: number;
}

export interface SearchResult {
  itemType?: 'process' | 'information';
  process?: Process;
  post?: InformationPost;
  score: number;
  bestMatch: SearchMatchDetail;
  allMatchesCount: number;
}

export type InformationType = 'announcement' | 'circular' | 'guide' | 'article';
export type InformationPriority = 'urgent' | 'high' | 'normal';

export interface InformationPost {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  type: InformationType;
  priority: InformationPriority;
  isPinned: boolean;
  isPublished?: boolean;
  departmentId?: string | null;
  departmentName?: string | null;
  departmentSlug?: string | null;
  systemToolId?: string | null;
  systemToolName?: string | null;
  systemToolSlug?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  targetUrl?: string | null;
  publishedAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
