<template>
  <div class="block w-full min-h-screen bg-slate-50 pb-32 space-y-5">

    <div class="bg-rose-500 rounded-3xl p-6 text-white shadow-xl mx-1">
      <h3 class="text-3xl font-extrabold tracking-tight mb-1">🧹 청소용품 신청</h3>
      <p class="text-rose-100 text-lg font-medium">수량을 선택한 후 하단 버튼으로 한 번에 신청하세요</p>
    </div>

    <div v-if="items.length > 0">
      <div
          v-for="item in items"
          :key="item.detailCode"
          class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 space-y-6 mb-5 mx-1"
      >
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-4xl">
            {{ getItemIcon(item.detailName) }}
          </div>
          <div class="flex-1">
            <p class="text-2xl font-extrabold text-slate-800 leading-tight">{{ item.detailName }}</p>
            <p class="text-base text-slate-400 font-semibold mt-1">코드: {{ item.detailCode }}</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
          <p class="text-xl font-extrabold text-slate-600">신청 수량</p>

          <div class="flex items-center gap-5">
            <button
                @click="updateQty(item.detailCode, -1)"
                class="w-12 h-12 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-3xl font-black text-slate-400 active:bg-slate-100 active:scale-90 transition-all shadow-sm"
            > - </button>

            <span class="text-3xl font-black text-slate-800 w-8 text-center">
              {{ selectedQtys[item.detailCode] || 0 }}
            </span>

            <button
                @click="updateQty(item.detailCode, 1)"
                class="w-12 h-12 bg-white border-2 border-rose-200 rounded-xl flex items-center justify-center text-3xl font-black text-rose-500 active:bg-rose-50 active:scale-90 transition-all shadow-sm"
            > + </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <div class="animate-bounce mb-4 text-5xl">📦</div>
      <p class="text-xl font-bold text-slate-400">물품 목록을 불러오는 중입니다...</p>
    </div>

    <div class="fixed bottom-20 left-0 right-0 p-5 z-40">
      <button
          @click="submitAllOrders"
          :class="[
        'w-full py-5 rounded-3xl text-2xl font-extrabold transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3',
        totalSelectedCount > 0
          ? 'bg-rose-500 text-white shadow-rose-200'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
      ]"
          :disabled="totalSelectedCount === 0"
      >
    <span v-if="totalSelectedCount > 0">
      {{ totalSelectedCount }}종 일괄 신청하기 ✓
    </span>
        <span v-else>물품 수량을 선택해주세요</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from "~/stores/auth.js";

const authStore = useAuthStore();
const sIdx = authStore.user?.[0].sIdx || 1;
const cIdx = authStore.user?.[0].cIdx || 1;

const items = ref([]);
const selectedQtys = reactive({}); // { 'code1': 5, 'code2': 10 } 형태로 저장됨

// 수량이 0보다 큰 품목이 몇 종류인지 계산
const totalSelectedCount = computed(() => {
  return Object.values(selectedQtys).filter(qty => qty > 0).length;
});

const updateQty = (code, delta) => {
  const current = selectedQtys[code] || 0;
  const next = current + delta;
  if (next >= 0 && next <= 99) {
    selectedQtys[code] = next;
  }
};

const getItemIcon = (name) => {
  if (name.includes('빗자루')) return '🧹';
  if (name.includes('걸레') || name.includes('맙')) return '🧼';
  if (name.includes('제지') || name.includes('휴지')) return '🧻';
  if (name.includes('세제') || name.includes('퐁퐁')) return '🧴';
  if (name.includes('장갑')) return '🧤';
  if (name.includes('봉투')) return '🛍️';
  return '📦';
};

// 🚀 일괄 신청 핸들러
const submitAllOrders = async () => {
  // 1. 수량이 0보다 큰 아이템만 추출하여 배열 생성
  const orderList = items.value
      .filter(item => (selectedQtys[item.detailCode] || 0) > 0)
      .map(item => ({
        sIdx: sIdx,
        detailCode: item.detailCode,
        detailName: item.detailName,
        qty: selectedQtys[item.detailCode]
      }));

  console.log(orderList, 'orderList')
  if (orderList.length === 0) return;

  if (!confirm(`${orderList.length}종의 물품을 일괄 신청하시겠습니까?`)) return;

  try {
    // 2. 서버로 배열 데이터 전송 (API 주소는 상황에 맞게 수정)
    const res = await axios.post(`/api/v1/code/item/order/${sIdx}`, {
      orders: orderList,
      mIdx : authStore.user?.[0].idx
    });

    if (res.data.result) {
      alert('신청이 완료되었습니다.');
      // 3. 신청 성공 후 수량 초기화
      Object.keys(selectedQtys).forEach(key => {
        selectedQtys[key] = 0;
      });
    } else {
      alert('신청 실패: ' + (res.data.message || '오류 발생'));
    }
  } catch (err) {
    console.error('전송 에러:', err);
    alert('서버와 통신 중 에러가 발생했습니다.');
  }
};

const getCode = () => {
  axios.get(`/api/v1/code/${cIdx}`)
      .then(res => {
        items.value = res.data.data.filter(item => item.groupCode == '03');
      })
      .catch(err => {
        console.error('코드 로드 실패:', err);
      });
};

onMounted(() => {
  getCode();
});
</script>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
/* 하단 고정 버튼을 위한 그림자 효과 */
.fixed {
  pointer-events: none; /* 컨테이너 자체는 클릭 무시 */
}
.fixed button {
  pointer-events: auto; /* 버튼만 클릭 가능 */
}
</style>
