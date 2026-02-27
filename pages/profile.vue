<template>
  <!-- 로딩 -->
  <div v-if="isFetching" class="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
    <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <p class="text-2xl font-extrabold text-blue-600">정보를 불러오는 중...</p>
  </div>

  <!-- 본문 -->
  <div v-else class="block w-full min-h-screen bg-slate-50 pb-24 space-y-5">

    <!-- 프로필 카드 -->
    <div class="bg-blue-700 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center text-center">
      <!-- 아바타 -->
      <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 text-5xl border-4 border-white/40">
        {{ employee.gender === 'M' ? '👨' : '👩' }}
      </div>
      <h3 class="text-3xl font-extrabold tracking-tight">{{ employee.name }}</h3>
      <p class="text-blue-200 text-lg font-bold mt-1">사번: {{ employee.id }}</p>

      <!-- 재직 뱃지 -->
      <div class="mt-4 bg-white/20 rounded-2xl px-6 py-2">
        <span class="text-white text-xl font-extrabold">{{ employee.position || '직위 미지정' }}</span>
      </div>
    </div>

    <!-- 개인 정보 섹션 -->
    <div class="bg-white rounded-3xl shadow-md border-2 border-slate-100 overflow-hidden">
      <div class="bg-slate-100 px-6 py-4">
        <p class="text-xl font-extrabold text-slate-600">👤 개인 정보</p>
      </div>

      <div class="divide-y-2 divide-slate-100">
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">연락처</span>
          <span class="text-xl font-extrabold text-slate-800 text-right">{{ employee.phone || '-' }}</span>
        </div>
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">이메일</span>
          <span class="text-lg font-extrabold text-slate-800 text-right break-all">{{ employee.email || '-' }}</span>
        </div>
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">성별</span>
          <span class="text-xl font-extrabold text-slate-800">{{ employee.gender === 'M' ? '남성' : '여성' }}</span>
        </div>
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">생년월일</span>
          <span class="text-xl font-extrabold text-slate-800">{{ formatDate(employee.birthDate) }}</span>
        </div>
        <div class="flex flex-col gap-2 px-6 py-5">
          <span class="text-xl font-bold text-slate-500">주소</span>
          <span class="text-xl font-extrabold text-slate-800 leading-relaxed">{{ employee.address || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 근무 정보 섹션 -->
    <div class="bg-white rounded-3xl shadow-md border-2 border-blue-100 overflow-hidden">
      <div class="bg-blue-50 px-6 py-4">
        <p class="text-xl font-extrabold text-blue-700">💼 근무 정보</p>
      </div>

      <div class="divide-y-2 divide-slate-100">
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">입사일</span>
          <span class="text-xl font-extrabold text-blue-800">{{ formatDate(employee.joinDate) }}</span>
        </div>
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">근무현장</span>
          <span class="text-xl font-extrabold text-blue-800 text-right">{{ employee.siteName || employee.site || '-' }}</span>
        </div>
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">직위</span>
          <span class="text-xl font-extrabold text-blue-800">{{ employee.position || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 급여 정보 섹션 -->
    <div class="bg-white rounded-3xl shadow-md border-2 border-green-100 overflow-hidden">
      <div class="bg-green-50 px-6 py-4">
        <p class="text-xl font-extrabold text-green-700">🏦 급여 정보</p>
      </div>

      <div class="divide-y-2 divide-slate-100">
        <div class="flex justify-between items-center px-6 py-5">
          <span class="text-xl font-bold text-slate-500 shrink-0 w-28">은행</span>
          <span class="text-xl font-extrabold text-green-800">{{ employee.bankName || '-' }}</span>
        </div>
        <div class="flex flex-col gap-2 px-6 py-5">
          <span class="text-xl font-bold text-slate-500">계좌번호</span>
          <span class="text-xl font-extrabold text-green-800 tracking-widest">{{ employee.accountNumber || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 비고 (있을 때만) -->
    <div v-if="employee.bigo" class="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 shadow-md">
      <p class="text-xl font-extrabold text-amber-700 mb-2">📝 비고</p>
      <p class="text-xl font-bold text-amber-900 leading-relaxed">{{ employee.bigo }}</p>
    </div>

    <button
        @click="handleLogout"
        class="w-full py-5 rounded-3xl text-2xl font-extrabold border-2 border-red-200 text-red-500 bg-red-50 active:bg-red-100 transition-all mt-4"
    >
      🚪 로그아웃
    </button>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ middleware: ['auth'] });

const authStore = useAuthStore();
const isFetching = ref(true);

const employee = ref({
  name: '', id: '', phone: '', email: '',
  birthDate: '', address: '', site: '', siteName: '',
  position: '', joinDate: '', status: '', gender: '',
  bankName: '', accountNumber: '', bigo: '',
  departureDate: '', departureReason: '',
});

// YYYY-MM-DD → YYYY년 MM월 DD일
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
};

const getMemberData = async () => {
  isFetching.value = true;
  const userId = authStore.user?.[0].id;
  if (!userId) throw new Error('유저 정보를 찾을 수 없습니다.');

  const data = authStore.user?.[0];
  employee.value = {
    name: data.name || '',
    id: data.id || '',
    phone: data.phone || '',
    email: data.email || '',
    birthDate: data.birthDt ? data.birthDt.split('T')[0] : '',
    address: data.addr || '',
    joinDate: data.inDate ? data.inDate.split('T')[0] : '',
    status: data.status || '',
    gender: data.gender || '',
    bankName: data.bank || '',
    accountNumber: data.accountNo || '',
    bigo: data.bigo || '',
    departureDate: data.departureDate ? data.departureDate.split('T')[0] : '',
    departureReason: data.departureReason || '',
  };

  try {
    const res = await axios.get(`/api/v1/member/data/${userId}`);
    if (res.data.data.length > 0) {
      const d = res.data.data[0];

      authStore.updateUserInfo({
        positionCd: d.positionCd
      });

      employee.value = {
        ...employee.value,
        site: d.siteName || '',
        siteName: JSON.parse(d.sites)[0]?.name || '',
        position: d.position || employee.value.position || '',
      };
    }
  } catch (error) {
    console.error('직원 정보 로드 실패:', error);
  } finally {
    isFetching.value = false;
  }
};

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.clearAuth()
    navigateTo('/login')
  }
}

onMounted(() => getMemberData());
</script>
