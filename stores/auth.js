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

    const updateUserInfo = (newData) => {
        if (user.value && user.value.length > 0) {
            // 기존 user[0] 데이터에 새로운 데이터를 병합합니다.
            user.value[0] = {
                ...user.value[0],
                ...newData
            };
        }
    };

    const clearAuth = () => {
        token.value = null;
        user.value = null;
    };

    return { token, user, isLoggedIn, setAuth, updateUserInfo, clearAuth };
});
