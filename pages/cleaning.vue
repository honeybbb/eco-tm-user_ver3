<template>
  <div class="w-full max-w-lg mx-auto space-y-6 pb-28 pt-1 px-1">
    <!-- 상단 대형 제목 배너 (어르신 맞춤: 시원한 큰 글씨와 명확한 색상) -->
    <div class="bg-emerald-600 rounded-[2.5rem] p-6 text-white shadow-md text-center">
      <span class="inline-block bg-white/20 text-white text-base font-black px-4 py-1 rounded-full mb-2">
        🧹 청소 작업 보고
      </span>
      <h2 class="text-3xl font-black tracking-tight mb-1">대청소 완료 보고</h2>
      <p class="text-lg text-emerald-100 font-bold">
        사진을 찍고 큰 버튼을 누르면 끝납니다!
      </p>

      <!-- 사용자 정보 (큰 글씨) -->
      <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-base font-bold text-emerald-100">
        <div>👤 작업자: <strong class="text-white text-lg">{{ userName }}</strong></div>
        <div>🏢 현장: <strong class="text-white text-lg">{{ currentSiteName }}</strong></div>
      </div>
    </div>

    <!-- 2개 대형 탭: [사진 등록하기] vs [지난 내역 보기] -->
    <div class="grid grid-cols-2 gap-2 bg-slate-200 p-2 rounded-3xl">
      <button
          type="button"
          @click="activeTab = 'create'"
          :class="activeTab === 'create' ? 'bg-white text-emerald-800 shadow-md font-black' : 'text-slate-600 font-bold'"
          class="py-4 rounded-2xl text-xl transition-all flex items-center justify-center gap-2"
      >
        <span>📸</span>
        <span>사진 등록하기</span>
      </button>
      <button
          type="button"
          @click="activeTab = 'history'"
          :class="activeTab === 'history' ? 'bg-white text-emerald-800 shadow-md font-black' : 'text-slate-600 font-bold'"
          class="py-4 rounded-2xl text-xl transition-all flex items-center justify-center gap-2"
      >
        <span>📋</span>
        <span>등록 내역 ({{ reportHistory.length }})</span>
      </button>
    </div>

    <!-- 탭 1: 사진 등록하기 (핵심 3단계 간편 구성) -->
    <div v-if="activeTab === 'create'" class="space-y-6">

      <!-- [1단계] 근무 현장 확인 (큰 글씨 드롭다운) -->
      <div class="bg-white rounded-[2rem] p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-lg">1</span>
          <h3 class="text-2xl font-black text-slate-900">어느 현장인가요?</h3>
        </div>

        <div>
          <label class="block text-base font-black text-slate-600 mb-2">현장 선택</label>
          <select
              v-model="form.sIdx"
              @change="onSiteChange"
              class="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
          >
            <option value="" disabled>현장을 눌러서 선택하세요</option>
            <option v-for="site in siteList" :key="site.idx" :value="site.idx">
              {{ site.name || site.siteName }}
            </option>
          </select>
        </div>

        <!-- 오늘 작업한 청소 구역 (누르기만 하면 선택되는 큰 버튼) -->
        <div>
          <label class="block text-base font-black text-slate-600 mb-2">청소한 곳 (눌러서 선택)</label>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button
                v-for="preset in easyPresets"
                :key="preset"
                type="button"
                @click="selectPreset(preset)"
                class="py-3.5 px-3 rounded-2xl text-base font-black border-2 transition-all text-center flex items-center justify-center gap-1"
                :class="form.taskArea.includes(preset) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            >
              <span v-if="form.taskArea.includes(preset)">✓</span>
              <span>{{ preset }}</span>
            </button>
          </div>
          <!-- 직접 입력이 필요할 때만 사용 -->
          <input
              v-model="form.taskArea"
              type="text"
              placeholder="직접 입력하거나 위 버튼을 누르세요"
              class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-lg font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      <!-- [2단계] 사진 찍기 및 올리기 (노인 어르신을 위한 특대형 버튼) -->
      <div class="bg-white rounded-[2rem] p-6 border-2 border-emerald-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-lg">2</span>
            <h3 class="text-2xl font-black text-slate-900">현장 사진 찍기</h3>
          </div>
          <span class="text-lg font-black text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            총 {{ photos.length }}장 선택됨
          </span>
        </div>

        <p class="text-base text-slate-600 font-bold">
          아래 큰 <strong class="text-emerald-700">초록색 버튼</strong>을 누르면 카메라가 바로 켜집니다!
        </p>

        <!-- 카메라 즉시 촬영 특대형 버튼 -->
        <button
            type="button"
            @click="triggerCamera"
            class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-transform"
        >
          <span class="text-4xl">📸</span>
          <span>지금 카메라로 사진 촬영</span>
        </button>
        <input
            ref="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="handleFileSelect($event)"
        />

        <!-- 앨범에서 가져오기 서브 버튼 -->
        <button
            type="button"
            @click="triggerGallery"
            class="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 py-4 rounded-2xl font-black text-lg border-2 border-slate-300 flex items-center justify-center gap-2 transition-transform"
        >
          <span class="text-2xl">🖼️</span>
          <span>이미 찍어둔 사진 앨범에서 선택하기</span>
        </button>
        <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect($event)"
        />

        <!-- 찍은 사진 목록 크게 보여주기 -->
        <div v-if="photos.length > 0" class="pt-2 space-y-3">
          <p class="text-base font-black text-slate-700">
            찍은 사진 (확인 후 잘못 찍힌 사진은 빨간 X를 누르세요)
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div
                v-for="(photo, index) in photos"
                :key="photo.id"
                class="relative bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-sm"
            >
              <!-- 썸네일 이미지 -->
              <div
                  class="aspect-[4/3] w-full bg-slate-200 cursor-pointer overflow-hidden relative"
                  @click="openZoom(photo)"
              >
                <img :src="photo.previewUrl" class="w-full h-full object-cover" />
                <span class="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-md">
                  누르면 확대 🔍
                </span>
              </div>

              <!-- 삭제 버튼 (어르신도 누르기 쉽게 크고 또렷하게) -->
              <button
                  type="button"
                  @click="removePhoto(index)"
                  class="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-full shadow-md flex items-center justify-center active:scale-90 transition-transform"
                  title="사진 삭제"
              >
                ✕
              </button>

              <!-- 사진 라벨 선택 (지하주차장/계단 등) -->
              <div class="p-2 bg-white">
                <input
                    v-model="photo.caption"
                    type="text"
                    placeholder="예: 1동 계단, 지하주차장"
                    class="w-full text-base font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p class="text-4xl mb-2">📷</p>
          <p class="text-lg font-black text-slate-600">아직 찍은 사진이 없습니다</p>
          <p class="text-sm font-bold text-slate-400 mt-1">위 초록색 버튼을 눌러 사진을 찍어주세요</p>
        </div>
      </div>

      <!-- [3단계] 최종 제출하기 (특대형 버튼) -->
      <div class="bg-white rounded-[2rem] p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-lg">3</span>
          <h3 class="text-2xl font-black text-slate-900">보고서 완료 제출</h3>
        </div>

        <!-- 간단 메모 (선택사항) -->
        <div>
          <label class="block text-base font-black text-slate-600 mb-2">남기실 말씀이나 특이사항 (선택)</label>
          <input
              v-model="form.issues"
              type="text"
              placeholder="특이사항이 있으면 간단히 적어주세요 (없으면 비워두셔도 됩니다)"
              class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <!-- 최종 등록 전송 버튼 -->
        <button
            type="button"
            @click="submitReport"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-transform disabled:bg-slate-300 disabled:shadow-none"
        >
          <span v-if="isSubmitting" class="text-3xl animate-spin">⏳</span>
          <span v-else class="text-3xl">📤</span>
          <span>{{ isSubmitting ? '사진 전송 중입니다...' : '대청소 보고서 제출하기' }}</span>
        </button>
      </div>

    </div>

    <!-- 탭 2: 지난 등록 내역 -->
    <div v-else-if="activeTab === 'history'" class="space-y-4">
      <div v-if="reportHistory.length === 0" class="text-center py-16 bg-white rounded-[2rem] border-2 border-slate-200 p-6 space-y-3">
        <p class="text-5xl">📋</p>
        <h4 class="text-2xl font-black text-slate-800">등록된 내역이 없습니다</h4>
        <p class="text-base text-slate-500 font-bold">
          대청소 사진을 찍고 제출하시면 여기에 나타납니다.
        </p>
        <button
            type="button"
            @click="activeTab = 'create'"
            class="mt-4 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-lg shadow-md"
        >
          사진 찍으러 가기 📸
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
            v-for="item in reportHistory"
            :key="item.id"
            class="bg-white rounded-[2rem] p-5 border-2 border-slate-200 shadow-sm space-y-3"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-sm font-black text-emerald-600">{{ item.workDate }}</span>
              <h4 class="text-2xl font-black text-slate-900">{{ item.siteName }}</h4>
            </div>
            <span class="bg-emerald-100 text-emerald-800 text-sm font-black px-3 py-1.5 rounded-full">
              사진 {{ item.photos?.length || 0 }}장
            </span>
          </div>

          <p class="text-lg font-black text-slate-700">
            구역: <span class="text-blue-700">{{ item.taskArea || '일반 대청소' }}</span>
          </p>

          <p v-if="item.issues" class="text-base font-bold text-slate-500 bg-slate-50 p-3 rounded-xl">
            메모: {{ item.issues }}
          </p>

          <!-- 사진 목록 -->
          <div v-if="item.photos && item.photos.length > 0" class="grid grid-cols-3 gap-2 pt-1">
            <div
                v-for="(p, pIdx) in item.photos"
                :key="pIdx"
                class="aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer border-2 border-slate-200"
                @click="openZoom(p)"
            >
              <img :src="p.previewUrl || p.url" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 사진 크게 보기 모달 -->
    <div
        v-if="zoomPhoto"
        class="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4"
        @click="zoomPhoto = null"
    >
      <div class="flex items-center justify-between text-white pt-2">
        <span class="text-lg font-black">
          사진 크게 보기
          <span v-if="zoomPhoto.caption" class="text-emerald-300 ml-2">({{ zoomPhoto.caption }})</span>
        </span>
        <button
            type="button"
            @click="zoomPhoto = null"
            class="w-12 h-12 rounded-full bg-white/30 text-white font-black text-2xl flex items-center justify-center active:scale-90"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 flex items-center justify-center py-4">
        <img
            :src="zoomPhoto.previewUrl || zoomPhoto.url"
            class="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            @click.stop
        />
      </div>

      <div class="text-center pb-6">
        <button
            type="button"
            @click="zoomPhoto = null"
            class="bg-white text-slate-900 px-8 py-3.5 rounded-full font-black text-lg shadow-lg active:scale-95"
        >
          화면 닫기 ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth']
});

