<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Bảng điểm' })

const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const studentFilter = ref('')
const semesterFilter = ref('')
const showModal = ref(false)
const saving = ref(false)

const form = reactive({
  studentId: '', courseId: '', midtermScore: 0, finalScore: 0,
  semester: 1, year: new Date().getFullYear(), notes: ''
})

const { data: studentsData } = await useAsyncData('grade-students', () => apiFetch<any>('/students?limit=200'))
const { data: coursesData } = await useAsyncData('grade-courses', () => apiFetch<any>('/courses?limit=100'))

const students = computed(() => studentsData.value?.data || [])
const courses = computed(() => coursesData.value?.data || [])

const { data: gradesData, pending, refresh } = await useAsyncData(
  'grades',
  () => {
    let url = '/grades?limit=100'
    if (studentFilter.value) url += `&studentId=${studentFilter.value}`
    if (semesterFilter.value) url += `&semester=${semesterFilter.value}`
    return apiFetch<any>(url)
  },
  { watch: [studentFilter, semesterFilter] }
)

const grades = computed(() => gradesData.value?.data || [])

const gradeColors: Record<string, string> = {
  A: 'success', 'B+': 'success', B: 'primary', 'C+': 'primary',
  C: 'warning', 'D+': 'warning', D: 'warning', F: 'error'
}

async function saveGrade() {
  if (!form.studentId || !form.courseId) {
    toast.add({ title: 'Vui lòng chọn sinh viên và môn học', color: 'error' })
    return
  }
  saving.value = true
  try {
    await apiFetch('/grades', { method: 'POST', body: JSON.stringify(form) })
    toast.add({ title: '✅ Đã lưu điểm', color: 'success' })
    showModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Lỗi khi lưu điểm', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteGrade(id: string) {
  if (!confirm('Xóa bản ghi điểm này?')) return
  try {
    await apiFetch(`/grades/${id}`, { method: 'DELETE' })
    toast.add({ title: '🗑️ Đã xóa điểm', color: 'warning' })
    await refresh()
  } catch {
    toast.add({ title: 'Không thể xóa', color: 'error' })
  }
}

const semesterOptions = [
  { label: 'Tất cả học kỳ', value: '' },
  { label: 'Học kỳ 1', value: '1' },
  { label: 'Học kỳ 2', value: '2' },
  { label: 'Học kỳ 3', value: '3' }
]

const columns = [
  { key: 'student', label: 'Sinh viên' },
  { key: 'course', label: 'Môn học' },
  { key: 'midtermScore', label: 'GK' },
  { key: 'finalScore', label: 'CK' },
  { key: 'averageScore', label: 'TB' },
  { key: 'letterGrade', label: 'Xếp loại' },
  { key: 'status', label: 'Kết quả' },
  { key: 'actions', label: '' }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bảng điểm</h1>
        <p class="text-sm text-gray-500">{{ grades.length }} bản ghi điểm</p>
      </div>
      <UButton v-if="isAdmin" leading-icon="i-lucide-plus" @click="showModal = true">
        Nhập điểm
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <USelect
        v-model="studentFilter"
        :items="[{ label: 'Tất cả sinh viên', value: '' }, ...students.map((s: any) => ({ label: s.name, value: s._id }))]"
        placeholder="Lọc sinh viên"
        class="w-48"
      />
      <USelect
        v-model="semesterFilter"
        :items="semesterOptions"
        class="w-44"
      />
    </div>

    <UCard>
      <UTable :data="grades" :columns="columns" :loading="pending">
        <template #student-cell="{ row }">
          <NuxtLink v-if="row.student?._id" :to="`/students/${row.student._id}`" class="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm">
            {{ row.student?.name || '—' }}
          </NuxtLink>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #course-cell="{ row }">
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ row.course?.name || '—' }}</span>
        </template>

        <template #averageScore-cell="{ row }">
          <span class="font-bold text-gray-900 dark:text-white">{{ row.averageScore ?? '—' }}</span>
        </template>

        <template #letterGrade-cell="{ row }">
          <UBadge :label="row.letterGrade || '—'" :color="gradeColors[row.letterGrade] || 'neutral'" size="sm" />
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :label="row.status === 'PASS' ? '✓ Đậu' : '✗ Rớt'"
            :color="row.status === 'PASS' ? 'success' : 'error'"
            size="sm"
          />
        </template>

        <template #actions-cell="{ row }">
          <UButton
            v-if="isAdmin"
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            size="xs"
            @click="deleteGrade(row._id)"
          />
        </template>

        <template #empty>
          <div class="text-center py-12 text-gray-400">
            <UIcon name="i-lucide-star" class="w-12 h-12 mx-auto mb-3" />
            <p class="text-sm">Chưa có điểm nào</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Input grade modal -->
    <UModal v-model:open="showModal" title="Nhập điểm">
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
            <UFormField label="Điểm Giữa kỳ (0–10)">
              <UInput v-model.number="form.midtermScore" type="number" min="0" max="10" step="0.5" class="w-full" />
            </UFormField>
            <UFormField label="Điểm Cuối kỳ (0–10)">
              <UInput v-model.number="form.finalScore" type="number" min="0" max="10" step="0.5" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Học kỳ">
              <USelect
                v-model.number="form.semester"
                :items="[1,2,3].map(n => ({ label: `Học kỳ ${n}`, value: n }))"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Năm học">
              <UInput v-model.number="form.year" type="number" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Ghi chú">
            <UInput v-model="form.notes" placeholder="Nhận xét về sinh viên..." class="w-full" />
          </UFormField>
          <div class="bg-blue-50 dark:bg-blue-950 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
            💡 Điểm TB = 40% GK + 60% CK. Xếp loại sẽ tự động tính.
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">Hủy</UButton>
          <UButton :loading="saving" @click="saveGrade">Lưu điểm</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
