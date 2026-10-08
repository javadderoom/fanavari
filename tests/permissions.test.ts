import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Permissions,
  hasPermission,
  addPermission,
  removePermission,
  getActivePermissions,
  canAccessDashboard,
  ROLE_PRESETS,
  PERMISSION_LABELS,
  PermissionKey,
} from '../src/lib/permissions';

describe('Permissions Bitwise System', () => {
  describe('Bit flags constants', () => {
    it('should define distinct power-of-2 bit flags', () => {
      const keys = Object.keys(Permissions) as PermissionKey[];
      const values = keys
        .filter((k) => k !== 'NONE')
        .map((k) => Permissions[k]);

      // Ensure every value is a power of 2
      for (const val of values) {
        assert.ok((val & (val - 1)) === 0, `Bit value ${val} should be a power of two`);
        assert.ok(val > 0, `Bit value ${val} should be greater than zero`);
      }

      // Ensure uniqueness
      const uniqueValues = new Set(values);
      assert.equal(uniqueValues.size, values.length, 'All bit values should be unique');
    });

    it('should assign ADMINISTRATOR to bit 30', () => {
      assert.equal(Permissions.ADMINISTRATOR, 1 << 30);
    });

    it('should assign NONE to 0', () => {
      assert.equal(Permissions.NONE, 0);
    });
  });

  describe('hasPermission', () => {
    it('should grant access when user has the specific required bit', () => {
      const userBits = Permissions.VIEW_PROCESSES | Permissions.EDIT_PROCESSES;
      assert.equal(hasPermission(userBits, Permissions.VIEW_PROCESSES), true);
      assert.equal(hasPermission(userBits, Permissions.EDIT_PROCESSES), true);
    });

    it('should deny access when user lacks the required bit', () => {
      const userBits = Permissions.VIEW_PROCESSES;
      assert.equal(hasPermission(userBits, Permissions.DELETE_PROCESSES), false);
      assert.equal(hasPermission(userBits, Permissions.MANAGE_USERS), false);
    });

    it('should always return true for ADMINISTRATOR bit (Super Admin bypass)', () => {
      const adminBits = Permissions.ADMINISTRATOR;

      assert.equal(hasPermission(adminBits, Permissions.VIEW_PROCESSES), true);
      assert.equal(hasPermission(adminBits, Permissions.CREATE_PROCESSES), true);
      assert.equal(hasPermission(adminBits, Permissions.EDIT_PROCESSES), true);
      assert.equal(hasPermission(adminBits, Permissions.DELETE_PROCESSES), true);
      assert.equal(hasPermission(adminBits, Permissions.MANAGE_USERS), true);
      assert.equal(hasPermission(adminBits, Permissions.VIEW_AUDIT_LOGS), true);
      assert.equal(hasPermission(adminBits, Permissions.MANAGE_INFORMATION), true);
    });

    it('should evaluate 0 (NONE) to false for any permission requirement', () => {
      assert.equal(hasPermission(0, Permissions.VIEW_PROCESSES), false);
      assert.equal(hasPermission(0, Permissions.MANAGE_STEPS), false);
    });
  });

  describe('addPermission', () => {
    it('should add a bit to an existing bitfield using bitwise OR', () => {
      let bits = Permissions.VIEW_PROCESSES;
      bits = addPermission(bits, Permissions.CREATE_PROCESSES);

      assert.ok(hasPermission(bits, Permissions.VIEW_PROCESSES));
      assert.ok(hasPermission(bits, Permissions.CREATE_PROCESSES));
      assert.equal(hasPermission(bits, Permissions.DELETE_PROCESSES), false);
    });

    it('should remain idempotent when adding already present permission', () => {
      const initial = Permissions.VIEW_PROCESSES | Permissions.MANAGE_ERRORS;
      const result = addPermission(initial, Permissions.MANAGE_ERRORS);
      assert.equal(result, initial);
    });
  });

  describe('removePermission', () => {
    it('should remove a bit from an existing bitfield using bitwise AND-NOT', () => {
      let bits = Permissions.VIEW_PROCESSES | Permissions.EDIT_PROCESSES | Permissions.DELETE_PROCESSES;
      bits = removePermission(bits, Permissions.DELETE_PROCESSES);

      assert.ok(hasPermission(bits, Permissions.VIEW_PROCESSES));
      assert.ok(hasPermission(bits, Permissions.EDIT_PROCESSES));
      assert.equal((bits & Permissions.DELETE_PROCESSES) === Permissions.DELETE_PROCESSES, false);
    });

    it('should leave bitfield unchanged when removing a non-existent bit', () => {
      const initial = Permissions.VIEW_PROCESSES;
      const result = removePermission(initial, Permissions.DELETE_PROCESSES);
      assert.equal(result, initial);
    });
  });

  describe('getActivePermissions', () => {
    it('should return empty array for 0 or NONE', () => {
      assert.deepEqual(getActivePermissions(0), []);
      assert.deepEqual(getActivePermissions(Permissions.NONE), []);
    });

    it('should extract correct list of active permission keys', () => {
      const bits = Permissions.VIEW_PROCESSES | Permissions.MANAGE_SYSTEMS | Permissions.MANAGE_INFORMATION;
      const active = getActivePermissions(bits);

      assert.equal(active.includes('VIEW_PROCESSES'), true);
      assert.equal(active.includes('MANAGE_SYSTEMS'), true);
      assert.equal(active.includes('MANAGE_INFORMATION'), true);
      assert.equal(active.includes('DELETE_PROCESSES'), false);
      assert.equal(active.includes('NONE'), false);
    });
  });

  describe('ROLE_PRESETS', () => {
    it('should contain valid presets with expected bitfields', () => {
      // SUPER_ADMIN
      assert.ok(
        (ROLE_PRESETS.SUPER_ADMIN.bitfield & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR,
        'SUPER_ADMIN must have ADMINISTRATOR bit'
      );

      // PROCESS_MANAGER
      assert.ok(hasPermission(ROLE_PRESETS.PROCESS_MANAGER.bitfield, Permissions.CREATE_PROCESSES));
      assert.ok(hasPermission(ROLE_PRESETS.PROCESS_MANAGER.bitfield, Permissions.MANAGE_CATEGORIES));
      assert.ok(hasPermission(ROLE_PRESETS.PROCESS_MANAGER.bitfield, Permissions.MANAGE_INFORMATION));
      assert.equal(
        (ROLE_PRESETS.PROCESS_MANAGER.bitfield & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR,
        false,
        'PROCESS_MANAGER must not possess ADMINISTRATOR bypass'
      );
      assert.equal(
        (ROLE_PRESETS.PROCESS_MANAGER.bitfield & Permissions.MANAGE_USERS) === Permissions.MANAGE_USERS,
        false,
        'PROCESS_MANAGER must not manage users'
      );

      // PROCESS_EDITOR
      assert.ok(hasPermission(ROLE_PRESETS.PROCESS_EDITOR.bitfield, Permissions.EDIT_PROCESSES));
      assert.ok(hasPermission(ROLE_PRESETS.PROCESS_EDITOR.bitfield, Permissions.MANAGE_STEPS));
      assert.equal(
        (ROLE_PRESETS.PROCESS_EDITOR.bitfield & Permissions.DELETE_PROCESSES) === Permissions.DELETE_PROCESSES,
        false
      );

      // EMPLOYEE_VIEWER
      assert.equal(ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield, Permissions.VIEW_PROCESSES);
    });
  });

  describe('PERMISSION_LABELS', () => {
    it('should provide localized labels for every permission key', () => {
      for (const key of Object.keys(Permissions) as PermissionKey[]) {
        const meta = PERMISSION_LABELS[key];
        assert.ok(meta, `Metadata should exist for permission ${key}`);
        assert.ok(meta.fa && meta.fa.length > 0, `Farsi label should exist for ${key}`);
        assert.ok(meta.en && meta.en.length > 0, `English label should exist for ${key}`);
        assert.ok(meta.description && meta.description.length > 0, `Description should exist for ${key}`);
      }
    });
  });

  describe('canAccessDashboard', () => {
    it('should hide the dashboard from guests and plain viewers', () => {
      assert.equal(canAccessDashboard(Permissions.NONE), false);
      assert.equal(canAccessDashboard(Permissions.VIEW_PROCESSES), false);
    });

    it('should show the dashboard to admins and authors', () => {
      assert.equal(canAccessDashboard(Permissions.ADMINISTRATOR), true);
      assert.equal(canAccessDashboard(ROLE_PRESETS.SUPER_ADMIN.bitfield), true);
      assert.equal(canAccessDashboard(ROLE_PRESETS.PROCESS_MANAGER.bitfield), true);
      assert.equal(canAccessDashboard(ROLE_PRESETS.PROCESS_EDITOR.bitfield), true);
      assert.equal(canAccessDashboard(Permissions.MANAGE_USERS), true);
      assert.equal(canAccessDashboard(Permissions.VIEW_AUDIT_LOGS), true);
    });
  });
});
