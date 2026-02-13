/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return 'Unknown'

  let date: Date

  if (typeof dateString === 'string') {
    date = new Date(dateString)

    // If parsing failed, try adding 'Z' for UTC if it's a LocalDateTime format
    if (Number.isNaN(date.getTime())) {
      date = new Date(dateString + 'Z')
    }
  } else {
    date = dateString
  }

  // Check if date is valid
  if (Number.isNaN(date.getTime())) {
    console.warn('Invalid date received:', dateString)
    return 'Unknown'
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  return date.toLocaleDateString('en-US', options || defaultOptions)
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Recently'

  let date: Date

  if (typeof dateString === 'string') {
    // Try parsing the date string
    date = new Date(dateString)

    // If parsing failed, try adding 'Z' for UTC if it's a LocalDateTime format
    if (Number.isNaN(date.getTime())) {
      // Java LocalDateTime format: "2026-02-13T10:30:45" (no timezone)
      // Try parsing as UTC by adding 'Z'
      date = new Date(dateString + 'Z')
    }
  } else {
    date = dateString
  }

  // Check if date is valid
  if (Number.isNaN(date.getTime())) {
    console.warn('Invalid date received:', dateString)
    return 'Recently'
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(date)
}

/**
 * Get initials from a name or email
 * @param text - Name or email string
 * @param maxChars - Maximum number of characters (default: 2)
 * @returns Uppercase initials
 */
export function getInitials(text: string, maxChars = 2): string {
  if (!text) return ''

  // If it's an email, use the part before @
  if (text.includes('@')) {
    return text.substring(0, maxChars).toUpperCase()
  }

  // Otherwise, get initials from words
  return text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, maxChars)
}

/**
 * Format a number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
