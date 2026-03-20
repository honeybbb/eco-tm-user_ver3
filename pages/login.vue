<template>
  <div class="min-h-[100dvh] bg-white flex flex-col justify-center px-6 py-12">

    <div class="w-full max-w-sm mx-auto">

      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mb-5">
          <span class="text-4xl">🔑</span>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">에코그린티엠</h2>
        <p class="text-base font-semibold text-slate-400 mt-2">직원 전용 로그인</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">

        <div>
          <label class="block text-sm font-bold text-slate-500 mb-2 ml-1">사번 또는 ID</label>
          <input
              type="text"
              v-model="form.username"
              placeholder="아이디를 입력하세요"
              required
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 mb-2 ml-1">비밀번호</label>
          <input
              type="password"
              v-model="form.password"
              placeholder="비밀번호를 입력하세요"
              required
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-500 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2 mt-2">
          <span class="text-lg leading-none mt-0.5">⚠️</span>
          <p class="text-sm font-bold leading-snug">{{ error }}</p>
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white rounded-2xl text-lg font-extrabold transition-all mt-6"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            로그인 중...
          </span>
          <span v-else>로그인</span>
        </button>
      </form>

      <p class="mt-10 text-center text-slate-400 font-semibold text-sm">
        계정 분실 시 관리자에게 문의하세요.
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth.js';

// Nuxt 미들웨어 설정
definePageMeta({
  layout: 'empty',
  middleware: ['guest-only']
});

const { login } = useAuth();
const form = ref({ username: '', password: '' });
const isLoading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    const data = await $fetch('/api/v1/auth/member', {
      method: 'POST',
      body: {
        id: form.value.username,
        password: form.value.password
      }
    });

    await login(data);

  } catch (err) {
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
