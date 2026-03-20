<template>
  <div class="block w-full space-y-6 pb-20">
    <div class="block w-full bg-blue-50 p-8 rounded-[2.5rem] text-center shadow-sm border border-blue-100 relative overflow-hidden">
      <p class="text-blue-500 font-bold text-lg mb-2">{{ today }}</p>
      <h2 class="text-5xl font-black text-blue-900 mb-8">{{ currentTime }}</h2>

      <!-- 위치 상태 -->
      <div class="mb-6">

        <!-- 로딩 -->
        <div v-if="isLocationLoading"
             class="text-base text-slate-400 animate-pulse font-bold">
          📍 현장 위치 확인 중...
        </div>

        <!-- 권한 거부 → iOS/Android 설정 안내 -->
        <div v-else-if="gpsStatus === 'denied'" class="w-full text-left">
          <div class="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-4">
            <div class="text-center">
              <span class="text-5xl">🔒</span>
              <p class="text-red-600 font-black text-xl mt-3">위치 권한이 차단되어 있습니다</p>
              <p class="text-slate-500 text-sm mt-1 font-bold">출퇴근을 위해 위치 권한을 허용해주세요</p>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-red-100 space-y-2">
              <p class="font-black text-slate-700 text-sm flex items-center gap-2">
                🍎 <span>iPhone (Safari)</span>
              </p>
              <ol class="text-slate-500 text-sm space-y-1 pl-4 font-bold list-decimal">
                <li>아이폰 <strong>설정</strong> 앱 열기</li>
                <li><strong>개인 정보 보호 및 보안 → 위치 서비스</strong></li>
                <li>Safari 또는 앱 찾아서 <strong>'앱 사용 중'</strong> 선택</li>
              </ol>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-red-100 space-y-2">
              <p class="font-black text-slate-700 text-sm flex items-center gap-2">
                🤖 <span>Android (Chrome)</span>
              </p>
              <ol class="text-slate-500 text-sm space-y-1 pl-4 font-bold list-decimal">
                <li>Chrome 주소창 왼쪽 <strong>🔒 자물쇠</strong> 아이콘 탭</li>
                <li><strong>위치 → 허용</strong> 선택</li>
                <li>페이지 <strong>새로고침</strong></li>
              </ol>
            </div>

            <button
                @click="retryPermission"
                class="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-transform"
            >
              🔄 설정 변경 후 다시 시도
            </button>
          </div>
        </div>

        <!-- GPS 오류 (권한 외 에러) -->
        <div v-else-if="gpsStatus === 'error'"
             class="text-base text-red-500 font-bold bg-red-50 py-3 rounded-full inline-block px-6 border border-red-200">
          🚫 {{ locationErrorMsg }}
        </div>

        <!-- 위치 신뢰 불가 (오차 너무 큼) -->
        <div v-else-if="gpsStatus === 'block'"
             class="text-base text-red-500 font-bold bg-red-50 py-3 rounded-full inline-block px-6 border border-red-200">
          📡 {{ locationErrorMsg }}
        </div>

        <!-- 현장 내 -->
        <template v-else-if="isInRange">
          <div class="text-base text-emerald-600 font-bold bg-emerald-100 py-3 rounded-full inline-block px-6 border border-emerald-200">
            ✅ 현장 근무지 도착
          </div>
          <div v-if="gpsStatus === 'warn'" class="text-xs text-orange-500 font-bold mt-2">
            ⚠️ {{ locationErrorMsg }}
          </div>
          <div v-else-if="gpsAccuracy" class="text-xs text-emerald-400 mt-1">
            GPS 정확도 ±{{ gpsAccuracy }}m
          </div>
        </template>

        <!-- 현장 밖 -->
        <div v-else
             class="text-base text-red-500 font-bold bg-red-100 py-3 rounded-full inline-block px-6 border border-red-200">
          ⚠️ 현장 밖 (기록 불가)
          <div v-if="gpsAccuracy" class="text-xs text-red-400 mt-1">GPS 오차 ±{{ gpsAccuracy }}m</div>
        </div>

      </div>

      <!-- 출퇴근 버튼: 현장 내 + block/denied 아닐 때만 표시 -->
      <div v-if="isInRange && gpsStatus !== 'block' && gpsStatus !== 'denied'" class="grid grid-cols-1 gap-5">
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

      <!-- 현장 밖 / 권한 없음 안내 문구 (denied는 위에서 카드로 표시되므로 제외) -->
      <div v-else-if="!isInRange && gpsStatus !== 'denied' && gpsStatus !== 'loading'"
           class="py-6 text-xl text-slate-500 font-bold leading-relaxed">
        지정된 현장 150m 이내에서만<br>
        <span class="text-red-500 text-2xl">출근과 퇴근</span>이 가능합니다.
      </div>
    </div>

    <!-- 디버그: 현재 위치 확인 (확인 후 삭제) -->
    <div class="w-full space-y-3">
      <button
          @click="alertCurrentLocation"
          class="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-base active:scale-95 transition-transform border border-slate-200"
      >
        📡 내 현재 위경도 확인 (디버그)
      </button>
      <!-- alert 대신 화면에 직접 표시 -->
      <div
          v-if="isDebugVisible"
          class="w-full bg-slate-800 text-green-400 p-5 rounded-2xl font-mono text-sm text-left whitespace-pre-wrap break-all leading-relaxed"
      >{{ debugLocation }}</div>
    </div>

    <!--div class="grid grid-cols-2 gap-4">
      <NuxtLink v-if="positionCd == '01002001' || positionCd == '01002003'" to="/request/off" class="menu-item">연차 신청</NuxtLink>
      <NuxtLink to="/request/uniform" class="menu-item">피복 신청</NuxtLink>
    </div-->

    <!-- 출근 유형 선택 시트 -->
    <div v-if="showSelector" class="fixed inset-0 bg-black/70 flex items-end z-50">
      <div class="bg-white w-full rounded-t-[3rem] p-8 pb-12 space-y-6 animate-slide-up shadow-2xl">

        <!-- step 1: 출근 유형 -->
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

        <!-- step 2: 대근 대상 선택 -->
        <div v-if="step === 2" class="space-y-6">
          <div class="text-center">
            <h3 class="text-3xl font-black text-slate-800 leading-tight">누구를 대신해서<br>근무하시나요?</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto p-1">
            <button @click="handleAttendance('holiday')"
                    class="bg-slate-800 text-white py-8 rounded-3xl font-black text-2xl">
              본인 특근
            </button>
            <button v-for="staff in absentStaffList" :key="staff.idx"
                    @click="handleAttendance('replace', staff.name)"
                    class="bg-white border-4 border-orange-400 text-orange-600 py-8 rounded-3xl font-black text-2xl">
              {{ staff.name }}<br>대근
            </button>
          </div>
          <button @click="step = 1"
                  class="w-full py-6 bg-slate-100 text-slate-500 rounded-2xl font-black text-xl">
            ⬅️ 이전으로 돌아가기
          </button>
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
let clockTimer    = null

