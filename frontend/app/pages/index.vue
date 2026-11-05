<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  title: 'Dashboard'
})

const { isAdmin, user } = useAuth()
const { apiFetch } = useApi()

const { data: stats, pending: statsPending } = await useAsyncData(
  'dashboard-stats',
  () => isAdmin.value ? apiFetch<any>('/stats/dashboard') : Promise.resolve(null),
  { default: () => null }
)

const { data: analytics } = await useAsyncData(
  'dashboard-analytics',
  async () => {
    if (!isAdmin.value) return null
    const [topCourses, age] = await Promise.all([
      apiFetch<any>('/analytics/top-courses').catch(() => null),
      apiFetch<any>('/analytics/age').catch(() => null)
    ])
    return { topCourses, age }
  },
  { default: () => null }
)

const statCards = computed(() => {
  if (!stats.value) return []
  const ov = stats.value.overview || {}
  return [
    {
      label: 'Tổng sinh viên',
      value: ov.totalStudents ?? 0,
      icon: 'i-lucide-users',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
      sub: 'Sinh viên đang quản lý'
    },
    {
      label: 'Khóa học',
      value: ov.totalCourses ?? 0,
      icon: 'i-lucide-book-open',
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
      sub: `${(stats.value.popularCourses || []).length} khóa phổ biến`
    },
    {
      label: 'Người dùng',
      value: ov.totalUsers ?? 0,
      icon: 'i-lucide-user-check',
      color: 'text-green-600 bg-green-50 dark:bg-green-950',
      sub: `${ov.totalAdmins ?? 0} quản trị viên`
    },
    {
      label: 'Quản trị viên',
      value: ov.totalAdmins ?? 0,
      icon: 'i-lucide-shield',
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
      sub: 'Tài khoản admin'
    }
  ]
})

const topCourses = computed(() =>
  analytics.value?.topCourses?.topCourses || analytics.value?.topCourses?.courses || []
)
const ageDistribution = computed(() =>
  analytics.value?.age?.distribution || analytics.value?.age?.ageGroups || []
)
const recentStudents = computed(() => stats.value?.recentStudents || [])
const popularCourses = computed(() => stats.value?.popularCourses || [])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">
          Chào mừng trở lại,
          <span class="font-semibold text-blue-600">{{ user?.username }}</span> 👋
        </p>
      </div>
      <UBadge
        :label="isAdmin ? '🔴 Admin' : '🔵 User'"
        :color="isAdmin ? 'primary' : 'neutral'"
        size="lg"
        variant="subtle"
      />
    </div>

    <!-- Admin only stats -->
    <template v-if="isAdmin">
      <!-- Stat cards skeleton -->
      <div v-if="statsPending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse h-28" />
      </div>

      <!-- Stat cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <UCard
          v-for="card in statCards"
          :key="card.label"
          class="hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', card.color]">
              <UIcon :name="card.icon" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ card.value }}</div>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ card.label }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ card.sub }}</div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top courses chart -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <UIcon name="i-lucide-bar-chart-2" class="w-4 h-4 text-blue-500" />
              Top Khóa học phổ biến
            </h2>
          </template>
          <div class="space-y-3 min-h-[12rem]">
            <div v-if="!topCourses.length" class="flex items-center justify-center h-48 text-gray-400 text-sm">
              Không có dữ liệu
            </div>
            <div
              v-for="(course, i) in topCourses.slice(0, 5)"
              :key="course._id"
              class="flex items-center gap-3"
            >
              <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 dark:text-blue-300 font-bold text-xs">{{ i + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ course.name }}</span>
                  <span class="text-xs font-bold text-blue-600 ml-2">{{ course.studentCount }} SV</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                  <div
                    class="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min(100, (course.studentCount / (topCourses[0]?.studentCount || 1)) * 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Age distribution -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <UIcon name="i-lucide-pie-chart" class="w-4 h-4 text-violet-500" />
              Phân bổ độ tuổi sinh viên
            </h2>
          </template>
          <div class="space-y-3 min-h-[12rem]">
            <div v-if="!ageDistribution.length" class="flex items-center justify-center h-48 text-gray-400 text-sm">
              Không có dữ liệu
            </div>
            <div
              v-for="(item, i) in ageDistribution"
              :key="i"
              class="flex items-center gap-3"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                {{ item.range || (item._id ? `${item._id} tuổi` : 'N/A') }}
              </div>
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      class="h-2 bg-violet-500 rounded-full transition-all duration-500"
                      :style="{ width: `${item.percentage || (item.count / (stats?.overview?.totalStudents || 1)) * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold text-violet-600 ml-2 w-10 text-right flex-shrink-0">
                    {{ item.percentage ? `${item.percentage}%` : `${item.count}` }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent students + Popular courses -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <UIcon name="i-lucide-user-plus" class="w-4 h-4 text-green-500" />
                Sinh viên mới nhất
              </h2>
              <NuxtLink to="/students">
                <UButton variant="ghost" size="xs" trailing-icon="i-lucide-arrow-right">Xem tất cả</UButton>
              </NuxtLink>
            </div>
          </template>
          <div v-if="!recentStudents.length" class="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu</div>
          <div v-else class="divide-y dark:divide-gray-800">
            <div
              v-for="s in recentStudents"
              :key="s._id"
              class="flex items-center gap-3 py-2.5"
            >
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 dark:text-green-300 font-bold text-xs">{{ (s.name || '?').charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/students/${s._id}`" class="font-medium text-sm text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                  {{ s.name }}
                </NuxtLink>
                <div class="text-xs text-gray-400 truncate">{{ s.email }}</div>
              </div>
              <span class="text-xs text-gray-400 flex-shrink-0">{{ s.age }} tuổi</span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <UIcon name="i-lucide-flame" class="w-4 h-4 text-orange-500" />
                Khóa học phổ biến
              </h2>
              <NuxtLink to="/courses">
                <UButton variant="ghost" size="xs" trailing-icon="i-lucide-arrow-right">Xem tất cả</UButton>
              </NuxtLink>
            </div>
          </template>
          <div v-if="!popularCourses.length" class="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu</div>
          <div v-else class="divide-y dark:divide-gray-800">
            <div v-for="c in popularCourses" :key="c._id" class="flex items-center justify-between py-2.5">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/courses/${c._id}`" class="font-medium text-sm text-gray-900 dark:text-white hover:text-blue-600 transition-colors truncate block">
                  {{ c.name }}
                </NuxtLink>
                <div class="text-xs text-gray-400">{{ c.code }}</div>
              </div>
              <UBadge :label="`${c.studentCount} SV`" color="orange" variant="subtle" size="sm" class="ml-3 flex-shrink-0" />
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <!-- Non-admin view -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink to="/students">
          <UCard class="hover:shadow-md transition-shadow cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Sinh viên</div>
                <div class="text-xs text-gray-400">Xem danh sách sinh viên</div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
        <NuxtLink to="/courses">
          <UCard class="hover:shadow-md transition-shadow cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">Khóa học</div>
                <div class="text-xs text-gray-400">Xem danh sách khóa học</div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
        <NuxtLink to="/grades">
          <UCard class="hover:shadow-md transition-shadow cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
                <UIcon name="i-lucide-star" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">Bảng điểm</div>
                <div class="text-xs text-gray-400">Xem điểm học tập</div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
