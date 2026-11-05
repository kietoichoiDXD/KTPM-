<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Thông báo' })

const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const showModal = ref(false)
const saving = ref(false)
const form = reactive({ title: '', message: '', type: 'INFO', targetRole: 'ALL' })

const { data, pending, refresh } = await useAsyncData(
  'notifications',
  () => apiFetch<any>('/notifications?limit=50')
)

const notifications = computed(() => {
  const d = data.value
  if (Array.isArray(d)) return d
  return d?.data || d?.notifications || []
})

const unreadCount = computed(() => notifications.value.filter((n: any) => !n.isRead).length)

const typeConfig: Record<string, { icon: string, color: string, bg: string }> = {
  INFO: { icon: 'i-lucide-info', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
  WARNING: { icon: 'i-lucide-alert-triangle', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' },
  SUCCESS: { icon: 'i-lucide-check-circle', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
  ERROR: { icon: 'i-lucide-x-circle', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' }
}

async function markRead(id: string) {
  try {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' })
    await refresh()
  } catch {}
}

async function markAllRead() {
  for (const n of notifications.value.filter((n: any) => !n.isRead)) {
    await markRead(n._id)
  }
  toast.add({ title: 'Đã đánh dấu tất cả là đã đọc', color: 'success' })
}

async function sendNotification() {
  if (!form.title.trim() || !form.message.trim()) {
    toast.add({ title: 'Vui lòng nhập đầy đủ thông tin', color: 'error' })
    return
  }
  saving.value = true
  try {
    await apiFetch('/notifications', { method: 'POST', body: JSON.stringify(form) })
    toast.add({ title: '✅ Đã gửi thông báo', color: 'success' })
    showModal.value = false
    Object.assign(form, { title: '', message: '', type: 'INFO', targetRole: 'ALL' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Lỗi khi gửi thông báo', color: 'error' })
  } finally {
    saving.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Thông báo
          <UBadge v-if="unreadCount > 0" :label="`${unreadCount} chưa đọc`" color="error" />
        </h1>
        <p class="text-sm text-gray-500">{{ notifications.length }} thông báo</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="unreadCount > 0"
          variant="ghost"
          color="neutral"
          size="sm"
          leading-icon="i-lucide-check-check"
          @click="markAllRead"
        >
          Đọc tất cả
        </UButton>
        <UButton v-if="isAdmin" leading-icon="i-lucide-send" @click="showModal = true">
          Gửi thông báo
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse h-20" />
    </div>

    <!-- Notifications list -->
    <div v-else-if="!notifications.length" class="text-center py-16 text-gray-400">
      <UIcon name="i-lucide-bell-off" class="w-16 h-16 mx-auto mb-4" />
      <p class="text-sm">Không có thông báo nào</p>
    </div>

    <div v-else class="space-y-2">
      <UCard
        v-for="n in notifications"
        :key="n._id"
        :class="[
          'cursor-pointer transition-all hover:shadow-sm',
          !n.isRead ? 'border-l-4 border-l-blue-500' : ''
        ]"
        @click="!n.isRead && markRead(n._id)"
      >
        <div class="flex items-start gap-4">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', typeConfig[n.type]?.bg || 'bg-gray-100 dark:bg-gray-800']">
            <UIcon :name="typeConfig[n.type]?.icon || 'i-lucide-bell'" :class="['w-5 h-5', typeConfig[n.type]?.color || 'text-gray-600']" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-semibold text-sm text-gray-900 dark:text-white">{{ n.title }}</h3>
              <div class="flex items-center gap-2 flex-shrink-0">
                <UBadge v-if="!n.isRead" label="Mới" color="primary" size="xs" />
                <span class="text-xs text-gray-400">{{ formatDate(n.createdAt) }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ n.message }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Send notification modal -->
    <UModal v-model:open="showModal" title="Gửi thông báo mới">
      <template #body>
        <div class="space-y-4 p-1">
          <UFormField label="Tiêu đề" required>
            <UInput v-model="form.title" placeholder="Tiêu đề thông báo..." class="w-full" />
          </UFormField>
          <UFormField label="Nội dung" required>
            <UTextarea v-model="form.message" placeholder="Nội dung thông báo chi tiết..." rows="4" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Loại thông báo">
              <USelect
                v-model="form.type"
                :items="[
                  { label: '📘 Thông tin', value: 'INFO' },
                  { label: '⚠️ Cảnh báo', value: 'WARNING' },
                  { label: '✅ Thành công', value: 'SUCCESS' },
                  { label: '❌ Lỗi', value: 'ERROR' }
                ]"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Gửi đến">
              <USelect
                v-model="form.targetRole"
                :items="[
                  { label: 'Tất cả', value: 'ALL' },
                  { label: 'Quản trị viên', value: 'ADMIN' },
                  { label: 'Sinh viên/User', value: 'USER' }
                ]"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">Hủy</UButton>
          <UButton :loading="saving" leading-icon="i-lucide-send" @click="sendNotification">
            Gửi thông báo
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