// ────────────────────────────────────────────────────────────
// GPS / 위치
// ────────────────────────────────────────────────────────────
const ALLOWED_RADIUS = 150   // 허용 반경 (m) — 실내 GPS 오차 고려
const ACCURACY_WARN  = 500   // 이 이하: 경고는 표시하되 출퇴근 허용
const ACCURACY_BLOCK = 2000  // 이 초과: 위치 신뢰 불가, 출퇴근 차단

// gpsStatus: 'loading' | 'good' | 'warn' | 'block' | 'denied' | 'error'
const gpsStatus        = ref('loading')
const siteCoords       = ref(null)
const isLocationLoading = ref(true)
const isInRange        = ref(false)
const gpsAccuracy      = ref(null)
const locationErrorMsg = ref('')
let   watchId          = null

// ── 하버사인 거리 계산 ──
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

// ── 현재 위치 디버그 alert ──
const debugLocation = ref('')  // 화면에 텍스트로 표시
const isDebugVisible = ref(false)

const alertCurrentLocation = () => {
  isDebugVisible.value = true
  debugLocation.value  = '🔄 위치 조회 중...'

  // geolocation 지원 여부
  if (!navigator.geolocation) {
    debugLocation.value = '❌ 이 기기는 GPS를 지원하지 않습니다.'
    return
  }

  // watchPosition에서 이미 받은 값이 있으면 즉시 표시
  if (gpsAccuracy.value !== null) {
    buildDebugMsg()
    return
  }

  // 없으면 직접 조회
  navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsAccuracy.value = Math.round(pos.coords.accuracy)
        buildDebugMsg(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        const msgs = {
          1: '위치 권한이 거부되었습니다',
          2: 'GPS 신호를 찾을 수 없습니다',
          3: 'GPS 응답 시간 초과',
        }
        debugLocation.value = `❌ 실패: ${msgs[err.code] || err.message}`
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

const buildDebugMsg = (lat = null, lng = null) => {
  const siteLat  = siteCoords.value?.lat ?? '미로드'
  const siteLng  = siteCoords.value?.lng ?? '미로드'
  const acc      = gpsAccuracy.value ?? '?'

  let distLine = ''
  if (lat && lng && siteCoords.value) {
    const d = Math.round(getDistance(lat, lng, siteCoords.value.lat, siteCoords.value.lng))
    distLine = `\n📏 현장까지 거리: ${d}m`
  }

  debugLocation.value =
      `📍 내 위치: ${lat ?? '?'}, ${lng ?? '?'}` +
      `\nGPS 오차: ±${acc}m` +
      `\n📌 현장: ${siteLat}, ${siteLng}` +
      distLine
}

// ── 위치 감시 ──
const startLocationWatch = () => {
  if (!navigator.geolocation) {
    isLocationLoading.value = false
    gpsStatus.value         = 'error'
    locationErrorMsg.value  = 'GPS를 지원하지 않는 기기입니다.'
    return
  }

  watchId = navigator.geolocation.watchPosition(
      (pos) => {
        isLocationLoading.value = false
        const acc = Math.round(pos.coords.accuracy)
        gpsAccuracy.value = acc

        // 디버그용 현재 좌표 저장
        if (isDebugVisible.value) {
          buildDebugMsg(pos.coords.latitude, pos.coords.longitude)
        }

        // 정확도 등급 판정
        if (acc > ACCURACY_BLOCK) {
          gpsStatus.value        = 'block'
          locationErrorMsg.value = `위치를 특정할 수 없습니다 (오차 ±${acc}m). 실외로 이동 후 다시 시도하세요.`
          isInRange.value        = false
          return
        } else if (acc > ACCURACY_WARN) {
          gpsStatus.value        = 'warn'
          locationErrorMsg.value = `GPS 신호가 불안정합니다 (오차 ±${acc}m). 결과가 부정확할 수 있습니다.`
        } else if (acc > 100) {
          gpsStatus.value        = 'warn'
          locationErrorMsg.value = `GPS 신호가 약합니다 (오차 ±${acc}m)`
        } else {
          gpsStatus.value        = 'good'
          locationErrorMsg.value = ''
        }

        if (!siteCoords.value) return

        const d = getDistance(
            pos.coords.latitude,
            pos.coords.longitude,
            siteCoords.value.lat,
            siteCoords.value.lng,
        )

        // 오차의 30%를 완충으로 추가 (최대 100m) — 실내 보정
        const buffer = Math.min(acc * 0.3, 100)
        isInRange.value = d <= (ALLOWED_RADIUS + buffer)
      },
      (err) => {
        isLocationLoading.value = false
        if (err.code === 1) {
          // 권한 거부 → 설정 안내 화면
          gpsStatus.value        = 'denied'
          locationErrorMsg.value = ''
        } else {
          gpsStatus.value        = 'error'
          locationErrorMsg.value = {
            2: 'GPS 신호를 찾을 수 없습니다.',
            3: 'GPS 응답 시간이 초과되었습니다.',
          }[err.code] || 'GPS 오류가 발생했습니다.'
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  )
}

// ── 권한 사전 확인 후 감시 시작 ──
const checkPermissionAndWatch = async () => {
  if (navigator.permissions) {
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' })

      if (perm.state === 'denied') {
        isLocationLoading.value = false
        gpsStatus.value         = 'denied'
        return
      }

      // 설정 변경 시 자동 감지 (Android Chrome 지원, iOS Safari 미지원)
      perm.onchange = () => {
        if (perm.state === 'granted') {
          gpsStatus.value         = 'loading'
          isLocationLoading.value = true
          locationErrorMsg.value  = ''
          startLocationWatch()
        } else if (perm.state === 'denied') {
          gpsStatus.value = 'denied'
          isInRange.value = false
          if (watchId) { navigator.geolocation.clearWatch(watchId); watchId = null }
        }
      }
    } catch { /* Permissions API 미지원 → 통과 */ }
  }

  startLocationWatch()
}

// ── 현장 좌표 로드 ──
const fetchSiteCoords = async () => {
  try {
    const res = await axios.get(`/api/v1/site/coords/${sIdx.value}`)
    siteCoords.value = {
      lat: res.data.data.latitude,
      lng: res.data.data.longitude,
    }
  } catch (e) {
    locationErrorMsg.value = '현장 위치 정보를 불러오지 못했습니다.'
    console.error('현장 좌표 로드 실패', e)
  }
}

// ── 권한 거부 후 재시도 (페이지 새로고침) ──
const retryPermission = () => { window.location.reload() }

// ────────────────────────────────────────────────────────────
// 출퇴근
// ────────────────────────────────────────────────────────────
const isWorkStarted   = ref(false)
const showSelector    = ref(false)
const step            = ref(1)
const absentStaffList = ref([])

const openAttendanceSelector = () => { step.value = 1; showSelector.value = true }
const closeModal = () => { showSelector.value = false }

const handleAttendance = async (type, name = null) => {
  if (!isInRange.value) { alert('현장 범위를 벗어났습니다.'); return }
  if (name && !confirm(`${name} 직원을 대신해서 근무하시나요?`)) return

  try {
    const url     = type === 'leave' ? '/api/v1/work/end' : '/api/v1/work/start'
    const payload = {
      mIdx:          mIdx.value,
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
      params: { mIdx: mIdx.value, sIdx: sIdx.value },
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

  await fetchSiteCoords()          // 1. 현장 좌표 먼저 로드
  await checkPermissionAndWatch()  // 2. 권한 확인 후 위치 감시 시작
  await Promise.all([
    getAssignedStaff(),
    checkTodayStatus(),
  ])
})

onUnmounted(() => {
  if (watchId)    navigator.geolocation.clearWatch(watchId)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
.menu-item {
  @apply block w-full bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 text-center font-black shadow-sm active:bg-slate-50 transition-all text-slate-700 text-xl;
}
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
button { -webkit-tap-highlight-color: transparent; user-select: none; }
</style>
