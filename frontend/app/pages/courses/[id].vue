<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Chi tiết khóa học' })

const route = useRoute()
const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const addStudentModal = ref(false)
const selectedStudentId = ref('')

const { data: course, pending, refresh } = await useAsyncData(
  `course-${route.params.id}`,
  () => apiFetch<any>(`/courses/${route.params.id}`)
)

const { data: studentsData } = await useAsyncData(
  'students-for-course',
  () => apiFetch<any>('/students?limit=200')
)
const allStudents = computed(() => studentsData.value?.data || [])

// Students not yet in the course
const availableStudents = computed(() => {
  const enrolled = new Set((course.value?.students || []).map((s: any) => s._id))
  return allStudents.value.filter((s: any) => !enrolled.has(s._id))
})

async function addStudent() {
  if (!selectedStudentId.value) return
  try {
    await apiFetch(`/courses/${route.params.id}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId: selectedStudentId.value })
    })
    toast.add({ title: '✅ Đã thêm sinh viên vào khóa học', color: 'success' })
    addStudentModal.value = false
    selectedStudentId.value = ''
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Có lỗi xảy ra', color: 'error' })
  }
}

async function removeStudent(studentId: string, studentName: string) {
  if (!confirm(`Xóa "${studentName}" khỏi khóa học?`)) return
  try {
    await apiFetch(`/courses/${route.params.id}/students/${studentId}`, { method: 'DELETE' })
    toast.add({ title: '🗑️ Đã xóa sinh viên khỏi khóa học', color: 'warning' })
    await refresh()
  } catch {
    toast.add({ title: 'Có lỗi xảy ra', color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3">
      <NuxtLink to="/courses">
        <UButton variant="ghost" color="neutral" leading-icon="i-lucide-arrow-left" size="sm">
          Khóa học
        </UButton>
      </NuxtLink>
    </div>

    <div v-if="pending" class="space-y-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border animate-pulse h-36" />
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border animate-pulse h-64" />
    </div>

    <template v-else-if="course">
      <!-- Course header -->
      <UCard>
        <div class="flex flex-col sm:flex-row items-start gap-5">
          <div class="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-book-open" class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ course.name }}</h2>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <UBadge :label="course.code" color="primary" />
                  <UBadge :label="`${course.credits} tín chỉ`" color="violet" variant="subtle" />
                </div>
              </div>
            </div>
            <p v-if="course.description" class="text-sm text-gray-500 mt-2">{{ course.description }}</p>
            <div class="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <UIcon name="i-lucide-user" class="w-4 h-4 flex-shrink-0" />
              <span>{{ course.teacher || 'Chưa phân công giảng viên' }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Students list -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-users" class="w-5 h-5 text-blue-500" />
              Sinh viên đăng ký ({{ course.students?.length ?? 0 }})
            </h3>
            <UButton
              v-if="isAdmin"
              size="sm"
              leading-icon="i-lucide-user-plus"
              @click="addStudentModal = true"
            >
              Thêm SV
            </UButton>
          </div>
        </template>

        <div v-if="!course.students?.length" class="text-center py-12 text-gray-400">
          <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-3" />
          <p class="text-sm">Chưa có sinh viên nào đăng ký</p>
        </div>

        <div v-else class="divide-y dark:divide-gray-800">
          <div
            v-for="student in course.students"
            :key="student._id"
            class="flex items-center gap-3 py-3"
          >
            <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-700 dark:text-blue-300 font-bold text-sm">
                {{ (student.name || '?').charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/students/${student._id}`"
                class="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm"
              >
                {{ student.name }}
              </NuxtLink>
              <div class="text-xs text-gray-400 truncate">{{ student.email }}</div>
            </div>
            <UButton
              v-if="isAdmin"
              icon="i-lucide-x"
              variant="ghost"
              color="error"
              size="xs"
              @click="removeStudent(student._id, student.name)"
            />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Add student modal -->
    <UModal v-model:open="addStudentModal" title="Thêm sinh viên vào khóa học">
      <template #body>
        <div class="p-1">
          <UFormField label="Chọn sinh viên">
            <USelect
              v-model="selectedStudentId"
              :items="availableStudents.map((s: any) => ({ label: `${s.name} — ${s.email}`, value: s._id }))"
              placeholder="Tìm và chọn sinh viên..."
              class="w-full"
            />
          </UFormField>
          <p class="text-xs text-gray-400 mt-2">
            {{ availableStudents.length }} sinh viên có thể thêm vào
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="addStudentModal = false">Hủy</UButton>
          <UButton :disabled="!selectedStudentId" @click="addStudent">Thêm vào khóa học</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
