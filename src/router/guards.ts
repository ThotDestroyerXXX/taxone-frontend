import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

/**
 * Navigation guard to protect routes that require authentication
 */
export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const token = localStorage.getItem('accessToken')
  const hasToken = !!token

  // If going to a guest-only page (like login) and user has token, redirect to home
  if (to.meta.guestOnly && hasToken) {
    next({ name: 'home' })
    return
  }

  // If route requires auth and no token, redirect to login
  if (to.meta.requiresAuth && !hasToken) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // All checks passed, allow navigation
  next()
}