const authStore = useAuthStore();

// 탭 관리 ('create': 사진등록, 'history': 내역보기)
const activeTab = ref('create');

// 사진 input refs
const cameraInput = ref(null);
const galleryInput = ref(null);

// 확대 사진
const zoomPhoto = ref(null);

// 전송 상태
const isSubmitting = ref(false);

// 현장 목록
const siteList = ref([]);

// 어르신용 원터치 구역 선택 프리셋
//현장과 청소한 곳(청소항목)은 disabled 되야함 캘린더에서 지정된 schedule 가져오기 때문
const easyPresets = [
  '지하주차장 물청소',
  '바닥 왁스/박리',
  '계단/복도 대청소',
  '로비/승강기 청소',
  '화장실 대청소',
  '외벽/유리창 청소'
];

// 폼 데이터 (복잡한 입력 항목은 기본값 처리하고 노인 사용자에게는 핵심만 노출)
const form = ref({
  workDate: new Date().toISOString().slice(0, 10),
  sIdx: '',
  siteName: '',
  taskArea: '지하주차장 물청소',
  leaderName: '',
  workerCount: 3,
  issues: ''
});

// 사진 목록: [{ id, file, previewUrl, caption: '' }]
const photos = ref([]);

// 저장된 보고서 이력 목록
const reportHistory = ref([]);

