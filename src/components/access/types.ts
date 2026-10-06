import { ProcessAccessGrant } from '@/types/process';

export type AudienceTab = 'role' | 'department' | 'claim' | 'user';
export type GrantsFilter = 'all' | 'role' | 'department' | 'user' | 'claim';

export interface LookupUser {
  id: string;
  name: string;
  roleName: string;
  avatarUrl?: string;
  maskedEmail: string;
}

export interface DeptItem {
  id: string;
  name: string;
  slug: string;
}

export interface PresetRole {
  name: string;
  label: string;
  icon: string;
  desc: string;
}

export const PRESET_ROLES: PresetRole[] = [
  { name: 'مدیر مدرسه', label: 'مدیران مدارس', icon: '🏫', desc: 'کلیه مدیران مدارس دولتی و غیردولتی' },
  { name: 'معاون اجرایی', label: 'معاونین اجرایی', icon: '📋', desc: 'مسئولین ثبت‌نام، سنجش و امور اجرایی مدارس' },
  { name: 'پشتیبان فناوری', label: 'پشتیبان‌های فناوری', icon: '💻', desc: 'کارشناسان شبکه، رایانه و زیرساخت سامانه‌ها' },
  { name: 'معاون آموزشی', label: 'معاونین آموزشی', icon: '🎓', desc: 'مسئولین برنامه‌ریزی درسی و آموزشی' },
  { name: 'آموزگار', label: 'آموزگاران و دبیران', icon: '📚', desc: 'کلیه کادر تدریس و آموزش' },
];
