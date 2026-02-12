import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/:workspaceId/project/:projectId/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/settings',
      name: 'workspace-settings',
      component: () => import('../views/WorkspaceSettingsView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/members',
      name: 'workspace-members',
      component: () => import('../views/WorkspaceMembersView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/invitations',
      name: 'workspace-invitations',
      component: () => import('../views/WorkspaceInvitationsView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/projects',
      name: 'workspace-projects',
      component: () => import('../views/WorkspaceProjectsView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/workspace/labels',
      name: 'workspace-labels',
      component: () => import('../views/WorkspaceLabelsView.vue'),
      meta: {
        requiresSidebar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresSidebar: false,
        guestOnly: true,
      },
    },
  ],
})

// Apply auth guard to all routes
router.beforeEach(authGuard)

export default router