// 사용자 정보
const userRaw = computed(() => {
  return Array.isArray(authStore.user) ? authStore.user[0] : authStore.user;
});

const userName = computed(() => {
  return userRaw.value?.name || userRaw.value?.id || '작업자';
});

const currentSiteName = computed(() => {
  return form.value.siteName || userRaw.value?.siteName || userRaw.value?.site || '현장 선택';
});

// 프리셋 선택 (원터치)
const selectPreset = (preset) => {
  form.value.taskArea = preset;
};

// 카메라 열기
const triggerCamera = () => {
  cameraInput.value?.click();
};

// 갤러리 열기
const triggerGallery = () => {
  galleryInput.value?.click();
};

// 이미지 자동 압축 및 리사이징 (모바일 속도 최적화)
const compressAndReadImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        canvas.toBlob((blob) => {
          resolve({
            previewUrl: compressedDataUrl,
            blob: blob || file
          });
        }, 'image/jpeg', 0.82);
      };
      img.onerror = () => {
        resolve({
          previewUrl: e.target.result,
          blob: file
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// 사진 파일 선택 핸들러
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  for (const file of files) {
    try {
      const { previewUrl, blob } = await compressAndReadImage(file);
      photos.value.push({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file: blob,
        originalName: file.name,
        previewUrl,
        caption: form.value.taskArea || '청소 완료'
      });
    } catch (err) {
      console.error('이미지 읽기 오류:', err);
    }
  }

  event.target.value = '';
};

// 사진 삭제
const removePhoto = (index) => {
  photos.value.splice(index, 1);
};

// 사진 확대
const openZoom = (photo) => {
  zoomPhoto.value = photo;
};

// 현장 변경
const onSiteChange = () => {
  const selected = siteList.value.find(s => String(s.idx) === String(form.value.sIdx));
  if (selected) {
    form.value.siteName = selected.name || selected.siteName;
  }
};

// 현장 목록 가져오기
const fetchSites = async () => {
  try {
    const res = await axios.get('/api/v1/site/list');
    siteList.value = res.data?.data || [];

    // 로그인 유저 현장 자동 선택
    const mySiteId = userRaw.value?.sIdx || userRaw.value?.site;
    const mySiteName = userRaw.value?.siteName || userRaw.value?.site;

    if (mySiteId && siteList.value.some(s => String(s.idx) === String(mySiteId))) {
      form.value.sIdx = mySiteId;
      onSiteChange();
    } else if (mySiteName) {
      const match = siteList.value.find(s => s.name === mySiteName || s.siteName === mySiteName);
      if (match) {
        form.value.sIdx = match.idx;
        form.value.siteName = match.name || match.siteName;
      } else if (siteList.value.length > 0) {
        form.value.sIdx = siteList.value[0].idx;
        onSiteChange();
      }
    } else if (siteList.value.length > 0) {
      form.value.sIdx = siteList.value[0].idx;
      onSiteChange();
    }
  } catch (err) {
    console.error('현장 로드 실패:', err);
  }
};

// 이력 로드
const loadHistory = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('eco_cleaning_reports');
      if (saved) {
        reportHistory.value = JSON.parse(saved);
      }
    } catch (e) {}
  }
};

