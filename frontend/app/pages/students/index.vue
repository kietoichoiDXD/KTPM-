<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Sinh viên' })

const { apiFetch } = useApi()
const { isAdmin } = useAuth()
const toast = useToast()

const search = ref('')
const page = ref(1)
const limit = 10
const showModal = ref(false)
const editingStudent = ref<any>(null)
const deleteTarget = ref<any>(null)
const saving = ref(false)

const { data, pending, refresh } = await useAsyncData(
  'students',
  () => apiFetch<any>(`/students?page=${page.value}&limit=${limit}${search.value ? `&search=${encodeURIComponent(search.value)}` : ''}`),
  { watch: [page, search] }
)

const students = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)

const form = reactive({ name: '', age: 20, email: '', phone: '' })

function openAdd() {
  editingStudent.value = null
  Object.assign(form, { name: '', age: 20, email: '', phone: '' })
  showModal.value = true
}

function openEdit(s: any) {
  editingStudent.value = s
  Object.assign(form, { name: s.name, age: s.age, email: s.email || '', phone: s.phone || '' })
  showModal.value = true
}

async function saveStudent() {
  if (!form.name.trim() || !form.email.trim()) {
    toast.add({ title: 'Vui lòng nhập đầy đủ thông tin', color: 'error' })
    return
  }
  saving.value = true
  try {
    if (editingStudent.value) {
      await apiFetch(`/students/${editingStudent.value._id}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      })
      toast.add({ title: '✅ Đã cập nhật sinh viên', color: 'success' })
    } else {
      await apiFetch('/students', { method: 'POST', body: JSON.stringify(form) })
      toast.add({ title: '✅ Đã thêm sinh viên mới', color: 'success' })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: err?.data?.message || 'Có lỗi xảy ra', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteStudent() {
  if (!deleteTarget.value) return
  try {
    await apiFetch(`/students/${deleteTarget.value._id}`, { method: 'DELETE' })
    toast.add({ title: '🗑️ Đã xóa sinh viên', color: 'warning' })
    deleteTarget.value = null
    await refresh()
  } catch {
    toast.add({ title: 'Không thể xóa sinh viên', color: 'error' })
  }
}

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1 }, 400)
})

const columns = [
  { key: 'name', label: 'Họ tên' },
  { key: 'age', label: 'Tuổi' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'SĐT' },
  { key: 'actions', label: '' }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Danh sách Sinh viên</h1>
        <p class="text-sm text-gray-500">{{ total }} sinh viên trong hệ thống</p>
      </div>
      <UButton v-if="isAdmin" leading-icon="i-lucide-plus" @click="openAdd">
        Thêm sinh viên
      </UButton>
    </div>

    <!-- Search -->
    <div class="flex gap-3">
      <UInput
        v-model="search"
        placeholder="Tìm theo tên, email, SĐT..."
        leading-icon="i-lucide-search"
        class="max-w-sm"
      />
    </div>

    <!-- Table -->
    <UCard>
      <UTable
        :data="students"
        :columns="columns"
        :loading="pending"
      >
        <template #name-cell="{ row }">
          <NuxtLink :to="`/students/${row._id}`" class="flex items-center gap-3 group">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-700 dark:text-blue-300 font-bold text-xs">
                {{ (row.name || '?').charAt(0) }}
              </span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {{ row.name }}
            </span>
          </NuxtLink>
        </template>

        <template #actions-cell="{ row }">
          <div v-if="isAdmin" class="flex items-center justify-end gap-1">
            <NuxtLink :to="`/students/${row._id}`">
              <UButton icon="i-lucide-eye" variant="ghost" color="neutral" size="xs" />
            </NuxtLink>
            <UButton icon="i-lucide-pencil" variant="ghost" color="primary" size="xs" @click="openEdit(row)" />
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" @click="deleteTarget = row" />
          </div>
        </template>

        <template #empty>
          <div class="text-center py-12 text-gray-400">
            <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-3" />
            <p class="text-sm">{{ search ? 'Không tìm thấy sinh viên nào' : 'Chưa có sinh viên nào' }}</p>
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="total > limit" class="flex justify-center mt-4 pt-4 border-t dark:border-gray-800">
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="limit"
        />
      </div>
    </UCard>

    <!-- Add/Edit Modal -->
    <UModal v-model:open="showModal" :title="editingStudent ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'">
      <template #body>
        <div class="space-y-4 p-1">
          <UFormField label="Họ và tên" required>
            <UInput v-model="form.name" placeholder="Nguyễn Văn A" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Tuổi">
              <UInput v-model.number="form.age" type="number" min="1" max="100" class="w-full" />
            </UFormField>
            <UFormField label="Điện thoại">
              <UInput v-model="form.phone" placeholder="0905xxxxxx" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Email" required>
            <UInput v-model="form.email" type="email" placeholder="sv@ued.udn.vn" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">Hủy</UButton>
          <UButton :loading="saving" @click="saveStudent">
            {{ editingStudent ? 'Lưu thay đổi' : 'Thêm sinh viên' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete confirm modal -->
    <UModal :open="!!deleteTarget" :title="`Xóa sinh viên: ${deleteTarget?.name}`" @update:open="v => { if (!v) deleteTarget = null }">
      <template #body>
        <p class="text-gray-600 dark:text-gray-400">
          Bạn có chắc muốn xóa sinh viên <strong class="text-gray-900 dark:text-white">{{ deleteTarget?.name }}</strong>?
          Hành động này không thể hoàn tác.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="deleteTarget = null">Hủy</UButton>
          <UButton color="error" leading-icon="i-lucide-trash-2" @click="deleteStudent">Xóa</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
