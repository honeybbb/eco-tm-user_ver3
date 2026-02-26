// composables/useAuth.js
import { useAuthStore } from '~/stores/auth';

export const useAuth = () => {
    const authStore = useAuthStore();

    const login = (data) => {
        // Pinia 스토어의 setAuth 실행 (여기서 쿠키가 구워짐)
        authStore.setAuth({
            token: data.token,
            user: data.data // 서버 응답 구조에 맞게 수정
        });

        // 로그인 성공 후 메인으로 이동
        return navigateTo('/');
    };

    return { login };
};
