<template>
  <div class="block w-full min-h-screen bg-slate-50 pb-32 space-y-5">

    <div class="bg-orange-500 rounded-3xl p-6 text-white shadow-xl mx-1 mt-1">
      <h3 class="text-3xl font-extrabold tracking-tight mb-1">👕 피복 신청</h3>
      <p class="text-orange-100 text-lg font-medium">사이즈별 수량을 선택 후 일괄 신청하세요</p>
    </div>

    <div v-if="items.length > 0">
      <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 space-y-6 mx-1 mb-5"
      >
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-4xl">
            {{ item.icon }}
          </div>
          <div class="flex-1">
            <p class="text-2xl font-extrabold text-slate-800 leading-tight">{{ item.name }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div
              v-for="s in item.sizes"
              :key="s.code"
              class="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100"
          >
            <div class="flex flex-col">
              <span class="text-xl font-extrabold text-slate-700">{{ s.label }}</span>
              <span class="text-xs text-slate-400 font-bold">코드: {{ s.code }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button
                  @click="updateQty(s.code, -1)"
                  class="w-10 h-10 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400 active:bg-slate-100 active:scale-90 transition-all shadow-sm"
              > - </button>

              <span class="text-2xl font-black text-slate-800 w-6 text-center">
                {{ selectedQtys[s.code] || 0 }}
              </span>

              <button
                  @click="updateQty(s.code, 1)"
                  class="w-10 h-10 bg-white border-2 border-orange-200 rounded-xl flex items-center justify-center text-2xl font-black text-orange-500 active:bg-orange-50 active:scale-90 transition-all shadow-sm"
              > + </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <div class="animate-bounce mb-4 text-5xl">📦</div>
      <p class="text-xl font-bold text-slate-400">물품 목록을 불러오는 중입니다...</p>
    </div>

    <div class="fixed bottom-20 left-0 right-0 p-5 z-40 pointer-events-none">
      <button
          @click="submitAllOrders"
          :class="[
            'w-full py-5 rounded-3xl text-2xl font-extrabold transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 pointer-events-auto',
            totalSelectedCount > 0
              ? 'bg-orange-500 text-white shadow-orange-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          ]"
          :disabled="totalSelectedCount === 0"
      >
        <span v-if="totalSelectedCount > 0">
          {{ totalSelectedCount }}건 일괄 신청하기 ✓
        </span>
        <span v-else>사이즈와 수량을 선택해주세요</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const sIdx = authStore.user?.[0]?.sIdx || 1;
const mIdx = authStore.user?.[0]?.idx || 1;
const cIdx = 1; // 피복용 코드 그룹

const items = ref([]);
const selectedQtys = reactive({}); // { '사이즈코드': 수량 }

// 선택된 총 품목 수 계산 (수량이 0보다 큰 항목 개수)
const totalSelectedCount = computed(() => {
  return Object.values(selectedQtys).filter(qty => qty > 0).length;
});

// 수량 업데이트 로직
const updateQty = (code, delta) => {
  const current = selectedQtys[code] || 0;
  const next = current + delta;
  if (next >= 0 && next <= 99) {
    selectedQtys[code] = next;
  }
};

// 일괄 신청 처리
const submitAllOrders = async () => {
  const orderList = [];

  // items 내부의 모든 사이즈를 순회하며 수량이 체크된 것만 추출
  items.value.forEach(item => {
    item.sizes.forEach(size => {
      const qty = selectedQtys[size.code] || 0;
      if (qty > 0) {
        orderList.push({
          sIdx: sIdx,
          detailCode: size.code,
          detailName: `${item.name} - ${size.label}`,
          qty: qty
        });
      }
    });
  });

  if (orderList.length === 0) return;

  if (!confirm(`${orderList.length}건의 피복을 일괄 신청하시겠습니까?`)) return;

  try {
    const res = await axios.post(`/api/v1/code/item/order/${sIdx}`, {
      orders: orderList,
      mIdx: mIdx
    });

    if (res.data.result) {
      alert('신청이 완료되었습니다.');
      // 수량 초기화
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

// 데이터 가공 (그룹화 로직 유지)
const processClothesData = (data) => {
  const grouped = data
      .filter(item => item.groupCode === '05')
      .reduce((acc, curr) => {
        if (!acc[curr.subCode]) {
          let icon = '👕';
          if (curr.subName.includes('하의')) icon = '👖';
          else if (curr.subName.includes('조끼') || curr.subName.includes('안전화')) icon = '🦺';
          else if (curr.subName.includes('앞치마')) icon = '🎽';

          acc[curr.subCode] = {
            id: curr.subCode,
            name: curr.subName,
            icon: icon,
            sizes: []
          };
        }
        acc[curr.subCode].sizes.push({
          label: curr.detailName,
          code: curr.detailCode
        });
        return acc;
      }, {});

  return Object.values(grouped);
};

const getCode = () => {
  axios.get(`/api/v1/code/${cIdx}`)
      .then(res => {
        let result = res.data?.data;
        if(result) {
          items.value = processClothesData(result);
        }
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
</style>
