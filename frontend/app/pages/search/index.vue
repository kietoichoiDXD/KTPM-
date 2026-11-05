<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Tìm kiếm' })

const { apiFetch } = useApi()
const query = ref('')
const results = ref<any>(null)
const loading = ref(false)

let searchTimer: ReturnType<typeof setTimeout>

watch(query, (q) => {
  clearTimeout(searchTimer)
  if (!q || q.length < 2) { results.value = null; return }
  searchTimer = setTimeout(async () => {
    loading.value = true
    try {
      results.value = await apiFetch(`/search?q=${encodeURIComponent(q)}`)
    } catch {}
    finally { loading.value = false }
  }, 500)
})

const totalResults = computed(() => {
  if (!results.value) return 0
  return (results.value.students?.length || 0) + (results.value.courses?.length || 0)
})
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tìm kiếm</h1>
      <p class="text-sm text-gray-500">Tìm kiếm sinh viên, khóa học toàn bộ hệ thống</p>
    </div>

    <!-- Search input -->
    <div class="relative">
      <UInput
        v-model="query"
        placeholder="Nhập tên sinh viên, môn học, email, mã khóa học..."
        leading-icon="i-lucide-search"
        :trailing-icon="loading ? 'i-lucide-loader-2' : undefined"
        size="xl"
        class="w-full"
        autofocus
      />
    </div>

    <!-- Results count -->
    <div v-if="query.length >= 2 && !loading" class="text-sm text-gray-500">
      <span v-if="totalResults > 0">Tìm thấy <strong class="text-gray-900 dark:text-white">{{ totalResults }}</strong> kết quả cho "<strong class="text-blue-600">{{ query }}</strong>"</span>
      <span v-else>Không tìm thấy kết quả nào cho "<strong>{{ query }}</strong>"</span>
    </div>

    <!-- Empty state -->
    <div v-if="query.length < 2 && !results" class="text-center py-16 text-gray-400">
      <UIcon name="i-lucide-search" class="w-16 h-16 mx-auto mb-4" />
      <p class="text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
    </div>

    <!-- No results -->
    <div v-else-if="query.length >= 2 && !loading && totalResults === 0" class="text-center py-12 text-gray-400">
      <UIcon name="i-lucide-search-x" class="w-16 h-16 mx-auto mb-4" />
      <p>Không tìm thấy kết quả nào</p>
      <p class="text-sm mt-1">Thử tìm với từ khóa khác</p>
    </div>

    <!-- Students results -->
    <div v-if="results?.students?.length">
      <h2 class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3 text-sm">
        <UIcon name="i-lucide-users" class="w-4 h-4 text-blue-500" />
        Sinh viên ({{ results.students.length }})
      </h2>
      <div class="space-y-2">
        <NuxtLink
          v-for="s in results.students"
          :key="s._id"
          :to="`/students/${s._id}`"
          class="block"
        >
          <UCard class="hover:shadow-sm transition-shadow cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-700 dark:text-blue-300 font-bold text-sm">{{ (s.name || '?').charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-gray-900 dark:text-white">{{ s.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ s.email }} · {{ s.phone }}</div>
              </div>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-gray-300 flex-shrink-0" />
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Courses results -->
    <div v-if="results?.courses?.length">
      <h2 class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3 text-sm">
        <UIcon name="i-lucide-book-open" class="w-4 h-4 text-violet-500" />
        Khóa học ({{ results.courses.length }})
      </h2>
      <div class="space-y-2">
        <NuxtLink
          v-for="c in results.courses"
          :key="c._id"
          :to="`/courses/${c._id}`"
          class="block"
        >
          <UCard class="hover:shadow-sm transition-shadow cursor-pointer">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-lucide-book-open" class="text-violet-700 dark:text-violet-300 w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-sm text-gray-900 dark:text-white">{{ c.name }}</div>
                  <div class="text-xs text-gray-400">{{ c.code }} · {{ c.credits }} tín chỉ · {{ c.teacher }}</div>
                </div>
              </div>
              <UBadge :label="c.code" color="primary" variant="subtle" size="sm" class="flex-shrink-0" />
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
