// composables/useAuth.js

import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 실제는 Pinia 또는 useState를 사용하여 전역 상태 관리
const isLoggedIn = ref(false);

export const useAuth = () => {
    const router = useRouter();

    // 초기 로드 시 토큰 확인
    const checkAuth = () => {
        if (process.client) { // 클라이언트 측에서만 실행
            isLoggedIn.value = !!localStorage.getItem('user_token');
        }
    };
    checkAuth();

    const login = (user) => {
        if (process.client) {
            delete user.password;
            localStorage.setItem('user_data', JSON.stringify(user));
            localStorage.setItem('user_token', user.token);
            isLoggedIn.value = true;
        }
        router.push('/');
    };

    const logout = () => {
        if (process.client) {
            localStorage.removeItem('user_token');
            isLoggedIn.value = false;
        }
        router.push('/login');
    };

    return {
        isLoggedIn,
        login,
        logout,
        checkAuth
    };
};
