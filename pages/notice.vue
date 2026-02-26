<template>
  <div class="block w-full min-h-screen bg-slate-50">

    <!-- ── 목록 화면 ── -->
    <div v-if="!selectedNotice" class="pb-24 space-y-4">

      <!-- 헤더 -->
      <div class="px-2 pt-2">
        <h2 class="text-3xl font-extrabold text-slate-800">📢 공지사항</h2>
        <p class="text-lg text-slate-400 font-semibold mt-1">회사의 주요 소식을 확인하세요</p>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-xl font-extrabold text-blue-500">불러오는 중...</p>
      </div>

      <!-- 공지 카드 -->
      <div v-else class="space-y-4">
        <div
            v-for="notice in notices"
            :key="notice.idx"
            @click="openNotice(notice)"
            :class="[
            'block w-full bg-white rounded-3xl border-2 shadow-md px-6 py-6 active:scale-95 transition-all cursor-pointer',
            notice.must === 'Y' ? 'border-red-200' : 'border-slate-100'
          ]"
        >
          <!-- 상단 뱃지 + 날짜 -->
          <div class="flex items-center justify-between mb-3">
            <span
                v-if="notice.must === 'Y'"
                class="bg-red-500 text-white text-base px-3 py-1 rounded-xl font-extrabold"
            >
              📌 필독
            </span>
            <span v-else class="bg-slate-100 text-slate-400 text-base px-3 py-1 rounded-xl font-bold">일반</span>
            <span class="text-base text-slate-400 font-bold">{{ formatDate(notice.regDt) }}</span>
          </div>

          <!-- 제목 -->
          <h4 class="text-2xl font-extrabold text-slate-800 leading-snug mb-2">{{ notice.title }}</h4>

          <!-- 내용 미리보기 -->
          <p class="text-lg text-slate-400 font-semibold line-clamp-2 leading-relaxed">{{ notice.content }}</p>

          <!-- 하단 조회수 + 화살표 -->
          <div class="flex items-center justify-between mt-4">
            <span class="text-base text-slate-300 font-bold">👁 {{ notice.views || 0 }}명이 읽었어요</span>
            <span class="text-2xl text-slate-300 font-black">›</span>
          </div>
        </div>

        <!-- 공지 없음 -->
        <div v-if="notices.length === 0" class="text-center py-20 text-xl text-slate-400 font-bold">
          등록된 공지사항이 없습니다.
        </div>
      </div>
    </div>

    <!-- ── 상세 화면 ── -->
    <div v-else class="fixed inset-0 z-[100] bg-white flex flex-col max-w-[500px] mx-auto">

      <!-- 상단 바 -->
      <div class="flex items-center justify-between px-5 py-5 border-b-2 border-slate-100">
        <button
            @click="selectedNotice = null"
            class="flex items-center gap-2 bg-slate-100 px-5 py-3 rounded-2xl active:bg-slate-200 transition-all"
        >
          <span class="text-2xl">‹</span>
          <span class="text-xl font-extrabold text-slate-600">목록</span>
        </button>
        <span class="text-xl font-extrabold text-slate-700">공지 상세</span>
        <div class="w-20" />
      </div>

      <!-- 본문 스크롤 영역 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">

        <!-- 뱃지 + 날짜 -->
        <div class="flex items-center gap-3">
          <span
              v-if="selectedNotice.must === 'Y'"
              class="bg-red-500 text-white text-lg px-4 py-1.5 rounded-xl font-extrabold"
          >
            📌 필독
          </span>
          <span class="text-lg text-slate-400 font-bold">{{ formatDate(selectedNotice.regDt) }}</span>
        </div>

        <!-- 제목 -->
        <h2 class="text-3xl font-extrabold text-slate-900 leading-tight">
          {{ selectedNotice.title }}
        </h2>

        <!-- 작성자 + 조회수 -->
        <div class="flex gap-4 text-base text-slate-400 font-bold">
          <span>✍️ {{ selectedNotice.author }}</span>
          <span>👁 {{ selectedNotice.views || 0 }}회</span>
        </div>

        <div class="w-full h-0.5 bg-slate-100" />

        <!-- 내용 -->
        <div class="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap font-semibold">
          {{ selectedNotice.content }}
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth'; // 스토어 임포트

const authStore = useAuthStore(); // 스토어 초기화

const selectedNotice = ref(null);
const isLoading = ref(false);

// DB 컬럼명 그대로 매핑: idx, must, type, title, content, regDt, author, target, views
const notices = ref([]);

// regDt → 읽기 쉬운 날짜 포맷
const formatDate = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const fetchNotices = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('/api/v1/notice/list');
    const result = response.data.data || [];

    // ✅ 3. 로그인한 유저의 직위 코드 가져오기
    // (이전 코드 흐름상 authStore.user[0] 안에 정보가 있었다면 authStore.user?.[0]?.positionCd 로 맞춰주세요)
    const userPositionCd = authStore.user?.position || authStore.user?.[0]?.position;

    // ✅ 4. 데이터 필터링 (target 컬럼 기준)
    notices.value = result.filter(notice => {
      const target = notice.target;

      // 대상이 아예 지정되지 않았거나, '전체' 혹은 'all'로 설정된 공지는 모두에게 노출
      if (!target || target === '전체' || target === 'all') {
        return true;
      }

      return target.includes(userPositionCd);
    });
  } catch (e) {
    console.error('공지사항 로드 실패:', e);
  } finally {
    isLoading.value = false;
  }
};

const openNotice = (notice) => {
  selectedNotice.value = notice;
};

onMounted(() => {
  fetchNotices();
});
</script>
