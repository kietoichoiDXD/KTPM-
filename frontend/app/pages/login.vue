<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'Đăng nhập'
})

const { isLoggedIn, login } = useAuth()
const toast = useToast()

if (isLoggedIn.value) {
  await navigateTo('/')
}

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!form.username.trim() || !form.password.trim()) {
    errorMsg.value = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
    return
  }
  loading.value = true
  try {
    await login(form.username, form.password)
    toast.add({ title: '🎉 Đăng nhập thành công!', color: 'success' })
    await navigateTo('/')
  } catch {
    errorMsg.value = 'Sai tên đăng nhập hoặc mật khẩu'
  } finally {
    loading.value = false
  }
}

function quickLogin(username: string, password: string) {
  form.username = username
  form.password = password
  handleLogin()
}
</script>

<template>
  <div class="w-full max-w-md">
    <UCard class="shadow-2xl">
      <template #header>
        <div class="text-center py-4">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Quản Lý Sinh Viên</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Khoa KTPM · ĐH Sư Phạm Đà Nẵng
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <UAlert
          v-if="errorMsg"
          color="error"
          icon="i-lucide-alert-circle"
          :description="errorMsg"
        />

        <UFormField label="Tên đăng nhập" required>
          <UInput
            v-model="form.username"
            placeholder="Nhập tên đăng nhập"
            leading-icon="i-lucide-user"
            autocomplete="username"
            class="w-full"
            @keyup.enter="handleLogin"
          />
        </UFormField>

        <UFormField label="Mật khẩu" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu"
            leading-icon="i-lucide-lock"
            autocomplete="current-password"
            class="w-full"
            @keyup.enter="handleLogin"
          />
        </UFormField>

        <UButton
          type="button"
          block
          size="lg"
          :loading="loading"
          @click="handleLogin"
        >
          <template #leading>
            <UIcon v-if="!loading" name="i-lucide-log-in" />
          </template>
          Đăng nhập
        </UButton>
      </div>

      <template #footer>
        <div class="space-y-2">
          <p class="text-xs text-center text-gray-400 mb-3">Đăng nhập nhanh với tài khoản mẫu:</p>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              variant="outline"
              color="primary"
              size="sm"
              leading-icon="i-lucide-shield"
              :loading="loading && form.username === 'admin'"
              @click="quickLogin('admin', 'admin123')"
            >
              Admin
            </UButton>
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              leading-icon="i-lucide-user"
              :loading="loading && form.username === 'user'"
              @click="quickLogin('user', 'user123')"
            >
              Sinh viên
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
