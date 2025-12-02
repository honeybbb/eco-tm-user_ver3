// middleware/guest-only.js
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        if (localStorage.getItem('user_token')) {
            // 토큰이 있으면 메인 페이지로 리다이렉트
            return navigateTo('/');
        }
    }
});
