/**
 * Utility functions for status and priority color mapping
 * Follows shadcn-vue color system for consistent theming
 */

/**
 * Get Tailwind classes for project/task status
 * @param status - Status string
 * @returns Tailwind CSS classes
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = status?.toLowerCase()

  switch (normalizedStatus) {
    case 'active':
    case 'done':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-400/20'
    case 'in progress':
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-400/20'
    case 'todo':
    case 'open':
    case 'archived':
      return 'bg-muted text-muted-foreground ring-border'
    case 'draft':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-400/20'
    case 'cancelled':
    case 'rejected':
      return 'bg-destructive/10 text-destructive ring-destructive/20'
    default:
      return 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-400 dark:ring-purple-400/20'
  }
}

/**
 * Get Tailwind classes for priority levels
 * @param priority - Priority string
 * @returns Tailwind CSS classes
 */
export function getPriorityClass(priority: string): string {
  const normalizedPriority = priority?.toUpperCase()

  const classes: Record<string, string> = {
    LOW: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    CRITICAL: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  }

  return classes[normalizedPriority] || 'bg-secondary text-secondary-foreground'
}

/**
 * Get priority color for visual indicators (bars, dots)
 * Returns HSL color value compatible with style binding
 * @param priority - Priority string
 * @returns HSL color string
 */
export function getPriorityBarColor(priority: string): string {
  const normalizedPriority = priority?.toLowerCase()

  switch (normalizedPriority) {
    case 'critical':
      return 'hsl(var(--destructive))'
    case 'high':
      return 'hsl(24.6 95% 53.1%)' // orange-500
    case 'medium':
      return 'hsl(47.9 95.8% 53.1%)' // amber-500
    case 'low':
      return 'hsl(221.2 83.2% 53.3%)' // blue-500
    default:
      return 'hsl(var(--muted-foreground))'
  }
}

/**
 * Get badge variant for member roles
 * @param type - Member type string
 * @returns Badge variant
 */
export function getMemberTypeVariant(
  type: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type?.toUpperCase()) {
    case 'OWNER':
      return 'default'
    case 'ADMIN':
      return 'secondary'
    case 'MEMBER':
    case 'GUEST':
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get badge variant for invitation status
 * @param status - Invitation status string
 * @returns Badge variant
 */
export function getInvitationStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'secondary'
    case 'accepted':
      return 'default'
    case 'rejected':
    case 'cancelled':
      return 'outline'
    default:
      return 'secondary'
  }
}
