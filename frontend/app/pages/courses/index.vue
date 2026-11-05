<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Khóa học' })

const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const showModal = ref(false)
const editingCourse = ref<any>(null)
const saving = ref(false)
const searchQuery = ref('')

const { data, pending, refresh } = await useAsyncData(
  'courses',
  () => apiFetch<any>('/courses?limit=100')
)

const allCourses = computed(() => data.value?.data || [])
const courses = computed(() => {
  if (!searchQuery.value) return allCourses.value
  const q = searchQuery.value.toLowerCase()
  return allCourses.value.filter((c: any) =>
    c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.teacher?.toLowerCase().includes(q)
  )
})

const form = reactive({ name: '', code: '', credits: 3, description: '', teacher: '' })

function openAdd() {
  editingCourse.value = null
  Object.assign(form, { name: '', code: '', credits: 3, description: '', teacher: '' })
  showModal.value = true
}

function openEdit(c: any) {
  editingCourse.value = c
  Object.assign(form, { name: c.name, code: c.code, credits: c.credits, description: c.description || '', teacher: c.teacher || '' })
  showModal.value = true
}

async function saveCourse() {
  saving.value = true
  try {
    const body = { ...form, code: form.code.toUpperCase() }
    if (editingCourse.value) {
      await apiFetch(`/courses/${editingCourse.value._id}`, { method: 'PUT', body: JSON.stringify(body) })
      toast.add({ title: '✅ Đã cập nhật khóa học', color: 'success' })
    } else {
      await apiFetch('/courses', { method: 'POST', body: JSON.stringify(body) })
      toast.add({ title: '✅ Đã thêm khóa học mới', color: 'success' })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Có lỗi xảy ra', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteCourse(id: string, name: string) {
  if (!confirm(`Xóa khóa học "${name}"?`)) return
  try {
    await apiFetch(`/courses/${id}`, { method: 'DELETE' })
    toast.add({ title: '🗑️ Đã xóa khóa học', color: 'warning' })
    await refresh()
  } catch {
    toast.add({ title: 'Không thể xóa khóa học', color: 'error' })
  }
}

const colorPalette = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-rose-500'
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Khóa học</h1>
        <p class="text-sm text-gray-500">{{ courses.length }} / {{ allCourses.length }} khóa học</p>
      </div>
      <UButton v-if="isAdmin" leading-icon="i-lucide-plus" @click="openAdd">
        Thêm khóa học
      </UButton>
    </div>

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      placeholder="Tìm theo tên, mã, giảng viên..."
      leading-icon="i-lucide-search"
      class="max-w-sm"
    />

    <!-- Course grid -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse h-52" />
    </div>

    <div v-else-if="!courses.length" class="text-center py-16 text-gray-400">
      <UIcon name="i-lucide-book-x" class="w-16 h-16 mx-auto mb-4" />
      <p class="text-sm">{{ searchQuery ? 'Không tìm thấy khóa học phù hợp' : 'Chưa có khóa học nào' }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <UCard
        v-for="(course, idx) in courses"
        :key="course._id"
        class="hover:shadow-md transition-shadow duration-200 group"
      >
        <div class="flex items-start justify-between mb-3">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorPalette[idx % colorPalette.length]]">
            <UIcon name="i-lucide-book-open" class="w-6 h-6 text-white" />
          </div>
          <div class="text-right ml-2">
            <div class="text-2xl font-black text-gray-200 dark:text-gray-700">{{ course.credits }}</div>
            <div class="text-xs text-gray-400">tín chỉ</div>
          </div>
        </div>

        <NuxtLink :to="`/courses/${course._id}`">
          <h3 class="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors mb-1 line-clamp-1">
            {{ course.name }}
          </h3>
        </NuxtLink>
        <UBadge :label="course.code" color="primary" variant="subtle" size="sm" class="mb-2" />

        <p v-if="course.description" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {{ course.description }}
        </p>

        <div class="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <span class="flex items-center gap-1 truncate">
            <UIcon name="i-lucide-user" class="w-3 h-3 flex-shrink-0" />
            <span class="truncate">{{ course.teacher || 'Chưa phân công' }}</span>
          </span>
          <span class="flex items-center gap-1 ml-2 flex-shrink-0">
            <UIcon name="i-lucide-users" class="w-3 h-3" />
            {{ course.students?.length ?? 0 }} SV
          </span>
        </div>

        <div v-if="isAdmin" class="flex gap-2 mt-3" @click.stop>
          <UButton
            size="xs"
            variant="outline"
            color="primary"
            leading-icon="i-lucide-pencil"
            class="flex-1"
            @click="openEdit(course)"
          >
            Sửa
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="error"
            leading-icon="i-lucide-trash-2"
            class="flex-1"
            @click="deleteCourse(course._id, course.name)"
          >
            Xóa
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Modal -->
    <UModal
      v-model:open="showModal"
      :title="editingCourse ? 'Sửa khóa học' : 'Thêm khóa học mới'"
    >
      <template #body>
        <div class="space-y-4 p-1">
          <UFormField label="Tên khóa học" required>
            <UInput v-model="form.name" placeholder="Lập trình Web nâng cao" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Mã (IN HOA + số)" required>
              <UInput v-model="form.code" placeholder="WEB301" class="w-full" style="text-transform:uppercase" />
            </UFormField>
            <UFormField label="Số tín chỉ">
              <UInput v-model.number="form.credits" type="number" min="1" max="10" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Giảng viên">
            <UInput v-model="form.teacher" placeholder="ThS. Nguyễn Văn A" class="w-full" />
          </UFormField>
          <UFormField label="Mô tả">
            <UTextarea v-model="form.description" placeholder="Mô tả nội dung..." rows="3" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">Hủy</UButton>
          <UButton :loading="saving" @click="saveCourse">
            {{ editingCourse ? 'Lưu thay đổi' : 'Thêm khóa học' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
