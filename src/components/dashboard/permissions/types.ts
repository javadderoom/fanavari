import { Process, InformationPost, ProcessAccessGrant, InformationAccessGrant } from '@/types/process';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';

export type SimulatorTab = 'simulator' | 'matrix' | 'bitfield';
export type CatalogItemType = 'all' | 'process' | 'information';
export type FilterAccessStatus = 'all' | 'accessible' | 'restricted';

export interface SimulatedPersona {
  id: string;
  name: string;
  roleName: string;
  departmentId?: string | null;
  departmentName?: string;
  email?: string;
  permissions: number;
  claimToken?: string;
  isCustom?: boolean;
}

export const SIMULATION_PERSONAS: SimulatedPersona[] = [
  {
    id: 'usr-admin',
    name: 'مهندس سهرابی (مدیر ارشد سامانه)',
    roleName: 'مدیر ارشد سامانه',
    departmentId: 'dept-it',
    departmentName: 'ستاد مرکزی فناوری',
    email: 'admin@fanavari.local',
    permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
  },
  {
    id: 'usr-principal',
    name: 'سید مرتضی حسینی (مدیر مدرسه)',
    roleName: 'مدیر مدرسه',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    email: 'principal@school.local',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
  },
  {
    id: 'usr-deputy',
    name: 'مریم صادقی (معاون اجرایی)',
    roleName: 'معاون اجرایی',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    email: 'deputy@school.local',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
  },
  {
    id: 'usr-tech-support',
    name: 'علیرضا راد (پشتیبان فناوری)',
    roleName: 'پشتیبان فناوری',
    departmentId: 'dept-it',
    departmentName: 'اداره فناوری و آمار',
    email: 'it-support@fanavari.local',
    permissions: ROLE_PRESETS.PROCESS_EDITOR.bitfield,
  },
  {
    id: 'usr-teacher',
    name: 'احمد محمدی (آموزگار / کادر آموزشی)',
    roleName: 'آموزگار',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    email: 'teacher@school.local',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
  },
  {
    id: 'usr-guest',
    name: 'کاربر مهمان (بدون لاگین / دسترسی آزاد)',
    roleName: 'مهمان / عموم',
    departmentId: null,
    departmentName: 'بدون وابستگی سازمانی',
    email: 'guest@public.web',
    permissions: Permissions.VIEW_PROCESSES,
  },
];

export type AccessLevel = 'NONE' | 'VIEW' | 'OPERATOR' | 'MANAGER' | 'ADMIN';

export type AccessReasonCode =
  | 'PUBLIC'
  | 'SUPER_ADMIN'
  | 'AUTHOR'
  | 'USER_MATCH'
  | 'ROLE_MATCH'
  | 'DEPT_MATCH'
  | 'TOKEN_MATCH'
  | 'RESTRICTED_LOCKED';

export interface AccessEvaluation {
  isAccessible: boolean;
  level: AccessLevel;
  reasonCode: AccessReasonCode;
  reasonLabel: string;
  matchedDetails?: string;
}

export function evaluateItemAccess(
  item: {
    visibility?: string;
    authorId?: string | null;
    accessGrants?: (ProcessAccessGrant | InformationAccessGrant)[];
  },
  persona: SimulatedPersona
): AccessEvaluation {
  const isPublic = !item.visibility || item.visibility === 'public';
  if (isPublic) {
    return {
      isAccessible: true,
      level: 'VIEW',
      reasonCode: 'PUBLIC',
      reasonLabel: 'دسترسی عمومی و آزاد',
      matchedDetails: 'این سند برای کلیه کاربران و عموم در دسترس است',
    };
  }

  // Super Admin bypass
  const isSuperAdmin = hasPermission(persona.permissions, Permissions.ADMINISTRATOR);
  if (isSuperAdmin) {
    return {
      isAccessible: true,
      level: 'ADMIN',
      reasonCode: 'SUPER_ADMIN',
      reasonLabel: 'مجوز نامحدود مدیر ارشد',
      matchedDetails: 'کلید ریشه (0x40000000) تمام محدودیت‌ها را لغو می‌کند',
    };
  }

  // Author match
  if (persona.id && item.authorId && persona.id === item.authorId) {
    return {
      isAccessible: true,
      level: 'MANAGER',
      reasonCode: 'AUTHOR',
      reasonLabel: 'ایجادکننده / نگارنده اثر',
      matchedDetails: 'به عنوان نویسنده، دسترسی کامل مدیریتی دارید',
    };
  }

  const grants = item.accessGrants || [];

  // Direct User ID match
  const userGrant = grants.find((g) => g.userId && g.userId === persona.id);
  if (userGrant) {
    const isEdit = userGrant.permission === 'edit';
    return {
      isAccessible: true,
      level: isEdit ? 'MANAGER' : 'VIEW',
      reasonCode: 'USER_MATCH',
      reasonLabel: 'تخصیص اختصاصی کاربر',
      matchedDetails: `مجوز فردی مستقیم با سطح ${isEdit ? 'ویرایش و مدیریت' : 'مشاهده'}`,
    };
  }

  // Department match
  if (persona.departmentId) {
    const deptGrant = grants.find((g) => g.departmentId && g.departmentId === persona.departmentId);
    if (deptGrant) {
      const isEdit = deptGrant.permission === 'edit';
      return {
        isAccessible: true,
        level: isEdit ? 'OPERATOR' : 'VIEW',
        reasonCode: 'DEPT_MATCH',
        reasonLabel: `مجوز دپارتمان (${deptGrant.department?.name || persona.departmentName || 'سازمان مرتبط'})`,
        matchedDetails: `عضویت در ساختار دپارتمان مربوطه با سطح دسترسی ${isEdit ? 'عملیاتی' : 'مشاهده'}`,
      };
    }
  }

  // Role match
  if (persona.roleName) {
    const roleGrant = grants.find((g) => g.roleName && g.roleName === persona.roleName);
    if (roleGrant) {
      const isEdit = roleGrant.permission === 'edit';
      return {
        isAccessible: true,
        level: isEdit ? 'OPERATOR' : 'VIEW',
        reasonCode: 'ROLE_MATCH',
        reasonLabel: `مجوز سمت سازمانی (${roleGrant.roleName})`,
        matchedDetails: `دارای سمت سازمانی منطبق با سطح ${isEdit ? 'عملیاتی' : 'مشاهده'}`,
      };
    }
  }

  // Claim Token match
  if (persona.claimToken && persona.claimToken.trim()) {
    const tokenGrant = grants.find((g) => g.claimToken && g.claimToken === persona.claimToken?.trim());
    if (tokenGrant) {
      const isEdit = tokenGrant.permission === 'edit';
      return {
        isAccessible: true,
        level: isEdit ? 'OPERATOR' : 'VIEW',
        reasonCode: 'TOKEN_MATCH',
        reasonLabel: 'اعتبارسنجی لینک هوشمند',
        matchedDetails: `توکن معتبر و فعال با سطح دسترسی ${isEdit ? 'عملیاتی' : 'مشاهده'}`,
      };
    }
  }

  // Default: Locked under Zero-Leak Policy
  return {
    isAccessible: false,
    level: 'NONE',
    reasonCode: 'RESTRICTED_LOCKED',
    reasonLabel: 'مسدود و عدم دسترسی (Zero-Leak)',
    matchedDetails: 'این سند در کاتالوگ و نتایج جستجوی این کاربر پنهان است',
  };
}
