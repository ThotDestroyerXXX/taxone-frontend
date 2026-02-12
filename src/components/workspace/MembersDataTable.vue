<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Input v-model="globalFilter" placeholder="Search members..." class="max-w-sm" />
    </div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <div
                v-if="!header.isPlaceholder"
                :class="[
                  header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                  'flex items-center gap-2',
                ]"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <ArrowUpDown v-if="header.column.getCanSort()" class="h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import { ArrowUpDown, Settings, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WorkspaceMemberResponse } from '@/types/workspace'

interface Props {
  members: WorkspaceMemberResponse[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [member: WorkspaceMemberResponse]
  remove: [member: WorkspaceMemberResponse]
}>()

const sorting = ref<SortingState>([])
const globalFilter = ref('')

const getInitials = (email: string) => {
  return email.substring(0, 2).toUpperCase()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getMemberTypeColor = (type: string) => {
  switch (type) {
    case 'OWNER':
      return 'bg-purple-100 text-purple-800'
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800'
    case 'MEMBER':
      return 'bg-green-100 text-green-800'
    case 'GUEST':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const columns: ColumnDef<WorkspaceMemberResponse>[] = [
  {
    accessorKey: 'user.email',
    header: 'Member',
    cell: ({ row }) => {
      const member = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h(
          'div',
          {
            class:
              'h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0',
          },
          getInitials(member.user.email),
        ),
        h(
          'div',
          { class: 'flex flex-col' },
          [
            h('span', { class: 'font-medium' }, member.user.email),
            member.user.firstName || member.user.lastName
              ? h(
                  'span',
                  { class: 'text-sm text-muted-foreground' },
                  `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
                )
              : null,
          ].filter(Boolean),
        ),
      ])
    },
  },
  {
    accessorKey: 'memberType',
    header: 'Role',
    cell: ({ row }) => {
      const type = row.original.memberType
      return h(
        'span',
        {
          class: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMemberTypeColor(type)}`,
        },
        type,
      )
    },
  },
  {
    accessorKey: 'joinedAt',
    header: 'Joined',
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-sm text-muted-foreground' },
        formatDate(row.original.joinedAt),
      )
    },
  },
  {
    accessorKey: 'addedBy.email',
    header: 'Added By',
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-sm text-muted-foreground' },
        row.original.addedBy?.email || '-',
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const member = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: () => emit('edit', member),
          },
          () => [h(Settings, { class: 'h-4 w-4' })],
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            onClick: () => emit('remove', member),
          },
          () => [h(Trash2, { class: 'h-4 w-4' })],
        ),
      ])
    },
  },
]

const table = useVueTable({
  get data() {
    return props.members
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  onGlobalFilterChange: (updaterOrValue) => {
    globalFilter.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter.value) : updaterOrValue
  },
})
</script>
