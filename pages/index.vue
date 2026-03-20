<template>
  <div class="block w-full space-y-6 pb-20">
    <div class="block w-full bg-blue-50 p-8 rounded-[2.5rem] text-center shadow-sm border border-blue-100 relative overflow-hidden">
      <p class="text-blue-500 font-bold text-lg mb-2">{{ today }}</p>
      <h2 class="text-5xl font-black text-blue-900 mb-8">{{ currentTime }}</h2>

      <!-- 위치 상태 표시 부분만 교체 -->
      <div class="mb-6">
        <div v-if="isLocationLoading"
             class="text-base text-slate-400 animate-pulse font-bold">
          📍 현장 위치 확인 중...
        </div>
        <div v-else-if="locationErrorMsg"
             class="text-base text-orange-500 font-bold bg-orange-50 py-3 rounded-full inline-block px-6 border border-orange-200">
          ⚠️ {{ locationErrorMsg }}
        </div>
        <div v-else-if="isInRange"
             class="text-base text-emerald-600 font-bold bg-emerald-100 py-3 rounded-full inline-block px-6 border border-emerald-200">
          ✅ 현장 근무지 도착
          <span v-if="gpsAccuracy" class="text-xs text-emerald-400 ml-1">(오차 ±{{ gpsAccuracy }}m)</span>
        </div>
        <div v-else
             class="text-base text-red-500 font-bold bg-red-100 py-3 rounded-full inline-block px-6 border border-red-200">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

const authStore  = useAuthStore()
const mIdx       = computed(() => authStore.user?.[0]?.idx)
const sIdx       = computed(() => authStore.user?.[0]?.sIdx)
const positionCd = computed(() => authStore.user?.[0]?.positionCd)

// ────────────────────────────────────────────────────────────
// 시간
// ────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString('ko-KR', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})
const currentTime = ref('')
let clockTimer = null

// ────────────────────────────────────────────────────────────
// GPS / 위치
// ────────────────────────────────────────────────────────────
const ALLOWED_RADIUS   = 150  // 허용 반경 (m) — 실내 GPS 오차 고려
const MAX_GPS_ACCURACY = 200  // GPS 정확도 허용 최대값 (m) — 이보다 부정확하면 재측정

const siteCoords         = ref(null)     // 서버에서 받은 현장 좌표
const isLocationLoading  = ref(true)
const isInRange          = ref(false)
const gpsAccuracy        = ref(null)     // 현재 GPS 정확도 (m)
const locationErrorMsg   = ref('')
let   watchId            = null

// ── 하버사인 공식 거리 계산 ──
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371e3
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a    =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── 위치 감시 시작 ──
const startLocationWatch = () => {
  if (!navigator.geolocation) {
    isLocationLoading.value = false
    locationErrorMsg.value  = 'GPS를 지원하지 않는 기기입니다.'
    return
  }

  watchId = navigator.geolocation.watchPosition(
      (pos) => {
        isLocationLoading.value = false
        gpsAccuracy.value       = Math.round(pos.coords.accuracy)

        // GPS 정확도가 너무 낮으면 (오차가 너무 크면) 범위 판단 보류
        if (pos.coords.accuracy > MAX_GPS_ACCURACY) {
          locationErrorMsg.value = `GPS 신호가 약합니다 (오차 ${Math.round(pos.coords.accuracy)}m). 잠시 후 다시 시도하세요.`
          isInRange.value = false
          return
        }

        locationErrorMsg.value = ''

        if (!siteCoords.value) return  // 현장 좌표 아직 미로드

        const d = getDistance(
            pos.coords.latitude,
            pos.coords.longitude,
            siteCoords.value.lat,
            siteCoords.value.lng,
        )

        // 허용 반경 + GPS 오차값을 함께 적용 (실내 완충)
        isInRange.value = d <= (ALLOWED_RADIUS + pos.coords.accuracy * 0.5)
      },
      (err) => {
        isLocationLoading.value = false
        const messages = {
          1: '위치 권한이 거부되었습니다. 설정에서 허용해주세요.',
          2: 'GPS 신호를 찾을 수 없습니다.',
          3: 'GPS 응답 시간이 초과되었습니다.',
        }
        locationErrorMsg.value = messages[err.code] || 'GPS 오류가 발생했습니다.'
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  )
}

// ── 현장 좌표 로드 (sIdx 기반) ──
const fetchSiteCoords = async () => {
  try {
    const res = await axios.get(`/api/v1/site/coords/${sIdx.value}`)
    siteCoords.value = {
      lat: res.data.data.latitude,
      lng: res.data.data.longitude,
    }

    console.log(siteCoords.value, 'dd')
  } catch (e) {
    locationErrorMsg.value = '현장 위치 정보를 불러오지 못했습니다.'
    console.error('현장 좌표 로드 실패', e)
  }
}

// ────────────────────────────────────────────────────────────
// 출퇴근 상태
// ────────────────────────────────────────────────────────────
const isWorkStarted   = ref(false)
const showSelector    = ref(false)
const step            = ref(1)
const absentStaffList = ref([])

const openAttendanceSelector = () => {
  step.value        = 1
  showSelector.value = true
}
const closeModal = () => { showSelector.value = false }

const handleAttendance = async (type, name = null) => {
  if (!isInRange.value) { alert('현장 범위를 벗어났습니다.'); return }

  if (name && !confirm(`${name} 직원을 대신해서 근무하시나요?`)) return

  try {
    const url     = type === 'leave' ? '/api/v1/work/end' : '/api/v1/work/start'
    const payload = {
      mIdx:          mIdx.value,        // ← .value 필수
      sIdx:          sIdx.value,
      workStartTime: currentTime.value,
      workType:      type,
      bigo:          name ? `${name} 대근` : '',
    }
    await axios.post(url, payload)

    isWorkStarted.value = type !== 'leave'
    alert(type === 'leave' ? '퇴근 처리가 완료되었습니다.' : '출근 처리가 완료되었습니다.')
    closeModal()
  } catch {
    alert('처리에 실패했습니다. 다시 시도해주세요.')
  }
}

const checkTodayStatus = async () => {
  try {
    const res = await axios.get('/api/v1/work/status', {
      params: { mIdx: mIdx.value, sIdx: sIdx.value },  // ← .value 필수
    })
    isWorkStarted.value = (res.data.data?.length ?? 0) > 0
  } catch { console.error('출근 상태 확인 실패') }
}

const getAssignedStaff = async () => {
  try {
    const res = await axios.get(`/api/v1/member/staffing/${sIdx.value}`)
    absentStaffList.value = res.data.data.map(i => ({ idx: i.idx, name: i.name }))
  } catch { console.error('직원 명단 로드 실패') }
}

// ────────────────────────────────────────────────────────────
// 라이프사이클
// ────────────────────────────────────────────────────────────
onMounted(async () => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR')
  clockTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('ko-KR')
  }, 1000)

  await fetchSiteCoords()     // 1. 현장 좌표 먼저 로드
  startLocationWatch()        // 2. 그 다음 위치 감시 시작
  await Promise.all([
    getAssignedStaff(),
    checkTodayStatus(),
  ])
})

onUnmounted(() => {
  if (watchId) navigator.geolocation.clearWatch(watchId)
  if (clockTimer) clearInterval(clockTimer)
})
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
