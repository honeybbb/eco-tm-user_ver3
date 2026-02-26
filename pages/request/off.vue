<template>
  <div class="block w-full min-h-screen bg-slate-50 pb-24 space-y-5">

    <!-- 상단 타이틀 -->
    <div class="bg-green-600 rounded-3xl p-6 text-white shadow-xl">
      <h3 class="text-3xl font-extrabold tracking-tight mb-1">🌿 연차 신청</h3>
      <p class="text-green-100 text-lg font-medium">아래 내용을 입력하고 신청해주세요</p>

      <!-- 남은 연차 강조 표시 -->
      <div class="mt-5 bg-white/20 rounded-2xl px-5 py-4 flex items-center justify-between">
        <span class="text-white text-xl font-bold">남은 연차</span>
        <span class="text-white text-4xl font-black">12<span class="text-xl font-normal ml-1">일</span></span>
      </div>
    </div>

    <!-- ① 연차 종류 -->
    <!--div class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100">
      <label class="block text-xl font-extrabold text-slate-700 mb-4">📋 연차 종류</label>
      <div class="grid grid-cols-1 gap-3">
        <button
            v-for="type in leaveTypes"
            :key="type.value"
            @click="selectedType = type.value"
            :class="[
            'w-full py-5 rounded-2xl text-2xl font-extrabold border-2 transition-all active:scale-95',
            selectedType === type.value
              ? 'bg-green-600 text-white border-green-600 shadow-lg'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          ]"
        >
          {{ type.label }}
        </button>
      </div>
    </div-->

    <!-- ② 시작일 -->
    <div class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100">
      <label class="block text-xl font-extrabold text-slate-700 mb-4">📅 시작일</label>
      <button
          @click="openDatePicker('start')"
          :class="[
          'w-full py-5 rounded-2xl text-2xl font-extrabold border-2 transition-all active:scale-95 text-left px-6 flex items-center justify-between',
          startDt ? 'bg-green-50 border-green-400 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-400'
        ]"
      >
        <span>{{ startDt ? formatDisplay(startDt) : '날짜를 선택하세요' }}</span>
        <!--span class="text-3xl">{{ startDt ? '✓' : '›' }}</span-->
      </button>
    </div>

    <!-- ③ 종료일 -->
    <div class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100">
      <label class="block text-xl font-extrabold text-slate-700 mb-4">📅 종료일</label>
      <button
          @click="openDatePicker('end')"
          :class="[
          'w-full py-5 rounded-2xl text-2xl font-extrabold border-2 transition-all active:scale-95 text-left px-6 flex items-center justify-between',
          endDt ? 'bg-green-50 border-green-400 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-400'
        ]"
      >
        <span>{{ endDt ? formatDisplay(endDt) : '날짜를 선택하세요' }}</span>
        <span class="text-3xl">{{ endDt ? '✓' : '›' }}</span>
      </button>
    </div>

    <!-- 신청 기간 표시 -->
    <div v-if="startDt && endDt" class="bg-green-50 rounded-2xl px-6 py-4 border-2 border-green-200 flex items-center justify-between">
      <span class="text-lg font-bold text-green-700">신청 기간</span>
      <span class="text-2xl font-extrabold text-green-800">{{ leaveDays }}일</span>
    </div>

    <!-- ④ 사유 -->
    <div class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100">
      <label class="block text-xl font-extrabold text-slate-700 mb-4">✏️ 사유</label>
      <textarea
          v-model="reason"
          rows="3"
          placeholder="사유를 입력해주세요 (선택)"
          class="w-full border-2 border-slate-200 rounded-2xl p-4 text-xl font-bold text-slate-700 bg-slate-50 resize-none focus:outline-none focus:border-green-400"
      />
    </div>

    <!-- 신청 버튼 -->
    <button
        @click="handleSubmit"
        class="w-full bg-green-600 text-white py-6 rounded-3xl text-3xl font-extrabold shadow-xl active:bg-green-700 active:scale-95 transition-all"
    >
      ✅ 신청하기
    </button>


    <!-- ✅ 날짜 선택 모달 (노인 친화형 달력) -->
    <Teleport to="body">
      <div v-if="showDateModal" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="closeDatePicker">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDatePicker" />

        <div class="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl px-5 pt-6 pb-10 animate-slide-up">

          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-5">
            <p class="text-2xl font-extrabold text-slate-800">
              {{ dateModalTarget === 'start' ? '📅 시작일 선택' : '📅 종료일 선택' }}
            </p>
            <button @click="closeDatePicker" class="w-12 h-12 bg-slate-100 rounded-full text-slate-500 text-2xl font-bold flex items-center justify-center active:bg-slate-200">
              ✕
            </button>
          </div>

          <!-- 연/월 이동 -->
          <div class="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3 mb-4">
            <button @click="changeCalMonth(-1)" class="w-14 h-14 bg-white rounded-xl shadow text-3xl font-black text-green-700 flex items-center justify-center active:bg-green-100">‹</button>
            <span class="text-2xl font-extrabold text-green-800">{{ calYear }}년 {{ calMonth }}월</span>
            <button @click="changeCalMonth(1)" class="w-14 h-14 bg-white rounded-xl shadow text-3xl font-black text-green-700 flex items-center justify-center active:bg-green-100">›</button>
          </div>

          <!-- 요일 헤더 -->
          <div class="grid grid-cols-7 mb-2">
            <div v-for="d in ['일','월','화','수','목','금','토']" :key="d"
                 :class="['text-center text-base font-extrabold py-1', d==='일'?'text-red-400':d==='토'?'text-blue-400':'text-slate-400']">
              {{ d }}
            </div>
          </div>

          <!-- 날짜 그리드 -->
          <div class="grid grid-cols-7 gap-1">
            <!-- 앞 빈칸 -->
            <div v-for="n in calStartBlank" :key="'b'+n" />
            <!-- 날짜 -->
            <button
                v-for="day in calDaysInMonth"
                :key="day"
                @click="selectDate(day)"
                :class="[
                'aspect-square flex items-center justify-center rounded-xl text-xl font-extrabold transition-all active:scale-90',
                isCalSelected(day) ? 'bg-green-600 text-white shadow-lg' : '',
                isInRange(day) && !isCalSelected(day) ? 'bg-green-100 text-green-800' : '',
                !isCalSelected(day) && !isInRange(day) ? getDayColor(calYear, calMonth, day) : ''
              ]"
            >
              {{ day }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

const leaveTypes = [
  { value: 'annual', label: '🌿 연차' },
  { value: 'half_am', label: '🌅 반차 (오전)' },
  { value: 'half_pm', label: '🌇 반차 (오후)' },
];

const selectedType = ref('annual');
const startDt = ref('');
const endDt = ref('');
const reason = ref('');
const mIdx = 1;

// ── 날짜 포맷 ──────────────────────────────
const formatDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const days = ['일','월','화','수','목','금','토'];
  const dow = days[new Date(dateStr).getDay()];
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${dow})`;
};

const leaveDays = computed(() => {
  if (!startDt.value || !endDt.value) return 0;
  const diff = (new Date(endDt.value) - new Date(startDt.value)) / (1000 * 60 * 60 * 24);
  return diff < 0 ? 0 : diff + 1;
});

// ── 달력 모달 ──────────────────────────────
const showDateModal = ref(false);
const dateModalTarget = ref('start'); // 'start' | 'end'

const now = new Date();
const calYear = ref(now.getFullYear());
const calMonth = ref(now.getMonth() + 1);

const openDatePicker = (target) => {
  dateModalTarget.value = target;
  // 해당 필드에 이미 날짜가 있으면 그 달로
  const existing = target === 'start' ? startDt.value : endDt.value;
  if (existing) {
    const [y, m] = existing.split('-');
    calYear.value = parseInt(y);
    calMonth.value = parseInt(m);
  } else {
    calYear.value = now.getFullYear();
    calMonth.value = now.getMonth() + 1;
  }
  showDateModal.value = true;
};

const closeDatePicker = () => { showDateModal.value = false; };

const changeCalMonth = (delta) => {
  let m = calMonth.value + delta;
  let y = calYear.value;
  if (m > 12) { m = 1; y++; }
  if (m < 1)  { m = 12; y--; }
  calMonth.value = m;
  calYear.value = y;
};

const calDaysInMonth = computed(() => new Date(calYear.value, calMonth.value, 0).getDate());
const calStartBlank = computed(() => new Date(calYear.value, calMonth.value - 1, 1).getDay());

const toDateStr = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

const isCalSelected = (day) => {
  const ds = toDateStr(calYear.value, calMonth.value, day);
  return ds === startDt.value || ds === endDt.value;
};

const isInRange = (day) => {
  if (!startDt.value || !endDt.value) return false;
  const ds = toDateStr(calYear.value, calMonth.value, day);
  return ds > startDt.value && ds < endDt.value;
};

const getDayColor = (y, m, d) => {
  const dow = new Date(y, m - 1, d).getDay();
  if (dow === 0) return 'text-red-500';
  if (dow === 6) return 'text-blue-500';
  return 'text-slate-700';
};

const selectDate = (day) => {
  const ds = toDateStr(calYear.value, calMonth.value, day);
  if (dateModalTarget.value === 'start') {
    startDt.value = ds;
    // 종료일이 시작일보다 앞이면 초기화
    if (endDt.value && endDt.value < ds) endDt.value = '';
  } else {
    if (startDt.value && ds < startDt.value) {
      alert('종료일은 시작일 이후여야 합니다.');
      return;
    }
    endDt.value = ds;
  }
  closeDatePicker();
};

// ── 신청 ───────────────────────────────────
const handleSubmit = () => {
  if (!startDt.value || !endDt.value) {
    alert('연차 시작일과 종료일을 선택해주세요.');
    return;
  }

  const params = {
    mIdx,
    sIdx: 3,
    workType: selectedType.value,
    startDt: startDt.value,
    endDt: endDt.value,
    reason: reason.value,
  };

  axios.post(`/api/v1/member/off/request/${mIdx}`, params)
      .then(() => {
        alert('연차 신청이 완료되었습니다.');
        startDt.value = '';
        endDt.value = '';
        reason.value = '';
        selectedType.value = 'annual';
      })
      .catch(err => {
        console.error('신청 실패:', err);
        alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
};
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
}
</style>
