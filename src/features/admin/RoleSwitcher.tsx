'use client';

import { usePathname } from 'next/navigation';
import { useRoles, activeRoleFromPathname, roleLabel, rolePath, type Role } from './useRoles';

/**
 * Compact pill-bar role switcher.
 * Shows only when the user has 2+ roles.
 * Clicking a pill does a hard redirect (window.location.href) so session state stays fresh.
 */
export function RoleSwitcher() {
  const pathname = usePathname() ?? '/';
  const roles = useRoles();
  const activeRole = activeRoleFromPathname(pathname);

  // Don't render anything while loading or if user has a single role
  if (roles === null || roles.length < 2) return null;

  // Only show roles the user actually has (filter out any mismatches)
  const availableRoles = roles.filter((r) => ROLE_PATHS_MAP[r]);

  if (availableRoles.length < 2) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-[#eee6da] bg-[#fbf8f2]/90 p-0.5 shadow-sm">
      {availableRoles.map((role) => {
        const isActive = role === activeRole;
        return (
          <a
            key={role}
            href={rolePath(role)}
            onClick={(e) => {
              e.preventDefault();
              document.cookie = `lembar_active_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;
              window.location.href = rolePath(role);
            }}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${
              isActive
                ? 'bg-[#171717] text-white shadow-sm'
                : 'text-[#57534e] hover:text-[#171717] hover:bg-[#f0ebe3]'
            }`}
          >
            {roleLabel(role)}
          </a>
        );
      })}
    </div>
  );
}

/** Quick lookup so we can filter roles to known values */
const ROLE_PATHS_MAP: Record<Role, string> = {
  teacher: '/app',
  school_admin: '/school',
  superadmin: '/ops',
};
