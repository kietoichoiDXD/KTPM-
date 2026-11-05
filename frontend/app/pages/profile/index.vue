<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Hồ sơ cá nhân' })

const { apiFetch } = useApi()
const { user, isAdmin, fetchMe } = useAuth()
const toast = useToast()

const saving = ref(false)
const changingPw = ref(false)
const profileForm = reactive({ username: user.value?.username || '' })
const pwForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

// Sync form when user loads
watch(() => user.value?.username, (val) => {
  if (val) profileForm.username = val
})

async function saveProfile() {
  if (!profileForm.username.trim()) {
    toast.add({ title: 'Tên đăng nhập không được để trống', color: 'error' })
    return
  }
  saving.value = true
  try {
    await apiFetch('/profile', { method: 'PUT', body: JSON.stringify({ username: profileForm.username }) })
    await fetchMe()
    toast.add({ title: '✅ Đã cập nhật hồ sơ', color: 'success' })
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Có lỗi xảy ra', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!pwForm.oldPassword || !pwForm.newPassword) {
    toast.add({ title: 'Vui lòng nhập đầy đủ thông tin', color: 'error' })
    return
  }
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    toast.add({ title: 'Mật khẩu xác nhận không khớp', color: 'error' })
    return
  }
  if (pwForm.newPassword.length < 6) {
    toast.add({ title: 'Mật khẩu mới phải có ít nhất 6 ký tự', color: 'error' })
    return
  }
  changingPw.value = true
  try {
    await apiFetch('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
    })
    toast.add({ title: '✅ Đã đổi mật khẩu thành công', color: 'success' })
    Object.assign(pwForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Mật khẩu cũ không đúng', color: 'error' })
  } finally {
    changingPw.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Hồ sơ cá nhân</h1>

    <!-- Avatar card -->
    <UCard>
      <div class="flex items-center gap-5">
        <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span class="text-blue-700 dark:text-blue-300 font-black text-3xl">
            {{ (user?.username || 'U').charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ user?.username }}</h2>
          <UBadge
            :label="user?.role === 'ADMIN' ? '🔴 Quản trị viên' : '🔵 Sinh viên'"
            :color="isAdmin ? 'primary' : 'neutral'"
            variant="subtle"
            class="mt-1"
          />
          <p class="text-xs text-gray-400 mt-1">ID: {{ user?.id || user?._id }}</p>
        </div>
      </div>
    </UCard>

    <!-- Update profile -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-user" class="w-4 h-4 text-blue-500" />
          Thông tin tài khoản
        </h3>
      </template>
      <div class="space-y-4">
        <UFormField label="Tên đăng nhập">
          <UInput v-model="profileForm.username" class="w-full" />
        </UFormField>
        <UFormField label="Vai trò">
          <UInput :model-value="user?.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên/User'" disabled class="w-full" />
        </UFormField>
      </div>
      <template #footer>
        <UButton :loading="saving" leading-icon="i-lucide-save" @click="saveProfile">
          Lưu thay đổi
        </UButton>
      </template>
    </UCard>

    <!-- Change password -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-lock" class="w-4 h-4 text-orange-500" />
          Đổi mật khẩu
        </h3>
      </template>
      <div class="space-y-4">
        <UFormField label="Mật khẩu hiện tại">
          <UInput v-model="pwForm.oldPassword" type="password" placeholder="Nhập mật khẩu hiện tại" class="w-full" />
        </UFormField>
        <UFormField label="Mật khẩu mới (tối thiểu 6 ký tự)">
          <UInput v-model="pwForm.newPassword" type="password" placeholder="Nhập mật khẩu mới" class="w-full" />
        </UFormField>
        <UFormField label="Xác nhận mật khẩu mới">
          <UInput v-model="pwForm.confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" class="w-full" />
        </UFormField>
      </div>
      <template #footer>
        <UButton
          :loading="changingPw"
          color="warning"
          variant="outline"
          leading-icon="i-lucide-key"
          @click="changePassword"
        >
          Đổi mật khẩu
        </UButton>
      </template>
    </UCard>
  </div>
</template>
