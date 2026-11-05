// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
