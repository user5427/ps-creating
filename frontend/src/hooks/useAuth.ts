import { useAppStore } from '../store/appStore'
import type { Role } from '../store/appStore'

type AuthSnapshot = {
  isAuthenticated: boolean
  token: string | null | undefined
  role: Role
  user: ReturnType<typeof useAppStore.getState>['user']
  logout: ReturnType<typeof useAppStore.getState>['logout']
}

export function getAuthSnapshot(): AuthSnapshot {
  const { token, role, user, logout } = useAppStore.getState()
  const isAuthenticated = !!token && !!user
  const effectiveRole = isAuthenticated ? (user.role as Role) : role

  return {
    isAuthenticated,
    token,
    role: effectiveRole,
    user,
    logout,
  }
}

/**
 * Hook to check and enforce role-based access.
 * Returns the current auth state and helper functions for access checks.
 */
export function useAuth() {
  const token = useAppStore((s) => s.token)
  const role = useAppStore((s) => s.role)
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)

  const isAuthenticated = !!token && !!user
  // When authenticated, use the user's role from the server (JWT);
  // when not authenticated (dev mode), use the dev toggle role.
  const effectiveRole = isAuthenticated ? (user.role as Role) : role

  const hasRole = (requiredRole: Role) => isAuthenticated && effectiveRole === requiredRole

  const hasAnyRole = (roles: Role[]) => isAuthenticated && roles.includes(effectiveRole)

  return {
    isAuthenticated,
    token,
    role: effectiveRole,
    user,
    hasRole,
    hasAnyRole,
    logout,
  }
}

/**
 * Helper to check if access is allowed and redirect if not.
 * Used in route beforeLoad guards.
 */
export function checkRoleAccess(
  requiredRole: Role | 'AUTHENTICATED'
): {
  isAllowed: boolean
  redirectTo?: string
} {
  const { isAuthenticated, role } = getAuthSnapshot()

  if (!isAuthenticated) {
    return {
      isAllowed: false,
      redirectTo: '/login',
    }
  }

  if (requiredRole !== 'AUTHENTICATED' && role !== requiredRole) {
    return {
      isAllowed: false,
      redirectTo: '/access-denied',
    }
  }

  return { isAllowed: true }
}

