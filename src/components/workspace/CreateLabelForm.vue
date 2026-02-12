<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Label Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Bug" v-bind="componentField" />
        </FormControl>
        <FormDescription> The name of the label (2-100 characters). </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="color">
      <FormItem>
        <FormLabel>Color</FormLabel>
        <FormControl>
          <div class="flex gap-2">
            <Input type="text" placeholder="#A1B2C3" v-bind="componentField" class="flex-1" />
            <Input
              type="color"
              :value="componentField.modelValue"
              @input="(e) => componentField['onInput']((e.target as HTMLInputElement).value)"
              class="w-20 h-10"
            />
          </div>
        </FormControl>
        <FormDescription> Hex color code for the label (e.g., #A1B2C3). </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Label description" v-bind="componentField" />
        </FormControl>
        <FormDescription> Brief description of what this label represents. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create Label</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { labelFormSchema, type LabelFormData } from '@/lib/schemas/LabelSchema'
import { workspaceApi } from '@/api/workspace'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  workspaceId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [label: any]
}>()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: labelFormSchema,
})

const onSubmit = handleSubmit(async (values: LabelFormData) => {
  try {
    const label = await workspaceApi.createLabel(props.workspaceId, values)
    toast.success('Label created successfully!')
    emit('success', label)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to create label')
    throw error
  }
})
</script>
