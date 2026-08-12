// middleware/guest-only.js
export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('eco_user_token');

    if (token.value) {
        return navigateTo('/');
    }
});
