<script setup lang="ts">
const { isLoggedIn, user, isAdmin, logout, fetchMe } = useAuth()
const route = useRoute()
const colorMode = useColorMode()
const isSidebarOpen = ref(true)

// Fetch user info on mount
onMounted(async () => {
  if (isLoggedIn.value && !user.value) {
    await fetchMe()
  }
})

const navItems = computed(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/', show: isAdmin.value },
  { label: 'Sinh viên', icon: 'i-lucide-users', to: '/students', show: true },
  { label: 'Khóa học', icon: 'i-lucide-book-open', to: '/courses', show: true },
  { label: 'Bảng điểm', icon: 'i-lucide-star', to: '/grades', show: true },
  { label: 'Điểm danh', icon: 'i-lucide-calendar-check', to: '/attendance', show: true },
  { label: 'Thông báo', icon: 'i-lucide-bell', to: '/notifications', show: true },
  { label: 'Tìm kiếm', icon: 'i-lucide-search', to: '/search', show: true },
  { label: 'Xuất dữ liệu', icon: 'i-lucide-download', to: '/export', show: isAdmin.value },
  { label: 'Hồ sơ', icon: 'i-lucide-user-circle', to: '/profile', show: true },
])

const visibleNavItems = computed(() => navItems.value.filter(i => i.show))

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 flex flex-col',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <UIcon name="i-lucide-graduation-cap" class="text-white w-5 h-5" />
        </div>
        <div>
          <div class="font-bold text-sm text-gray-900 dark:text-white">KTPM UED</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Quản lý Sinh viên</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in visibleNavItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User info -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-700 dark:text-blue-300 font-bold text-sm">
              {{ (user?.username || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ user?.username || 'Người dùng' }}
            </div>
            <UBadge
              :label="user?.role || 'USER'"
              :color="isAdmin ? 'primary' : 'neutral'"
              size="xs"
              variant="subtle"
            />
          </div>
        </div>
        <UButton
          block
          variant="ghost"
          color="error"
          icon="i-lucide-log-out"
          size="sm"
          @click="logout"
        >
          Đăng xuất
        </UButton>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/30 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col lg:ml-64">
      <!-- Top bar -->
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <UButton
          icon="i-lucide-menu"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="isSidebarOpen = !isSidebarOpen"
        />

        <!-- Breadcrumb -->
        <div class="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {{ route.meta.title || 'Trang chủ' }}
        </div>

        <div class="ml-auto flex items-center gap-2">
          <!-- Dark mode toggle -->
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          />

          <!-- Notifications link -->
          <NuxtLink to="/notifications">
            <UButton icon="i-lucide-bell" variant="ghost" color="neutral" size="sm" />
          </NuxtLink>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
