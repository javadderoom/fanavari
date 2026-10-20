import { ProcessVisibility, PersianMonth, PersianSeason } from '@/types/process';

export const PROCESS_MEMORY_STORAGE_KEY = 'farayandnama_last_process_choices';

export interface LastProcessChoices {
  departmentName: string;
  targetSystem: string;
  targetUrl?: string;
  scope: string;
  category: string;
  visibility: ProcessVisibility;
  tagsInput?: string;
  scheduleMonth?: PersianMonth;
  scheduleSeason?: PersianSeason;
  updatedAt: number;
}

export const DEFAULT_PROCESS_CHOICES: Omit<LastProcessChoices, 'updatedAt'> = {
  departmentName: 'مدیریت منابع انسانی',
  targetSystem: 'سامانه جامع اداری',
  targetUrl: '',
  scope: 'organization',
  category: 'hr',
  visibility: 'public',
  tagsInput: 'فرایند جدید، استاندارد سازمانی',
  scheduleMonth: 'تیر',
  scheduleSeason: 'تابستان',
};

/**
 * Retrieves the last chosen process metadata from browser localStorage.
 * Returns null if not found or if running in a non-browser environment.
 */
export function getLastProcessChoices(): LastProcessChoices | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PROCESS_MEMORY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      departmentName: typeof parsed.departmentName === 'string' ? parsed.departmentName : DEFAULT_PROCESS_CHOICES.departmentName,
      targetSystem: typeof parsed.targetSystem === 'string' ? parsed.targetSystem : DEFAULT_PROCESS_CHOICES.targetSystem,
      targetUrl: typeof parsed.targetUrl === 'string' ? parsed.targetUrl : '',
      scope: typeof parsed.scope === 'string' ? parsed.scope : DEFAULT_PROCESS_CHOICES.scope,
      category: typeof parsed.category === 'string' ? parsed.category : DEFAULT_PROCESS_CHOICES.category,
      visibility: (parsed.visibility === 'restricted' ? 'restricted' : 'public') as ProcessVisibility,
      tagsInput: typeof parsed.tagsInput === 'string' ? parsed.tagsInput : DEFAULT_PROCESS_CHOICES.tagsInput,
      scheduleMonth: parsed.scheduleMonth || DEFAULT_PROCESS_CHOICES.scheduleMonth,
      scheduleSeason: parsed.scheduleSeason || DEFAULT_PROCESS_CHOICES.scheduleSeason,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch (err) {
    console.warn('Failed to read last process choices from localStorage:', err);
    return null;
  }
}

/**
 * Persists the specified metadata choices into browser localStorage.
 */
export function saveLastProcessChoices(
  choices: Partial<Omit<LastProcessChoices, 'updatedAt'>>
): LastProcessChoices | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = getLastProcessChoices() || DEFAULT_PROCESS_CHOICES;
    const payload: LastProcessChoices = {
      departmentName: choices.departmentName ?? existing.departmentName,
      targetSystem: choices.targetSystem ?? existing.targetSystem,
      targetUrl: choices.targetUrl ?? existing.targetUrl ?? '',
      scope: choices.scope ?? existing.scope,
      category: choices.category ?? existing.category,
      visibility: choices.visibility ?? existing.visibility,
      tagsInput: choices.tagsInput ?? existing.tagsInput ?? '',
      scheduleMonth: choices.scheduleMonth ?? existing.scheduleMonth,
      scheduleSeason: choices.scheduleSeason ?? existing.scheduleSeason,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(PROCESS_MEMORY_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.warn('Failed to save last process choices to localStorage:', err);
    return null;
  }
}

/**
 * Clears the stored process choices from localStorage.
 */
export function clearLastProcessChoices(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(PROCESS_MEMORY_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear last process choices from localStorage:', err);
  }
}
