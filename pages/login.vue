<template>
  <div class="login-container">
    <h2>🔑 에코그린티엠 직원 로그인</h2>
    <form @submit.prevent="handleLogin">
      <input type="text" v-model="form.username" placeholder="사번 또는 ID" required />
      <input type="password" v-model="form.password" placeholder="비밀번호" required />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
      <p class="error-message" v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

// Nuxt의 인증 미들웨어(middleware)를 사용하여 로그인 페이지 접근 시 인증 상태를 검사합니다.
definePageMeta({
  middleware: ['guest-only'] // 로그인된 사용자는 접근 불가
})

const { login } = useAuth();
const form = ref({ username: '', password: '' });
const isLoading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    // 실제 백엔드 API 호출
    const response = await axios.post('/api/v1/member/auth', {
      id: form.value.username,
      password: form.value.password
    });

    // 성공 시 토큰을 저장하고 메인으로 이동
    login(response.data.data);

  } catch (err) {
    console.error('Login Failed:', err);
    error.value = '로그인 실패: 사번 또는 비밀번호를 확인해주세요.';
    // 예시를 위해 실패 시에도 임시로 로그인 처리
    login('temp_token');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 로그인 스타일은 이전과 동일하게 적용 */
.login-container { padding: 40px 20px; text-align: center; max-width: 400px; margin: auto; }
input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
button { width: 100%; padding: 15px; margin-top: 20px; background-color: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
.error-message { color: red; margin-top: 10px; }
</style>
