export interface ProcessCategoryConfig {
  key: string;
  label: string;
  icon: string;
}

/**
 * UI Category metadata (label, icon).
 * All entity records (processes, departments, tools) are fetched dynamically from the database.
 */
export const CATEGORIES: readonly ProcessCategoryConfig[] = [
  { key: 'all', label: 'همه فرایندها', icon: 'Layers' },
  { key: 'software', label: 'نرم‌افزارها و ابزارها', icon: 'Laptop' },
  { key: 'hr', label: 'آموزش و منابع انسانی', icon: 'Users' },
  { key: 'finance', label: 'مالی و اداری', icon: 'Coins' },
  { key: 'it', label: 'زیرساخت و سامانه‌ها', icon: 'Server' },
  { key: 'legal', label: 'احکام و امور حقوقی', icon: 'ShieldCheck' },
] as const;
