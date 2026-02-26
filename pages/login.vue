<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuth } from '~/composables/useAuth.js';

// Nuxt의 인증 미들웨어(middleware)를 사용하여 로그인 페이지 접근 시 인증 상태를 검사합니다.
definePageMeta({
  layout: 'empty',
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
    // 1. axios 대신 Nuxt 내장 $fetch 사용 권장
    const data = await $fetch('/api/v1/auth/member', {
      method: 'POST',
      body: {
        id: form.value.username,
        password: form.value.password
      }
    });

    // 2. 성공 시에만 login 실행
    // data 안에 token과 필요한 user 정보만 들어있어야 함
    await login(data);

  } catch (err) {
    // 3. 에러 발생 시 사용자에게 명확한 메시지만 전달
    const status = err.response?.status;
    if (status === 401) {
      error.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
    } else {
      error.value = '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

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

<style scoped>
.login-container {
  padding: 60px 20px;
  text-align: center;
  max-width: 500px; /* 조금 더 넓게 */
  margin: auto;
}

/* 제목을 아주 크게 */
h2 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #333;
}

/* 입력창 위 설명 글씨 */
.input-label {
  text-align: left;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-left: 5px;
  color: #555;
}

/* 입력창 크기와 글씨 확대 */
input {
  width: 100%;
  padding: 20px; /* 터치하기 편하게 높이 확대 */
  margin-bottom: 25px;
  border: 2px solid #bbb; /* 테두리를 더 진하게 */
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 22px; /* 입력하는 글씨도 크게 */
}

/* 버튼을 더 크고 선명하게 */
button {
  width: 100%;
  padding: 22px;
  margin-top: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 24px; /* 버튼 글씨 확대 */
  font-weight: bold;
  cursor: pointer;
}

button:active {
  background-color: #0056b3; /* 눌렀을 때 색상 변화만 살짝 */
}

/* 에러 메시지도 잘 보이게 */
.error-message {
  color: #e53e3e;
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
}
</style>
