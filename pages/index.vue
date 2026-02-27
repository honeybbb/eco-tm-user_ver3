<template>
  <div class="block w-full space-y-6 pb-20">
    <div class="block w-full bg-blue-50 p-8 rounded-[2.5rem] text-center shadow-sm border border-blue-100 relative overflow-hidden">
      <p class="text-blue-500 font-bold text-lg mb-2">{{ today }}</p>
      <h2 class="text-5xl font-black text-blue-900 mb-8">{{ currentTime }}</h2>

      <div class="mb-6">
        <div v-if="isLocationLoading" class="text-base text-slate-400 animate-pulse font-bold">
          📍 현장 위치 확인 중...
        </div>
        <div v-else-if="isInRange" class="text-base text-emerald-600 font-bold bg-emerald-100 py-3 rounded-full inline-block px-6 border border-emerald-200">
          ✅ 현장 근무지 도착
        </div>
        <div v-else class="text-base text-red-500 font-bold bg-red-100 py-3 rounded-full inline-block px-6 border border-red-200">
          ⚠️ 현장 밖 (기록 불가)
        </div>
      </div>

      <div v-if="isInRange" class="grid grid-cols-1 gap-5">
        <div v-if="isWorkStarted"
             class="bg-slate-200 text-slate-500 py-10 rounded-[2rem] font-black text-3xl border-2 border-slate-300">
          ✅ 출근 완료
        </div>

        <button v-else
                @click="openAttendanceSelector"
                class="bg-blue-600 text-white py-10 rounded-[2rem] font-black text-3xl shadow-xl shadow-blue-200 active:scale-95 transition-transform">
          출근하기
        </button>

        <button @click="handleAttendance('leave')"
                class="bg-slate-700 text-white py-6 rounded-[2rem] font-black text-xl active:scale-95 transition-transform">
          퇴근하기
        </button>
      </div>

      <div v-else class="py-6 text-xl text-slate-500 font-bold leading-relaxed">
        지정된 현장 100m 이내에서만<br>
        <span class="text-red-500 text-2xl">출근과 퇴근</span>이 가능합니다.
      </div>
    </div>

    <!--div class="grid grid-cols-2 gap-4">
      <NuxtLink v-if="positionCd == '01002001' || positionCd == '01002003'" to="/request/off" class="menu-item">연차 신청</NuxtLink>
      <NuxtLink to="/request/uniform" class="menu-item">피복 신청</NuxtLink>
    </div-->

    <div v-if="showSelector" class="fixed inset-0 bg-black/70 flex items-end z-50">
      <div class="bg-white w-full rounded-t-[3rem] p-8 pb-12 space-y-6 animate-slide-up shadow-2xl">
        <div v-if="step === 1" class="space-y-6">
          <div class="text-center">
            <h3 class="text-3xl font-black text-slate-800">어떤 출근인가요?</h3>
            <p class="text-slate-500 text-lg mt-2 font-bold">아래 버튼 중 하나를 누르세요</p>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <button @click="handleAttendance('work')" class="w-full bg-blue-600 text-white py-10 rounded-[2rem] text-3xl font-black">🏠 일반 출근</button>
            <button @click="step = 2" class="w-full bg-orange-500 text-white py-10 rounded-[2rem] text-3xl font-black">🔥 특근 / 대근</button>
            <button @click="closeModal" class="w-full py-6 text-slate-400 font-black text-xl mt-2">창 닫기</button>
          </div>
        </div>

        <div v-if="step === 2" class="space-y-6">
          <div class="text-center">
            <h3 class="text-3xl font-black text-slate-800 leading-tight">누구를 대신해서<br>근무하시나요?</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto p-1">
            <button @click="handleAttendance('holiday')" class="bg-slate-800 text-white py-8 rounded-3xl font-black text-2xl">본인 특근</button>
            <button v-for="staff in absentStaffList" :key="staff.idx" @click="handleAttendance('replace', staff.name)" class="bg-white border-4 border-orange-400 text-orange-600 py-8 rounded-3xl font-black text-2xl">
              {{ staff.name }}<br>대근
            </button>
          </div>
          <button @click="step = 1" class="w-full py-6 bg-slate-100 text-slate-500 rounded-2xl font-black text-xl">⬅️ 이전으로 돌아가기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth'; // 스토어 임포트

