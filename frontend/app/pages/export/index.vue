<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'], title: 'Xuất dữ liệu' })

const { apiBase, getHeaders } = useApi()
const toast = useToast()
const loading = ref<string | null>(null)

async function downloadFile(url: string, filename: string, type: string) {
  loading.value = type
  try {
    const res = await fetch(`${apiBase}${url}`, { headers: getHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast.add({ title: `✅ Đã tải xuống ${filename}`, color: 'success' })
  } catch (err) {
    toast.add({ title: 'Lỗi khi tải file. Vui lòng thử lại.', color: 'error' })
  } finally {
    loading.value = null
  }
}

const exportItems = [
  {
    type: 'students-csv',
    label: 'Sinh viên CSV',
    desc: 'Danh sách sinh viên - Mở được bằng Excel',
    icon: 'i-lucide-users',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnColor: 'primary' as const,
    url: '/export/students/csv',
    filename: `sinh_vien_${new Date().toISOString().slice(0,10)}.csv`
  },
  {
    type: 'courses-csv',
    label: 'Khóa học CSV',
    desc: 'Danh sách tất cả khóa học - Mở được bằng Excel',
    icon: 'i-lucide-book-open',
    iconBg: 'bg-violet-50 dark:bg-violet-950',
    iconColor: 'text-violet-600 dark:text-violet-400',
    btnColor: 'secondary' as const,
    url: '/export/courses/csv',
    filename: `khoa_hoc_${new Date().toISOString().slice(0,10)}.csv`
  },
  {
    type: 'students-json',
    label: 'Sinh viên JSON',
    desc: 'Dữ liệu JSON đầy đủ - Dùng cho import, API',
    icon: 'i-lucide-file-json',
    iconBg: 'bg-green-50 dark:bg-green-950',
    iconColor: 'text-green-600 dark:text-green-400',
    btnColor: 'success' as const,
    url: '/export/students/json',
    filename: `sinh_vien_${new Date().toISOString().slice(0,10)}.json`
  },
  {
    type: 'courses-json',
    label: 'Khóa học JSON',
    desc: 'Dữ liệu JSON đầy đủ - Dùng cho import, API',
    icon: 'i-lucide-file-json-2',
    iconBg: 'bg-orange-50 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
    btnColor: 'warning' as const,
    url: '/export/courses/json',
    filename: `khoa_hoc_${new Date().toISOString().slice(0,10)}.json`
  }
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Xuất dữ liệu</h1>
      <p class="text-sm text-gray-500">Tải xuống dữ liệu dưới dạng CSV hoặc JSON</p>
    </div>

    <!-- Info banner -->
    <UAlert
      color="primary"
      variant="subtle"
      icon="i-lucide-info"
      title="Lưu ý"
      description="File CSV có thể mở bằng Microsoft Excel hoặc Google Sheets. File JSON dùng cho import vào hệ thống khác."
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UCard
        v-for="item in exportItems"
        :key="item.type"
        class="hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4 mb-4">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', item.iconBg]">
            <UIcon :name="item.icon" :class="['w-6 h-6', item.iconColor]" />
          </div>
          <div>
            <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.label }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</div>
          </div>
        </div>

        <UButton
          block
          :color="item.btnColor"
          variant="outline"
          leading-icon="i-lucide-download"
          :loading="loading === item.type"
          @click="downloadFile(item.url, item.filename, item.type)"
        >
          Tải xuống
        </UButton>
      </UCard>
    </div>

    <!-- Health check link for admin -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="w-4 h-4 text-green-500" />
          Hệ thống
        </h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/api-info" target="_blank">
          <UButton variant="ghost" size="sm" leading-icon="i-lucide-code-2">API Docs</UButton>
        </NuxtLink>
        <UButton
          variant="ghost"
          size="sm"
          leading-icon="i-lucide-heart-pulse"
          @click="$fetch(`${apiBase}/health`).then(() => toast.add({ title: '✅ Backend hoạt động bình thường', color: 'success' }))"
        >
          Health Check
        </UButton>
      </div>
    </UCard>
  </div>
</template>
