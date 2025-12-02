<template>
  <div class="page-container">
    <h1>📊 월별 근무 기록</h1>

    <div class="controls">
      <select v-model="selectedMonth" @change="fetchRecords">
        <option v-for="month in availableMonths" :key="month" :value="month">
          {{ month }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">
      <p>데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="records.length" class="records-summary">
      <h3>{{ selectedMonth }} 근무 요약</h3>
      <!--div class="summary-box">
        <p>총 근무 시간: <strong>{{ totalHours }} 시간</strong></p>
        <p>초과 근무 시간: <strong>{{ overtimeHours }} 시간</strong></p>
      </div-->

      <h3>일별 상세 기록</h3>
      <table class="record-table">
        <thead>
        <tr>
          <th>날짜</th>
          <th>출근</th>
          <th>퇴근</th>
          <th>총 근무</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="record in records" :key="record.date">
          <td>{{ record.date }}</td>
          <td>{{ record.checkin || '-' }}</td>
          <td>{{ record.checkout || '-' }}</td>
          <td>{{ record.duration || '0' }}시간</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p class="no-data">선택하신 월의 근무 기록이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

definePageMeta({
  middleware: ['auth'] // 인증된 사용자만 접근 가능
})

const selectedMonth = ref('');
const availableMonths = ref([]); // 'YYYY-MM' 형식의 월 목록
const records = ref([]); // 일별 상세 기록 배열
const isLoading = ref(false);

// --- Dummy Data & Setup ---

const generateMonthOptions = () => {
  const date = new Date();
  for (let i = 0; i < 6; i++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    availableMonths.value.push(`${year}-${month}`);
    date.setMonth(date.getMonth() - 1);
  }
  selectedMonth.value = availableMonths.value[0];
};

// --- Computed Properties ---

const totalHours = computed(() => {
  // 실제 로직: records 배열을 순회하며 총 근무 시간을 계산
  const totalMinutes = records.value.reduce((sum, r) => {
    // console.log(sum, r.duration)
    /*
    if (r.duration) {
      const [h, m] = r.duration.split(/[h,m]/).filter(Boolean).map(Number);
      return sum + (h * 60) + m;
    }

     */
    return sum;
  }, 0);

  return (totalMinutes / 60).toFixed(1);
});

const overtimeHours = computed(() => {
  // 실제 로직: 총 근무 시간 - 기준 근무 시간(예: 209시간)
  const standardHours = 160;
  const over = totalHours.value - standardHours;
  return Math.max(0, over).toFixed(1);
});

// --- API Logic ---

const fetchRecords = async () => {
  isLoading.value = true;
  records.value = [];

  try {
    // 실제 API 호출 (예: GET /api/records?month=YYYY-MM)
    // const token = localStorage.getItem('user_token');
    const mIdx = 1;
    const response = await axios.get(`http://localhost:3001/v1/work/sheet/${mIdx}?startDt=${selectedMonth.value}&endDt=${selectedMonth.value}`, {
      // headers: { Authorization: `Bearer ${token}` }
    });
    records.value = response.data.data;
    console.log(response.data.data, 'd');

    // 더미 데이터
    await new Promise(resolve => setTimeout(resolve, 500));
    //records.value = dummyRecords.filter(r => r.date.startsWith(selectedMonth.value));

  } catch (error) {
    console.error('근무 기록 불러오기 실패:', error);
    alert('근무 기록을 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const getWorkFl = async () => {
  const mIdx = 1;
  const sIdx = 1;
  const response = await axios.get(`http://localhost:3001/v1/work/${mIdx}?sIdx=${sIdx}`)
  console.log(response.data.data);
}

onMounted(() => {
  generateMonthOptions();
  fetchRecords();
  getWorkFl();
});

// --- Dummy Data (실제 백엔드 데이터로 대체 필요) ---
const dummyRecords = [
  { date: '2025-11-01', checkin: '09:00', checkout: '18:00', duration: '8h' },
  { date: '2025-11-02', checkin: '09:02', checkout: '18:05', duration: '8h 3m' },
  { date: '2025-11-03', checkin: null, checkout: null, duration: null }, // 휴무
  { date: '2025-10-28', checkin: '08:50', checkout: '17:50', duration: '8h' },
];
</script>

<style scoped>
.page-container { padding: 20px; }
.controls { margin-bottom: 20px; text-align: right; }
select { padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 16px; }
.records-summary { margin-top: 20px; padding: 15px; border-radius: 8px; background-color: #eef; }
.summary-box { display: flex; justify-content: space-around; gap: 10px; margin-bottom: 15px; }
.record-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.record-table th, .record-table td { border: 1px solid #ddd; padding: 10px; text-align: center; }
.record-table th { background-color: #f0f0f0; }
.loading, .no-data { text-align: center; color: #777; margin-top: 30px; }
</style>
