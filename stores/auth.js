// stores/auth.js
import {defineStore} from 'pinia';

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie('user_token'); // 쿠키와 연동
    const user = useCookie('user_info', {
        default: () => null // 초기값은 null
    });

    const isLoggedIn = computed(() => !!token.value);

    const setAuth = (authData) => {
        token.value = authData.token;
        user.value = authData.user;
    };

    const clearAuth = () => {
        token.value = null;
        user.value = null;
    };

    return { token, user, isLoggedIn, setAuth, clearAuth };
});
