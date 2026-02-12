// Type definitions for Vue Router meta fields
export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    requiresSidebar?: boolean
  }
}
