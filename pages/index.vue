<template>
  <div class="time-tracker">
    <h1>⏰ 출퇴근 기록</h1>
    <h2>{{ isWorking ? '✅ 근무 중' : '❌ 미출근 상태' }}</h2>
    <p>현재 시간: {{ currentTime }}</p>

    <p :class="['status-message', isLocationValid ? 'status-valid' : 'status-invalid']">
      {{ statusMessage }}
    </p>

    <button
        :disabled="isLoading || !isLocationFetched"
        @click="handleTimeRecord"
        :class="{ 'btn-primary': !isWorking, 'btn-danger': isWorking }"
    >
      {{ isLoading ? '처리 중...' : (isWorking ? '🏃‍♂️ 퇴근하기' : '🚶‍♂️ 출근하기') }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useLocation } from '@/composables/useLocation';

// 인증된 사용자만 접근 가능하도록 미들웨어 설정
definePageMeta({
  middleware: ['auth']
})

const {
  userLocation,
  statusMessage,
  isLocationFetched,
  isLocationValid,
  fetchUserLocation
} = useLocation();

// --- 상태 관리 ---
const isWorking = ref(false); // 현재 근무 상태
const isLoading = ref(false); // API 호출 로딩 상태
const currentTime = ref(''); // 현재 시간 표시

// --- Lifecycle & Utils ---
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR');
};
onMounted(() => {
  updateTime();
  if (process.client) {
    setInterval(updateTime, 1000);
    fetchUserLocation(); // 클라이언트 측에서 위치 정보 로드 시작
  }
});

const handleTimeRecord = async () => {
  if (!isLocationValid.value) {
    alert('근무지 근처에서만 출퇴근 기록이 가능합니다.');
    return;
  }

  const type = isWorking.value ? 'checkout' : 'checkin';
  isLoading.value = true;
  statusMessage.value = `${type === 'checkin' ? '출근' : '퇴근'} 기록 중...`;

  try {
    const url = type == 'checkout' ? 'http://localhost:3001/v1/work/end' : 'http://localhost:3001/v1/work/start'
    const token = localStorage.getItem('user_token');
    await axios.post(url, {
      // type: type,
      // latitude: userLocation.value.lat,
      // longitude: userLocation.value.lng,
      mIdx: 1,
      sIdx: 1,
    }, {
      // headers: { Authorization: `Bearer ${token}` }
    });

    // 성공 처리
    isWorking.value = !isWorking.value;
    statusMessage.value = isWorking.value
        ? `🎉 출근 완료!`
        : `👋 퇴근 완료!`;

    alert(`${type === 'checkin' ? '출근' : '퇴근'}이 성공적으로 기록되었습니다!`);

  } catch (error) {
    console.error('API 호출 실패:', error);
    statusMessage.value = `🚨 기록 실패. 서버 오류.`;
    alert(`기록 실패: ${error.response?.data?.message || '네트워크 오류'}`);

  } finally {
    isLoading.value = false;
    // 위치 정보 새로고침
    fetchUserLocation();
  }
};
</script>

<style scoped>
/* 이전과 동일한 스타일 적용 및 추가 */
.time-tracker { padding: 20px; text-align: center; }
.status-message { margin: 15px 0; padding: 10px; border-radius: 5px; font-weight: bold; }
.status-valid { background-color: #e6ffe6; color: #4CAF50; }
.status-invalid { background-color: #ffe6e6; color: #f44336; }
button { padding: 15px 30px; font-size: 18px; border: none; border-radius: 10px; cursor: pointer; width: 100%; max-width: 300px; margin-top: 20px; transition: all 0.3s; }
button:disabled { background-color: #ccc !important; cursor: not-allowed; }
.btn-primary { background-color: #4CAF50; color: white; }
.btn-danger { background-color: #f44336; color: white; }
</style>
