/**
 * Discord-style Bitwise (Bitfield) Permission System for Fanavari.
 * Each permission is represented as a single bit flag.
 * Super Admin possesses the ADMINISTRATOR bit (1 << 30) which bypasses all permission checks.
 */

export const Permissions = {
  NONE: 0,
  VIEW_PROCESSES: 1 << 0,       // 1: Can search and view process walkthroughs
  CREATE_PROCESSES: 1 << 1,     // 2: Can register new processes
  EDIT_PROCESSES: 1 << 2,       // 4: Can edit existing process details and metadata
  DELETE_PROCESSES: 1 << 3,     // 8: Can delete processes
  MANAGE_STEPS: 1 << 4,         // 16: Can add/edit/reorder steps, copyable fields, and tips
  MANAGE_ERRORS: 1 << 5,        // 32: Can add/edit/remove error guides and solutions
  MANAGE_CATEGORIES: 1 << 6,    // 64: Can manage department and workflow categories
  MANAGE_SYSTEMS: 1 << 7,       // 128: Can register and edit software and portals
  MANAGE_USERS: 1 << 8,         // 256: Can manage users and assign permission bitfields
  VIEW_AUDIT_LOGS: 1 << 9,      // 512: Can view audit logs and execution metrics
  MANAGE_INFORMATION: 1 << 10,  // 1024: Can manage announcements, circulars, and guides
  ADMINISTRATOR: 1 << 30,       // 1073741824: Super Admin - all permissions granted unconditionally
} as const;

export type PermissionKey = keyof typeof Permissions;

export const PERMISSION_LABELS: Record<PermissionKey, { fa: string; en: string; description: string }> = {
  NONE: { fa: 'بدون دسترسی', en: 'None', description: 'No permissions granted' },
  VIEW_PROCESSES: { fa: 'مشاهده فرایندها', en: 'View Processes', description: 'Search and read step guides' },
  CREATE_PROCESSES: { fa: 'ثبت فرایند جدید', en: 'Create Processes', description: 'Create and register new SOPs' },
  EDIT_PROCESSES: { fa: 'ویرایش فرایندها', en: 'Edit Processes', description: 'Modify process metadata and instructions' },
  DELETE_PROCESSES: { fa: 'حذف فرایندها', en: 'Delete Processes', description: 'Remove procedures from the catalog' },
  MANAGE_STEPS: { fa: 'مدیریت مراحل و گام‌ها', en: 'Manage Steps', description: 'Add, reorder, and configure steps' },
  MANAGE_ERRORS: { fa: 'مدیریت کدهای خطا', en: 'Manage Errors', description: 'Author troubleshooting guides and root causes' },
  MANAGE_CATEGORIES: { fa: 'مدیریت دسته‌بندی‌ها', en: 'Manage Categories', description: 'Create and edit departments' },
  MANAGE_SYSTEMS: { fa: 'مدیریت نرم‌افزارها و پرتال‌ها', en: 'Manage Systems', description: 'Add and configure software tools' },
  MANAGE_USERS: { fa: 'مدیریت کاربران و دسترسی‌ها', en: 'Manage Users', description: 'Create users and adjust permission bits' },
  VIEW_AUDIT_LOGS: { fa: 'مشاهده لاگ‌های امنیتی', en: 'View Audit Logs', description: 'Access audit trails and run histories' },
  MANAGE_INFORMATION: { fa: 'مدیریت بخش اطلاعات و اطلاعیه‌ها', en: 'Manage Information', description: 'Create and publish announcements, circulars, and guides' },
  ADMINISTRATOR: { fa: 'مدیر کل (Super Admin)', en: 'Administrator', description: 'Full bypass of all permission restrictions' },
};

/**
 * Checks if a bitfield has a specific permission bit enabled.
 * If the user has ADMINISTRATOR bit, this always evaluates to true.
 */
export function hasPermission(userBitfield: number, requiredPermission: number): boolean {
  if ((userBitfield & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
    return true;
  }
  return (userBitfield & requiredPermission) === requiredPermission;
}

/**
 * Adds a permission bit to an existing bitfield
 */
export function addPermission(bitfield: number, permission: number): number {
  return bitfield | permission;
}

/**
 * Removes a permission bit from an existing bitfield
 */
export function removePermission(bitfield: number, permission: number): number {
  return bitfield & ~permission;
}

/**
 * Extracts a list of active permission keys from a bitfield
 */
export function getActivePermissions(bitfield: number): PermissionKey[] {
  const active: PermissionKey[] = [];
  for (const [key, value] of Object.entries(Permissions)) {
    if (key === 'NONE') continue;
    if ((bitfield & value) === value) {
      active.push(key as PermissionKey);
    }
  }
  return active;
}

/**
 * Standard Role Presets using bit combinations
 */
export const ROLE_PRESETS = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    nameFa: 'مدیر ارشد سامانه',
    bitfield: Permissions.ADMINISTRATOR | 0x3fffffff,
    color: 'rose',
  },
  PROCESS_MANAGER: {
    name: 'Process Manager',
    nameFa: 'مدیر فرایندها',
    bitfield:
      Permissions.VIEW_PROCESSES |
      Permissions.CREATE_PROCESSES |
      Permissions.EDIT_PROCESSES |
      Permissions.DELETE_PROCESSES |
      Permissions.MANAGE_STEPS |
      Permissions.MANAGE_ERRORS |
      Permissions.MANAGE_CATEGORIES |
      Permissions.MANAGE_SYSTEMS |
      Permissions.MANAGE_INFORMATION,
    color: 'amber',
  },
  PROCESS_EDITOR: {
    name: 'Editor',
    nameFa: 'تدوین‌گر فرایند',
    bitfield:
      Permissions.VIEW_PROCESSES |
      Permissions.CREATE_PROCESSES |
      Permissions.EDIT_PROCESSES |
      Permissions.MANAGE_STEPS |
      Permissions.MANAGE_ERRORS,
    color: 'blue',
  },
  EMPLOYEE_VIEWER: {
    name: 'Viewer',
    nameFa: 'کاربر عادی / مشاهده‌کننده',
    bitfield: Permissions.VIEW_PROCESSES,
    color: 'emerald',
  },
} as const;