const authStore = useAuthStore(); // 스토어 사용
const mIdx = computed(() => authStore.user?.[0]?.idx);
const sIdx = computed(() => authStore.user?.[0]?.sIdx);
const positionCd = computed(() => authStore.user?.[0]?.positionCd);

const today = new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const currentTime = ref('');
const isLocationLoading = ref(true);
const isInRange = ref(false);
const distance = ref(0);
const showSelector = ref(false);
const step = ref(1);
const isWorkStarted = ref(false); // ★ 출근 여부 상태값 추가
let watchId = null;

const SITE_COORDS = { lat: 37.558052, lng: 126.921848 };
const absentStaffList = ref([]);

// 위치 계산 및 추적 로직 (기존과 동일)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const startLocationWatch = () => {
  if (!navigator.geolocation) return;
  watchId = navigator.geolocation.watchPosition(
      (position) => {
        isLocationLoading.value = false;
        const d = getDistance(position.coords.latitude, position.coords.longitude, SITE_COORDS.lat, SITE_COORDS.lng);
        distance.value = d;
        isInRange.value = d <= 10000;
      },
      (err) => { isLocationLoading.value = false; },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
};

const openAttendanceSelector = () => {
  step.value = 1;
  showSelector.value = true;
};

const closeModal = () => {
  showSelector.value = false;
};

// 출퇴근 처리 로직
const handleAttendance = async (type, name = null) => {
  if (!isInRange.value) {
    alert("현장 범위를 벗어났습니다.");
    return;
  }

  const proceed = name ? confirm(`${name} 직원을 대신해서 근무하시나요?`) : true;
  if (!proceed) return;

  try {
    const payload = {
      mIdx: mIdx,
      sIdx: sIdx,
      workStartTime: currentTime.value,
      workType: type,
      bigo: name ? `${name} 대근` : ''
    };

    // 퇴근일 경우의 API 주소는 다를 수 있으므로 체크 필요 (예시로 start 유지)
    const url = type === 'leave' ? `/api/v1/work/end` : `/api/v1/work/start`;
    await axios.post(url, payload);

    if (type === 'leave') {
      isWorkStarted.value = false; // 퇴근 시 버튼 다시 활성화
      alert("퇴근 처리가 완료되었습니다.");
    } else {
      isWorkStarted.value = true; // ★ 출근 시 버튼 비활성화 상태로 변경
      alert("출근 처리가 완료되었습니다.");
    }
    closeModal();
  } catch (error) {
    alert("처리에 실패했습니다. 다시 시도해주세요.");
  }
};

// 오늘 출근했는지 여부를 서버에서 확인하는 함수
const checkTodayStatus = async () => {
  let params = {
    mIdx: mIdx,
    sIdx: sIdx,
  }
  try {
    const res = await axios.get(`/api/v1/work/status`, {params});
    // console.log(res, '출근여부')
    // 서버 응답에 따라 이미 출근했다면 true로 설정
    if (res.data.data.length > 0) {
      isWorkStarted.value = true;
    }
  } catch (e) {
    console.error("상태 확인 실패");
  }
};

const getAssignedStaff = async () => {
  try {
    const res = await axios.get(`/api/v1/member/staffing/${sIdx}`);
    absentStaffList.value = res.data.data.map(item => ({ idx: item.idx, name: item.name }));
  } catch (e) { console.error("직원 명단 로드 실패"); }
};

onMounted(() => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR');
  setInterval(() => { currentTime.value = new Date().toLocaleTimeString('ko-KR'); }, 1000);
  startLocationWatch();
  getAssignedStaff();
  checkTodayStatus();
});

onUnmounted(() => {
  if (watchId) navigator.geolocation.clearWatch(watchId);
});
</script>

<style scoped>
.menu-item {
  @apply block w-full bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 text-center font-black shadow-sm active:bg-slate-50 transition-all text-slate-700 text-xl;
}
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
button { -webkit-tap-highlight-color: transparent; user-select: none; }
</style>
