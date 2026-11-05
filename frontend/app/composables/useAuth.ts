// composables/useAuth.ts
interface User {
  id?: string
  _id?: string
  username: string
  role: 'ADMIN' | 'USER'
}

export function useAuth() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    secure: false,
    sameSite: 'lax'
  })
  const user = useState<User | null>('auth_user', () => null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(username: string, password: string) {
    const data = await $fetch<{ token: string; user: User }>(`${apiBase}/auth/login`, {
      method: 'POST',
      body: { username, password }
    })
    token.value = data.token
    user.value = data.user
    return data
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const data = await $fetch<User>(`${apiBase}/profile`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = data
    } catch {
      token.value = null
      user.value = null
    }
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, token, isLoggedIn, isAdmin, login, fetchMe, logout }
}
