<template>
  <div class="block w-full min-h-screen bg-slate-50 pb-24 space-y-5">

    <!-- 헤더 -->
    <div class="bg-orange-500 rounded-3xl p-6 text-white shadow-xl">
      <h3 class="text-3xl font-extrabold tracking-tight mb-1">👕 피복 신청</h3>
      <p class="text-orange-100 text-lg font-medium">지급 주기: 연 2회</p>
    </div>

    <!-- 품목 카드 목록 -->
    <div
        v-for="item in items"
        :key="item.id"
        class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 space-y-5"
    >
      <!-- 품목명 -->
      <div class="flex items-center gap-3">
        <span class="text-4xl">{{ item.icon }}</span>
        <div>
          <p class="text-2xl font-extrabold text-slate-800">{{ item.name }}</p>
          <p class="text-base text-slate-400 font-semibold mt-0.5">지급 주기: 연 2회</p>
        </div>
      </div>

      <!-- 사이즈 선택 -->
      <div>
        <p class="text-lg font-extrabold text-slate-600 mb-3">사이즈 선택</p>
        <div class="grid grid-cols-4 gap-2">
          <button
              v-for="s in item.sizes"
              :key="s"
              @click="selectSize(item.id, s)"
              :class="[
              'py-4 rounded-2xl text-xl font-extrabold border-2 transition-all active:scale-95',
              selectedSizes[item.id] === s
                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            ]"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- 신청 버튼 -->
      <button
          @click="order(item)"
          :class="[
          'w-full py-5 rounded-2xl text-2xl font-extrabold transition-all active:scale-95 border-2',
          selectedSizes[item.id]
            ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
        ]"
          :disabled="!selectedSizes[item.id]"
      >
        {{ selectedSizes[item.id] ? `${selectedSizes[item.id]} 사이즈 신청하기 ✓` : '사이즈를 먼저 선택하세요' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

const cIdx = 1;

const items = ref([
  { id: 1, name: '하절기 작업복 상의', icon: '👕', sizes: ['95', '100', '105', '110'] },
  { id: 2, name: '안전화 (4인치)',     icon: '👟', sizes: ['250', '260', '270', '280'] },
]);

// 품목별 선택된 사이즈
const selectedSizes = reactive({});

const selectSize = (itemId, size) => {
  selectedSizes[itemId] = size;
};

const order = (item) => {
  const size = selectedSizes[item.id];
  if (!size) return;
  alert(`${item.name} (${size}) 신청이 완료되었습니다.`);
  delete selectedSizes[item.id];
};

const getCode = () => {
  axios.get(`/api/v1/code/${cIdx}`)
      .then(res => {
        console.log(res.data.data);
        // 필요 시 items.value = res.data.data 로 교체

      });
};

const transformList = async (list) => {
  console.log(list, 'll')
}

onMounted(() => {
  getCode();
});
</script>
