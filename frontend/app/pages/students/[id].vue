<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Chi tiết sinh viên' })

const route = useRoute()
const { apiFetch } = useApi()

const { data: student, pending } = await useAsyncData(
  `student-${route.params.id}`,
  () => apiFetch<any>(`/students/${route.params.id}`)
)

const { data: transcriptData } = await useAsyncData(
  `transcript-${route.params.id}`,
  () => apiFetch<any>(`/grades/transcript/${route.params.id}`).catch(() => null)
)

const grades = computed(() => {
  const t = transcriptData.value
  if (!t) return []
  if (Array.isArray(t)) return t
  return t.grades || t.data || []
})

const passCount = computed(() => grades.value.filter((g: any) => g.status === 'PASS').length)
const avgScore = computed(() => {
  if (!grades.value.length) return 0
  const sum = grades.value.reduce((a: number, g: any) => a + (g.averageScore || 0), 0)
  return (sum / grades.value.length).toFixed(1)
})

const gradeColors: Record<string, string> = {
  A: 'success', 'B+': 'success', B: 'primary', 'C+': 'primary',
  C: 'warning', 'D+': 'warning', D: 'warning', F: 'error'
}

const columns = [
  { key: 'course', label: 'Môn học' },
  { key: 'midtermScore', label: 'GK' },
  { key: 'finalScore', label: 'CK' },
  { key: 'averageScore', label: 'Điểm TB' },
  { key: 'letterGrade', label: 'Xếp loại' },
  { key: 'status', label: 'Kết quả' },
  { key: 'semester', label: 'Học kỳ' }
]
</script>

<template>
  <div class="space-y-5">
    <!-- Back button -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/students">
        <UButton variant="ghost" color="neutral" leading-icon="i-lucide-arrow-left" size="sm">
          Danh sách sinh viên
        </UButton>
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse h-32" />
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse h-64" />
    </div>

    <template v-else-if="student">
      <!-- Student info -->
      <UCard>
        <div class="flex flex-col sm:flex-row items-start gap-5">
          <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span class="text-blue-700 dark:text-blue-300 font-black text-3xl">
              {{ (student.name || '?').charAt(0) }}
            </span>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ student.name }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-lucide-mail" class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{{ student.email || '—' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-lucide-phone" class="w-4 h-4 flex-shrink-0" />
                {{ student.phone || '—' }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 flex-shrink-0" />
                {{ student.age }} tuổi
              </div>
            </div>
          </div>
          <!-- Quick stats -->
          <div class="flex gap-4 sm:flex-col sm:items-end text-right">
            <div>
              <div class="text-2xl font-bold text-green-600">{{ passCount }}</div>
              <div class="text-xs text-gray-400">Môn đậu</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ avgScore }}</div>
              <div class="text-xs text-gray-400">Điểm TB</div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Transcript -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-500" />
            Bảng điểm học tập ({{ grades.length }} môn)
          </h3>
        </template>

        <div v-if="!grades.length" class="text-center py-12 text-gray-400">
          <UIcon name="i-lucide-file" class="w-12 h-12 mx-auto mb-3" />
          <p class="text-sm">Chưa có điểm nào được nhập</p>
          <NuxtLink to="/grades">
            <UButton class="mt-3" variant="outline" size="sm">Nhập điểm</UButton>
          </NuxtLink>
        </div>

        <UTable v-else :data="grades" :columns="columns">
          <template #course-cell="{ row }">
            <span class="font-medium text-gray-900 dark:text-white">{{ row.course?.name || '—' }}</span>
          </template>
          <template #averageScore-cell="{ row }">
            <span class="font-bold text-gray-900 dark:text-white">{{ row.averageScore ?? '—' }}</span>
          </template>
          <template #letterGrade-cell="{ row }">
            <UBadge
              :label="row.letterGrade || '—'"
              :color="gradeColors[row.letterGrade] || 'neutral'"
              size="sm"
            />
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :label="row.status === 'PASS' ? '✓ Đậu' : '✗ Rớt'"
              :color="row.status === 'PASS' ? 'success' : 'error'"
              size="sm"
            />
          </template>
          <template #semester-cell="{ row }">
            <span class="text-gray-500 text-xs">HK{{ row.semester }}/{{ row.year }}</span>
          </template>
        </UTable>
      </UCard>
    </template>

    <div v-else class="text-center py-16 text-gray-400">
      <UIcon name="i-lucide-user-x" class="w-16 h-16 mx-auto mb-4" />
      <p>Không tìm thấy sinh viên</p>
      <NuxtLink to="/students">
        <UButton class="mt-4" variant="outline">Quay lại</UButton>
      </NuxtLink>
    </div>
  </div>
</template>
