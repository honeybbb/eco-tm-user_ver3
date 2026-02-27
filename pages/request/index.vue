<template>
  <div class="block w-full min-h-screen bg-slate-50 pb-24 space-y-5">

    <!-- 헤더 -->
    <div class="px-2 pt-2">
      <h2 class="text-3xl font-extrabold text-slate-800">📋 신청 및 결재</h2>
      <p class="text-lg text-slate-400 font-semibold mt-1">신청할 항목을 선택해 주세요</p>
    </div>

    <!-- 메뉴 카드 목록 -->
    <div class="grid grid-cols-1 gap-4">

      <!-- 연차 신청 -->
      <NuxtLink to="/request/off"
                class="flex items-center justify-between bg-white px-6 py-7 rounded-3xl border-2 border-slate-100 shadow-md active:bg-slate-50 active:scale-95 transition-all"
      >
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl shrink-0">
            🏝️
          </div>
          <div>
            <p class="text-2xl font-extrabold text-slate-800">연차 신청</p>
            <p class="text-lg text-blue-500 font-bold mt-1">잔여 연차: 12일</p>
          </div>
        </div>
        <span class="text-3xl text-slate-300 font-black">›</span>
      </NuxtLink>

      <!-- 피복 신청 -->
      <NuxtLink
          v-if="positionCd == '01002001' || positionCd == '01002003'"
          to="/request/uniform"
                class="flex items-center justify-between bg-white px-6 py-7 rounded-3xl border-2 border-slate-100 shadow-md active:bg-slate-50 active:scale-95 transition-all"
      >
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-4xl shrink-0">
            👕
          </div>
          <div>
            <p class="text-2xl font-extrabold text-slate-800">피복 신청</p>
            <p class="text-lg text-slate-400 font-bold mt-1">작업복, 안전화 등 신청</p>
          </div>
        </div>
        <span class="text-3xl text-slate-300 font-black">›</span>
      </NuxtLink>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const positionCd = computed(() => authStore.user?.[0]?.positionCd);

</script>
