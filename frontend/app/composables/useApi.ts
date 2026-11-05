// composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  function getToken(): string | null {
    if (import.meta.client) {
      return useCookie('auth_token').value || null
    }
    return null
  }

  function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    return $fetch<T>(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...((options.headers as Record<string, string>) || {})
      }
    } as Parameters<typeof $fetch>[1])
  }

  return { apiFetch, apiBase, getHeaders, getToken }
}
