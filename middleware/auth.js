// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        if (!localStorage.getItem('user_token')) {
            // 토큰이 없으면 로그인 페이지로 리다이렉트
            return navigateTo('/login');
        }
    }
});
