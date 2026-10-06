export type StepType = 'action' | 'decision' | 'warning' | 'end' | 'subprocess';

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
  subProcessId?: string | null;
  subProcessSlug?: string | null;
  subProcessTitle?: string | null;
  subProcessStepCount?: number | null;
  subProcess?: {
    id: string;
    slug: string;
    title: string;
    totalSteps: number;
    departmentName?: string;
    targetSystem?: string;
  } | null;
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

export type PersianMonth = 
  | 'فروردین'
  | 'اردیبهشت'
  | 'خرداد'
  | 'تیر'
  | 'مرداد'
  | 'شهریور'
  | 'مهر'
  | 'آبان'
  | 'آذر'
  | 'دی'
  | 'بهمن'
  | 'اسفند';

export type PersianSeason = 'بهار' | 'تابستان' | 'پاییز' | 'زمستان';

export interface ProcessSchedule {
  month: PersianMonth;
  season?: PersianSeason;
  startDay?: number;
  endDay?: number;
  timeframeLabel: string; // e.g. "از ۱ تیر الی ۲۰ تیر"
  deadlineDays?: number; // e.g. 20
  recurrence?: 'annual' | 'quarterly' | 'monthly' | 'custom';
  isMandatory?: boolean;
  notes?: string;
}

export interface ProcessScopeEntity {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
  categories?: ProcessCategoryEntity[];
  processCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProcessCategoryEntity {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
  scopeId?: string | null;
  scopeKey?: string | null;
  scopeName?: string | null;
  scope?: {
    id: string;
    key: string;
    name: string;
  } | null;
  processCount?: number;
  isGlobal?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type ProcessVisibility = 'public' | 'restricted';

export type AccessGrantType = 'user' | 'department' | 'role' | 'claim';

export interface ProcessAccessGrant {
  id: string;
  processId: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    roleName: string;
    avatarUrl?: string | null;
  };
  departmentId?: string | null;
  departmentName?: string | null;
  department?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  roleName?: string | null;
  claimToken?: string | null;
  claimExpiresAt?: string | Date | null;
  permission: 'view' | 'edit';
  grantedById?: string | null;
  createdAt: string | Date;
}

export interface Process {
  id: string;
  slug: string;
  title: string;
  description: string;
  scope: string; // 'organization' | 'software' | 'portal' or any dynamic scope key
  category: string; // 'hr' | 'finance' | etc. or any dynamic category key
  visibility?: ProcessVisibility; // 'public' | 'restricted'
  authorId?: string | null;
  accessGrants?: ProcessAccessGrant[];
  departmentName: string;
  departmentSlug?: string;
  estimatedMinutes: number;
  targetSystem: string;
  targetSystemSlug: string;
  targetUrl?: string;
  isPopular?: boolean;
  totalSteps: number;
  tags: string[];
  schedule?: ProcessSchedule;
  steps: ProcessStep[];
  updatedAt: string;
  workflowRuns?: WorkflowRun[];
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

export interface InformationAccessGrant {
  id: string;
  postId: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    roleName: string;
    avatarUrl?: string | null;
  };
  departmentId?: string | null;
  departmentName?: string | null;
  department?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  roleName?: string | null;
  claimToken?: string | null;
  claimExpiresAt?: string | Date | null;
  permission: 'view' | 'edit';
  grantedById?: string | null;
  createdAt: string | Date;
}

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
  visibility?: ProcessVisibility;
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
  accessGrants?: InformationAccessGrant[];
}

export type WorkflowRunStatus = 'in_progress' | 'completed' | 'paused' | 'flagged';
export type SupervisorApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type WorkflowStepLogStatus = 'completed' | 'skipped' | 'blocked';

export interface WorkflowStepLog {
  id: string;
  runId: string;
  stepId?: string | null;
  stepKey: string;
  stepOrder: number;
  stepTitle: string;
  status: WorkflowStepLogStatus;
  startedAt?: string | Date | null;
  completedAt: string | Date;
  durationSeconds?: number | null;
  operatorNotes?: string | null;
  isCheckpoint: boolean;
  supervisorSignOff: boolean;
  supervisorSignedBy?: string | null;
  supervisorSignedAt?: string | Date | null;
  createdAt: string | Date;
}

export interface WorkflowRun {
  id: string;
  processId: string;
  process?: {
    id: string;
    title: string;
    slug: string;
    systemTool?: {
      name: string;
    } | null;
  };
  runNumber: number;
  title: string;
  status: WorkflowRunStatus;
  operatorId?: string | null;
  operatorName: string;
  operatorRole?: string | null;
  startedAt: string | Date;
  completedAt?: string | Date | null;
  totalDurationSeconds?: number | null;
  completedStepsCount: number;
  totalStepsCount: number;
  notes?: string | null;
  supervisorId?: string | null;
  supervisorName?: string | null;
  supervisorApprovalStatus: SupervisorApprovalStatus;
  supervisorApprovedAt?: string | Date | null;
  supervisorNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  stepLogs?: WorkflowStepLog[];
}

