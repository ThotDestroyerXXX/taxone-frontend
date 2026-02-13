<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="default"
        size="icon"
        class="relative"
        :class="inline ? '' : 'h-9 w-9'"
        @click="handleOpen"
      >
        <Bell :class="inline ? 'h-4 w-4' : 'h-5 w-5'" />
        <span
          v-if="notificationStore.hasUnread"
          class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
        >
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </span>
        <span class="sr-only">Notifications</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end" :side-offset="8">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h3 class="font-semibold">Notifications</h3>
        <div class="flex items-center gap-2">
          <Button
            v-if="notificationStore.hasUnread"
            variant="ghost"
            size="sm"
            class="h-7 text-xs"
            @click="handleMarkAllRead"
            :disabled="isMarkingRead"
          >
            <CheckCheck class="mr-1 h-3 w-3" />
            Mark all read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-7 w-7">
                <MoreHorizontal class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="handleClearAll" :disabled="isClearing">
                <Trash2 class="mr-2 h-4 w-4" />
                Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea class="h-100">
        <div v-if="notificationStore.isLoading && notificationStore.notifications.length === 0">
          <div v-for="i in 3" :key="i" class="border-b px-4 py-3">
            <Skeleton class="h-4 w-3/4 mb-2" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </div>

        <div
          v-else-if="!notificationStore.isLoading && notificationStore.notifications.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <BellOff class="h-12 w-12 text-muted-foreground mb-3" />
          <p class="text-sm font-medium">No notifications</p>
          <p class="text-xs text-muted-foreground mt-1">You're all caught up!</p>
        </div>

        <div v-else>
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
            class="group relative border-b px-4 py-3 hover:bg-accent transition-colors"
            :class="{
              'bg-primary/5': !notification.isRead,
            }"
          >
            <div class="flex items-start gap-3">
              <div class="shrink-0 mt-0.5" :class="notification.isRead ? 'opacity-40' : ''">
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="h-5 w-5"
                  :class="getNotificationColor(notification.type)"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm"
                  :class="notification.isRead ? 'text-muted-foreground' : 'font-medium'"
                >
                  {{ notification.message }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ formatRelativeTime(notification.createdAt) }}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    v-if="!notification.isRead"
                    @click="handleMarkAsRead(notification.id)"
                  >
                    <Check class="mr-2 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleDelete(notification.id)">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div
              v-if="!notification.isRead"
              class="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary"
            ></div>
          </div>
        </div>
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Info,
  Users,
  FileText,
  Mail,
  MessageSquare,
} from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'
import { formatRelativeTime } from '@/utils/formatters'

interface Props {
  inline?: boolean
}

withDefaults(defineProps<Props>(), {
  inline: false,
})

const notificationStore = useNotificationStore()
const isOpen = ref(false)
const isMarkingRead = ref(false)
const isClearing = ref(false)

onMounted(async () => {
  try {
    await Promise.all([
      notificationStore.fetchNotifications(),
      notificationStore.fetchUnreadCount(),
    ])
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
})

const handleOpen = async () => {
  if (!isOpen.value) {
    try {
      await notificationStore.fetchNotifications()
      await notificationStore.fetchUnreadCount()
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }
}

const handleMarkAllRead = async () => {
  isMarkingRead.value = true
  try {
    await notificationStore.markAllAsRead()
    toast.success('All notifications marked as read')
  } catch (error) {
    console.error('Failed to mark all as read:', error)
    toast.error('Failed to mark all as read')
  } finally {
    isMarkingRead.value = false
  }
}

const handleMarkAsRead = async (notificationId: string) => {
  try {
    notificationStore.markAsRead(notificationId)
    toast.success('Notification marked as read')
  } catch (error) {
    console.error('Failed to mark as read:', error)
    toast.error('Failed to mark as read')
  }
}

const handleDelete = async (notificationId: string) => {
  try {
    await notificationStore.deleteNotification(notificationId)
    toast.success('Notification deleted')
  } catch (error) {
    console.error('Failed to delete notification:', error)
    toast.error('Failed to delete notification')
  }
}

const handleClearAll = async () => {
  isClearing.value = true
  try {
    await notificationStore.clearAll()
    toast.success('All notifications cleared')
    isOpen.value = false
  } catch (error) {
    console.error('Failed to clear notifications:', error)
    toast.error('Failed to clear notifications')
  } finally {
    isClearing.value = false
  }
}

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, typeof Info> = {
    TASK_ASSIGNED: CheckCircle2,
    TASK_UPDATED: FileText,
    TASK_COMPLETED: CheckCircle2,
    PROJECT_UPDATED: FileText,
    MEMBER_ADDED: Users,
    MEMBER_REMOVED: Users,
    WORKSPACE_INVITATION: Mail,
    COMMENT_ADDED: MessageSquare,
    GENERAL: Info,
  }
  return iconMap[type] || Info
}

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    TASK_ASSIGNED: 'text-blue-500',
    TASK_UPDATED: 'text-yellow-500',
    TASK_COMPLETED: 'text-green-500',
    PROJECT_UPDATED: 'text-purple-500',
    MEMBER_ADDED: 'text-green-500',
    MEMBER_REMOVED: 'text-red-500',
    WORKSPACE_INVITATION: 'text-blue-500',
    COMMENT_ADDED: 'text-cyan-500',
    GENERAL: 'text-muted-foreground',
  }
  return colorMap[type] || 'text-muted-foreground'
}
</script>