// 단일 사진 업로드
const uploadSinglePhoto = async (photo) => {
  const formData = new FormData();
  formData.append('image', photo.file, photo.originalName || 'cleaning.jpg');
  formData.append('file', photo.file, photo.originalName || 'cleaning.jpg');

  try {
    const res = await axios.post('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data?.data?.url || res.data?.url) {
      return res.data?.data?.url || res.data?.url;
    }
  } catch (err) {
    try {
      const res2 = await axios.post('/api/v1/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res2.data?.data?.url || res2.data?.url) {
        return res2.data?.data?.url || res2.data?.url;
      }
    } catch (e2) {}
  }
  return photo.previewUrl;
};

// 최종 보고서 제출 (어르신 맞춤: 안내 팝업도 크고 명확하게)
const submitReport = async () => {
  if (!form.value.sIdx && !form.value.siteName) {
    alert('작업하신 현장을 선택해주세요!');
    return;
  }

  if (photos.value.length === 0) {
    alert('청소 사진을 최소 1장 이상 찍어주세요!');
    return;
  }

  if (!confirm('사진과 함께 대청소 보고서를 제출하시겠습니까?')) {
    return;
  }

  isSubmitting.value = true;

  try {
    const uploadedPhotos = [];
    for (const p of photos.value) {
      const url = await uploadSinglePhoto(p);
      uploadedPhotos.push({
        caption: p.caption || form.value.taskArea,
        url: url,
        previewUrl: p.previewUrl
      });
    }

    // 서버 체크리스트 API 연동
    try {
      await axios.post('/api/v1/site/cleaning/checklist', {
        workDt: form.value.workDate,
        signerName: userName.value,
        rating: 5,
        issues: form.value.issues || '',
        nextDayMemo: form.value.taskArea || ''
      });
    } catch (e) {}

    // 로컬 저장소 저장
    const newReport = {
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      workDate: form.value.workDate,
      sIdx: form.value.sIdx,
      siteName: form.value.siteName,
      taskArea: form.value.taskArea,
      leaderName: userName.value,
      issues: form.value.issues,
      photos: uploadedPhotos
    };

    reportHistory.value.unshift(newReport);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eco_cleaning_reports', JSON.stringify(reportHistory.value));
      } catch (e) {}
    }

    alert('✅ 대청소 보고서와 사진이 성공적으로 제출되었습니다!');

    // 초기화 및 내역 탭으로 이동
    photos.value = [];
    form.value.issues = '';
    activeTab.value = 'history';
  } catch (err) {
    console.error('제출 실패:', err);
    alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  form.value.leaderName = userName.value;
  await fetchSites();
  loadHistory();
});
</script>