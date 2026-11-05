// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
