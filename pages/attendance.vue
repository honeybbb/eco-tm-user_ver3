<template>
  <div class="block w-full space-y-6 pb-20 bg-slate-50 min-h-screen">

    <!-- 헤더 카드 -->
    <div class="block w-full bg-blue-700 p-6 rounded-3xl text-white shadow-xl">
      <div class="flex justify-between items-center mb-8">
        <h3 class="font-extrabold text-2xl tracking-tight">{{ selectedYear }}년 {{ selectedMonth }}월</h3>

        <!-- ✅ 큰 버튼으로 교체 -->
        <button
            @click="openMonthPicker"
            class="bg-white text-blue-800 px-5 py-4 rounded-2xl font-extrabold text-xl shadow-md active:bg-slate-200 transition-colors flex items-center gap-2"
        >
          📅 <span>월 변경</span>
        </button>
      </div>

      <div class="flex justify-around text-center border-t-2 border-white/20 pt-6">
        <div>
          <p class="text-base font-medium opacity-90 mb-1">한 달 출근</p>
          <p class="text-4xl font-black">{{ totalWorkDays }}<span class="text-xl font-normal ml-1">일</span></p>
        </div>
        <div>
          <p class="text-base font-medium opacity-90 mb-1">총 근무시간</p>
          <p class="text-4xl font-black">{{ totalWorkHours }}<span class="text-xl font-normal ml-1">시간</span></p>
        </div>
      </div>
    </div>

    <!-- ✅ 노인 친화형 월 선택 모달 -->
    <Teleport to="body">
      <div
          v-if="showMonthPicker"
          class="fixed inset-0 z-50 flex items-end justify-center"
          @click.self="closeMonthPicker"
      >
        <!-- 배경 딤 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeMonthPicker" />

        <!-- 모달 본체 -->
        <div class="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-10 animate-slide-up">

          <!-- 상단 핸들 & 닫기 -->
          <div class="flex items-center justify-between mb-6">
            <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
            <p class="text-2xl font-extrabold text-slate-800">📅 월 선택</p>
            <button
                @click="closeMonthPicker"
                class="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-2xl font-bold active:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <!-- 연도 선택 -->
          <div class="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-3 mb-6">
            <button
                @click="changePickerYear(-1)"
                class="w-14 h-14 bg-white rounded-xl shadow text-3xl font-black text-blue-700 flex items-center justify-center active:bg-blue-100"
            >
              ‹
            </button>
            <span class="text-3xl font-black text-blue-800">{{ pickerYear }}년</span>
            <button
                @click="changePickerYear(1)"
                class="w-14 h-14 bg-white rounded-xl shadow text-3xl font-black text-blue-700 flex items-center justify-center active:bg-blue-100"
            >
              ›
            </button>
          </div>

          <!-- 월 그리드 (3열 4행) -->
          <div class="grid grid-cols-3 gap-3">
            <button
                v-for="m in 12"
                :key="m"
                @click="selectMonth(m)"
                :class="[
                'py-5 rounded-2xl text-2xl font-extrabold transition-all active:scale-95 border-2',
                isSelectedMonth(m)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-slate-700 border-slate-200 shadow-sm'
              ]"
            >
              {{ m }}월
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 상세 근무 내역 -->
    <div class="block w-full mt-8">
      <h4 class="text-xl font-black text-slate-900 mb-4 px-2">📅 상세 근무 내역</h4>

      <div v-if="isLoading" class="text-center py-12 text-lg text-blue-600 font-bold">
        데이터를 불러오는 중입니다...
      </div>

      <div v-else class="space-y-4">
        <div v-for="record in attendanceHistory" :key="record.date"
             class="block w-full bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-md">

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-slate-100 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-slate-200">
                <span class="text-sm font-bold mb-1" :class="getDayLabelColor(record.day)">{{ record.day }}요일</span>
                <span class="text-2xl font-black" :class="getDateNumberColor(record.day)">{{ record.dateOnly }}</span>
              </div>

              <div class="flex flex-col justify-center">
                <span class="font-extrabold text-slate-900 text-xl mb-1">{{ record.status }}</span>
                <span class="text-lg text-slate-700 font-bold tracking-tight">
                  {{ record.checkIn }} ~ {{ record.checkOut }}
                </span>
              </div>
            </div>

            <div class="text-right">
              <span class="text-lg font-extrabold text-blue-800 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                {{ record.workingHours }}시간
              </span>
            </div>
          </div>
        </div>

        <div v-if="attendanceHistory.length === 0" class="text-center py-12 text-lg text-slate-500 font-bold bg-white rounded-2xl border-2 border-dashed border-slate-300">
          이번 달 근무 기록이 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore();

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

// ✅ 모달 상태
const showMonthPicker = ref(false);
const pickerYear = ref(now.getFullYear());

const openMonthPicker = () => {
  pickerYear.value = selectedYear.value;
  showMonthPicker.value = true;
};

const closeMonthPicker = () => {
  showMonthPicker.value = false;
};

const changePickerYear = (delta) => {
  pickerYear.value += delta;
};

const isSelectedMonth = (m) => {
  return pickerYear.value === selectedYear.value && m === selectedMonth.value;
};

const selectMonth = (m) => {
  console.log(m, '월 선택')
  selectedYear.value = pickerYear.value;
  selectedMonth.value = m;
  closeMonthPicker();
  getAttendanceHistory();
};

// ==========================================

const attendanceHistory = ref([]);
const isLoading = ref(false);

const totalWorkDays = computed(() => {
  return attendanceHistory.value.filter(record => record.checkIn !== '-').length;
});

const totalWorkHours = computed(() => {
  const total = attendanceHistory.value.reduce((acc, record) => {
    const hours = parseFloat(record.workingHours);
    return acc + (isNaN(hours) ? 0 : hours);
  }, 0);
  return Number.isInteger(total) ? total : total.toFixed(1);
});

const getDayLabelColor = (day) => {
  if (day === '일') return 'text-red-400';
  if (day === '토') return 'text-blue-400';
  return 'text-slate-400';
};

const getDateNumberColor = (day) => {
  if (day === '일') return 'text-red-600';
  if (day === '토') return 'text-blue-600';
  return 'text-slate-700';
};

const getMonthRange = (year, month) => {
  const startDt = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDt = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDt, endDt };
};

const getAttendanceHistory = async () => {
  isLoading.value = true;
  const mIdx = authStore.user?.[0].idx;
  const { startDt, endDt } = getMonthRange(selectedYear.value, selectedMonth.value);
  console.log(startDt, endDt, 'aaaa')

  try {
    const response = await axios.get(`/api/v1/work/sheet/${mIdx}`, {
      params: { startDt, endDt }
    });

    if (response.data && response.data.data) {
      attendanceHistory.value = response.data.data.map(item => {
        const d = new Date(item.date);
        return {
          date: item.date,
          dateOnly: String(d.getDate()).padStart(2, '0'),
          day: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
          status: item.workType === 'work' ? '근무' : '특근',
          checkIn: item.workin || '-',
          checkOut: item.workout || '-',
          workingHours: item.duration || '0'
        }
      });
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getAttendanceHistory();
});
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
