<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Điểm danh' })

const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const showModal = ref(false)
const saving = ref(false)

const form = reactive({
  studentId: '', courseId: '',
  status: 'PRESENT',
  date: new Date().toISOString().slice(0, 10),
  note: ''
})

const { data: studentsData } = await useAsyncData('att-students', () => apiFetch<any>('/students?limit=200'))
const { data: coursesData } = await useAsyncData('att-courses', () => apiFetch<any>('/courses?limit=100'))

const students = computed(() => studentsData.value?.data || [])
const courses = computed(() => coursesData.value?.data || [])

const { data: attData, pending, refresh } = await useAsyncData(
  'attendance',
  () => apiFetch<any>('/attendance?limit=100')
)

const records = computed(() => {
  const d = attData.value
  if (Array.isArray(d)) return d
  return d?.data || d?.attendance || []
})

const statusConfig: Record<string, { label: string, color: string, icon: string }> = {
  PRESENT: { label: 'Có mặt', color: 'success', icon: 'i-lucide-check-circle' },
  ABSENT: { label: 'Vắng mặt', color: 'error', icon: 'i-lucide-x-circle' },
  LATE: { label: 'Đi muộn', color: 'warning', icon: 'i-lucide-clock' },
  EXCUSED: { label: 'Có phép', color: 'primary', icon: 'i-lucide-file-check' }
}

async function saveAttendance() {
  if (!form.studentId || !form.courseId) {
    toast.add({ title: 'Vui lòng chọn sinh viên và môn học', color: 'error' })
    return
  }
  saving.value = true
  try {
    await apiFetch('/attendance', { method: 'POST', body: JSON.stringify(form) })
    toast.add({ title: '✅ Đã lưu điểm danh', color: 'success' })
    showModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Lỗi khi lưu điểm danh', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Summary stats
const totalRecords = computed(() => records.value.length)
const presentCount = computed(() => records.value.filter((r: any) => r.status === 'PRESENT').length)
const absentCount = computed(() => records.value.filter((r: any) => r.status === 'ABSENT').length)
const attendanceRate = computed(() => totalRecords.value ? Math.round((presentCount.value / totalRecords.value) * 100) : 0)

const columns = [
  { key: 'student', label: 'Sinh viên' },
  { key: 'course', label: 'Môn học' },
  { key: 'date', label: 'Ngày' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'note', label: 'Ghi chú' }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Điểm danh</h1>
        <p class="text-sm text-gray-500">Theo dõi chuyên cần</p>
      </div>
      <UButton v-if="isAdmin" leading-icon="i-lucide-plus" @click="showModal = true">
        Ghi điểm danh
      </UButton>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalRecords }}</div>
          <div class="text-xs text-gray-400 mt-1">Tổng lượt</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ presentCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Có mặt</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ absentCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Vắng mặt</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ attendanceRate }}%</div>
          <div class="text-xs text-gray-400 mt-1">Tỷ lệ đi học</div>
        </div>
      </UCard>
    </div>

    <!-- Table -->
    <UCard>
      <UTable :data="records" :columns="columns" :loading="pending">
        <template #student-cell="{ row }">
          <span class="font-medium text-sm text-gray-900 dark:text-white">{{ row.student?.name || '—' }}</span>
        </template>
        <template #course-cell="{ row }">
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ row.course?.name || '—' }}</span>
        </template>
        <template #date-cell="{ row }">
          <span class="text-sm text-gray-500">
            {{ row.date ? new Date(row.date).toLocaleDateString('vi-VN') : '—' }}
          </span>
        </template>
        <template #status-cell="{ row }">
          <UBadge
            :label="statusConfig[row.status]?.label || row.status"
            :color="statusConfig[row.status]?.color || 'neutral'"
            size="sm"
          />
        </template>
        <template #note-cell="{ row }">
          <span class="text-xs text-gray-400">{{ row.note || '—' }}</span>
        </template>
        <template #empty>
          <div class="text-center py-12 text-gray-400">
            <UIcon name="i-lucide-calendar-check" class="w-12 h-12 mx-auto mb-3" />
            <p class="text-sm">Chưa có dữ liệu điểm danh</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Attendance modal -->
    <UModal v-model:open="showModal" title="Ghi điểm danh">
      <template #body>
        <div class="space-y-4 p-1">
          <UFormField label="Sinh viên" required>
            <USelect
              v-model="form.studentId"
              :items="students.map((s: any) => ({ label: s.name, value: s._id }))"
              placeholder="Chọn sinh viên"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Môn học" required>
            <USelect
              v-model="form.courseId"
              :items="courses.map((c: any) => ({ label: c.name, value: c._id }))"
              placeholder="Chọn môn học"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Ngày">
              <UInput v-model="form.date" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Trạng thái">
              <USelect
                v-model="form.status"
                :items="Object.entries(statusConfig).map(([v, c]) => ({ label: c.label, value: v }))"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Ghi chú">
            <UInput v-model="form.note" placeholder="Lý do vắng, ghi chú thêm..." class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">Hủy</UButton>
          <UButton :loading="saving" @click="saveAttendance">Lưu điểm danh</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
