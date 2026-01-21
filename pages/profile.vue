<template>
  <div class="page-container">

    <div class="page-header">
      <h2 class="page-title">👤 내 상세 정보</h2>

      <div v-if="statusMessage"
           :class="['status-message', statusClass]"
           role="alert">
        {{ statusMessage }}
      </div>
    </div>

    <div v-if="isFetching" class="loading-state">
      <p>✅ 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else>
      <form @submit.prevent="handleSave" class="detail-form">

        <section class="form-section">
          <h3 class="section-title">기본 정보</h3>
          <div class="form-grid">

            <div class="input-field required">
              <label for="name">이름</label>
              <input v-if="isEditMode" id="name" type="text" v-model="employee.name" class="input-text" placeholder="예: 김철수" />
              <p v-else class="data-display">{{ employee.name }}</p>
            </div>

            <div class="input-field required">
              <label for="id">사번 (로그인 ID)</label>
              <p class="data-display readonly">{{ employee.id }}</p>
            </div>

            <div class="input-field">
              <label for="phone">연락처</label>
              <input v-if="isEditMode" id="phone" type="tel" v-model="employee.phone" class="input-text" placeholder="예: 010-1234-5678" />
              <p v-else class="data-display">{{ employee.phone || 'N/A' }}</p>
            </div>

            <div class="input-field required">
              <label>성별</label>
              <div v-if="isEditMode" class="radio-group">
                <label>
                  <input type="radio" value="남" v-model="employee.gender" /> 남
                </label>
                <label>
                  <input type="radio" value="여" v-model="employee.gender" /> 여
                </label>
              </div>
              <p v-else class="data-display">{{ employee.gender || 'N/A' }}</p>
            </div>

            <div class="input-field">
              <label for="email">이메일</label>
              <input v-if="isEditMode" id="email" type="email" v-model="employee.email" class="input-text" />
              <p v-else class="data-display">{{ employee.email || 'N/A' }}</p>
            </div>

            <div class="input-field">
              <label for="birthDate">생년월일</label>
              <input v-if="isEditMode" id="birthDate" type="date" v-model="employee.birthDate" class="input-text" />
              <p v-else class="data-display">{{ employee.birthDate || 'N/A' }}</p>
            </div>

            <div class="input-field full-width">
              <label for="address">주소</label>
              <input v-if="isEditMode" id="address" type="text" v-model="employee.address" class="input-text" />
              <p v-else class="data-display">{{ employee.address || 'N/A' }}</p>
            </div>

          </div>
        </section>

        <section class="form-section contract-section">
          <button type="button" @click="showModal = true" class="btn btn-info">
            <span class="icon-doc">📄</span> 근로계약서 보기
          </button>
        </section>

        <section class="form-section">
          <h3 class="section-title">현장 및 직무 정보 (읽기 전용)</h3>
          <div class="form-grid">

            <div class="input-field required">
              <label for="site">근무 현장</label>
              <p class="data-display readonly">{{ employee.site }}</p>
            </div>

            <div class="input-field required">
              <label for="position">직위</label>
              <p class="data-display readonly">{{ employee.position }}</p>
            </div>

            <div class="input-field required">
              <label for="joinDate">입사일</label>
              <p class="data-display readonly">{{ employee.joinDate }}</p>
            </div>

            <div class="input-field">
              <label>재직 상태</label>
              <p :class="{'status-active': employee.status === '재직', 'status-inactive': employee.status === '퇴사'}" class="data-display readonly">
                {{ employee.status }}
              </p>
            </div>

            <template v-if="employee.status === '퇴사'">
              <div class="input-field required">
                <label for="departureDate">퇴사일</label>
                <p class="data-display readonly">{{ employee.departureDate || 'N/A' }}</p>
              </div>
            </template>

            <template v-if="employee.status === '퇴사'">
              <div class="input-field required">
                <label for="departureReason">퇴사 사유</label>
                <p class="data-display readonly">{{ employee.departureReason || 'N/A' }}</p>
              </div>
            </template>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">금융 및 기타 정보</h3>
          <div class="form-grid">

            <div class="input-field">
              <label for="bankName">은행</label>
              <input v-if="isEditMode" id="bankName" type="text" v-model="employee.bankName" class="input-text" />
              <p v-else class="data-display">{{ employee.bankName || 'N/A' }}</p>
            </div>

            <div class="input-field">
              <label for="accountNumber">계좌번호</label>
              <input v-if="isEditMode" id="accountNumber" type="text" v-model="employee.accountNumber" class="input-text" placeholder="숫자만 입력" />
              <p v-else class="data-display">{{ employee.accountNumber || 'N/A' }}</p>
            </div>

            <div class="input-field full-width">
              <label for="notes">비고</label>
              <textarea v-if="isEditMode" id="notes" v-model="employee.notes" class="input-text input-textarea"></textarea>
              <p v-else class="data-display data-textarea">{{ employee.notes || 'N/A' }}</p>
            </div>
          </div>
        </section>

      </form>

      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">

          <div class="modal-header">
            <h3 class="modal-title">근로계약서</h3>
            <button @click="showModal = false" class="close-btn">×</button>
          </div>

          <div class="modal-body custom-scrollbar">
            <div class="contract-document">
              <p class="document-date">작성일: {{ employee.joinDate }}</p>

              <div class="info-box">
                <p class="info-title"><strong>1. 사용자 (갑)</strong></p>
                <ul class="detail-list">
                  <li>사업체명: [회사명]</li>
                  <li>대 표 자: [대표자 이름]</li>
                  <li>주소: [회사 주소]</li>
                </ul>
                <p class="info-title"><strong>2. 근로자 (을)</strong></p>
                <ul class="detail-list">
                  <li>성명: {{ employee.name }}</li>
                  <li>사번: {{ employee.id }}</li>
                  <li>주소: {{ employee.address || '미입력' }}</li>
                  <li>연락처: {{ employee.phone || '미입력' }}</li>
                </ul>
              </div>

              <h4 class="section-sub-title">제 1조 (근로계약 기간)</h4>
              <p class="contract-text">{{ employee.joinDate }}부터 [계약 종료일]까지</p>

              <h4 class="section-sub-title">제 2조 (근무 장소 및 업무 내용)</h4>
              <p class="contract-text">
                근무 장소: {{ employee.site }} 현장<br>
                업무 내용: {{ employee.position }} 직무 관련 업무 일체
              </p>

              <h4 class="section-sub-title">제 3조 (근로 시간 및 휴게)</h4>
              <p class="contract-text">
                소정 근로시간은 1일 [8]시간, 1주 [40]시간을 원칙으로 하며 휴게시간은 [1]시간이다.
              </p>

              <h4 class="section-sub-title">제 4조 (임금)</h4>
              <p class="contract-text">
                월 임금은 [금액]이며, 매월 [정산일]에 근로자 (을)의 계좌({{ employee.bankName }} / {{ employee.accountNumber || '계좌번호 미등록' }})로 지급한다.
              </p>

              <p class="contract-summary">
                위 근로계약을 체결함에 있어, "갑"과 "을"은 근로조건에 대하여 상호 확인하고 서명 날인한다.
              </p>

              <div class="signature-box">
                <p><strong>년 월 일</strong></p>
                <p>사용자 (갑): [회사명] (서명 또는 인)</p>
                <p>근로자 (을): {{ employee.name }} (서명 또는 인)</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showModal = false" class="btn btn-secondary">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from "axios";

definePageMeta({
  middleware: ['auth']
})

const isEditMode = ref(false);
const showModal = ref(false);
const statusMessage = ref('');
const statusClass = ref(''); // 'status-success', 'status-error', 'status-info'
const isFetching = ref(true);
const isSaving = ref(false);

let originalEmployeeData = {};

const employee = ref({
  name: '김철수',
  id: 'EMP001',
  phone: '010-1234-5678',
  email: 'chulsoo@example.com',
  birthDate: '1990-03-15',
  address: '서울시 강남구',
  site: 'LH 위례 6단지',
  position: '관리자',
  joinDate: '2018-09-01',
  status: '재직',
  gender: '남',
  bankName: '국민은행',
  accountNumber: '123-45-67890-123',
  bigo: '주간 근무만 가능함.',
  departureDate: '',
  departureReason: '',
});

const showStatusMessage = (message, type = 'info') => {
  statusMessage.value = message;
  statusClass.value = `status-${type}`;

  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
};

const toggleEditMode = (enable) => {
  isEditMode.value = enable;

  if (enable) {
    originalEmployeeData = JSON.parse(JSON.stringify(employee.value));
    showStatusMessage("수정 모드가 활성화되었습니다.", 'info');
  } else {
    employee.value = JSON.parse(JSON.stringify(originalEmployeeData));
    showStatusMessage("수정이 취소되었습니다. 변경 사항이 반영되지 않았습니다.", 'error');
  }
};

const handleSave = async () => {
  if (!employee.value.name || !employee.value.gender) {
    showStatusMessage('이름과 성별은 필수 입력 항목입니다.', 'error');
    return;
  }

  if (employee.value.status === '퇴사' && (!employee.value.departureDate || !employee.value.departureReason)) {
    showStatusMessage('퇴사 상태일 경우, 퇴사일과 사유는 필수 입력 항목입니다.', 'error');
    return;
  }

  isSaving.value = true;

  try {
    // API 호출 (더미)
    // await axios.put(`/api/member/update/${employee.value.id}`, employee.value, { ... });
    await new Promise(resolve => setTimeout(resolve, 800));

    isEditMode.value = false;
    originalEmployeeData = JSON.parse(JSON.stringify(employee.value));
    showStatusMessage('직원 정보가 성공적으로 저장되었습니다.', 'success');

  } catch (error) {
    console.error('정보 저장 실패:', error);
    showStatusMessage('정보 저장에 실패했습니다.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const getMembers = async () => {
  isFetching.value = true;
  try {
    // 더미 데이터 로드 (실제 API로 대체)
    const mIdx = 1;
    const response = await axios.get(`/api/v1/member/data/${mIdx}`);
    const data = response.data.data[0];

    employee.value = {
      name: data.name || '',
      id: data.id || '',
      phone: data.phone || '',
      email: data.email || '',
      birthDate: data.birthDate ? data.birthDate.split('T')[0] : '1990-03-15',
      address: data.addr || '',
      site: data.siteName || '',
      position: data.positionName || '',
      joinDate: data.joinDate ? data.joinDate.split('T')[0] : '2018-09-01',
      status: data.status || '',
      gender: data.gender || '',
      bankName: data.bank || '',
      accountNumber: data.accountNo || '',
      bigo: data.bigo || '',
      departureDate: data.departureDate ? data.departureDate.split('T')[0] : '',
      departureReason: data.departureReason || '',
    };

    originalEmployeeData = JSON.parse(JSON.stringify(employee.value));

  } catch (error) {
    console.error('직원 정보 로드 실패:', error);
    // showStatusMessage('직원 정보를 불러오는 데 실패했습니다.', 'error');
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => {
  getMembers();
});
</script>

<style scoped>
/* 이전 답변들에서 제안된 모바일 친화적인 기본 스타일을 재적용 */

.page-container {
  padding: 10px;
  max-width: 600px;
  margin: 0 auto;
}

/* === 헤더 및 상태 === */
.page-header {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.page-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.status-message {
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}
.status-success { background-color: #e6ffe6; color: #4CAF50; }
.status-error { background-color: #ffe6e6; color: #f44336; }
.status-info { background-color: #eff6ff; color: #007bff; }

.button-group-header {
  display: flex;
  gap: 10px;
}

/* === 폼 및 섹션 === */
.detail-form {
  padding: 5px;
}
.form-section {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #eee;
}

/* === 그리드 및 필드 === */
.form-grid {
  display: grid;
  /* 모바일에서 1열, 큰 화면에서 2열 */
  grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
  gap: 15px;
}
@media (min-width: 500px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.input-field {
  display: flex;
  flex-direction: column;
}
.input-field label {
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 4px;
  font-weight: 600;
}
.input-field.required label:after {
  content: ' *';
  color: #f44336;
}
.full-width {
  grid-column: 1 / -1;
}

/* 입력 필드 기본 스타일 */
.input-text {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.input-text:focus {
  border-color: #007bff;
  outline: none;
}
.input-textarea {
  min-height: 80px;
  resize: vertical;
}

/* 데이터 표시 (읽기 모드) */
.data-display {
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #333;
  min-height: 40px;
  display: flex;
  align-items: center;
}
.data-display.readonly {
  background-color: #f0f0f0;
  font-weight: 600;
}
.data-textarea {
  white-space: pre-wrap;
  align-items: flex-start;
  min-height: 80px;
}
.status-active { color: #4CAF50; font-weight: bold; }
.status-inactive { color: #f44336; font-weight: bold; }

/* 라디오 버튼 그룹 */
.radio-group {
  display: flex;
  gap: 15px;
  padding-top: 5px;
}
.radio-group label {
  font-weight: 400;
  font-size: 0.9rem;
  color: #333;
}

/* === 버튼 스타일 === */
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}
.btn-primary { background-color: #007bff; color: white; }
.btn-primary:hover { background-color: #0056b3; }
.btn-success { background-color: #28a745; color: white; }
.btn-success:hover { background-color: #1e7e34; }
.btn-secondary { background-color: #f0f0f0; color: #333; }
.btn-secondary:hover { background-color: #e0e0e0; }

.contract-section {
  text-align: right;
  border: none;
  padding: 0;
  box-shadow: none;
  margin-bottom: 20px;
}
.btn-info { /* 근로계약서 버튼 */
  background-color: #17a2b8;
  color: white;
  padding: 10px 15px;
}
.btn-info:hover { background-color: #138496; }
.icon-doc { margin-right: 5px; font-size: 1.1rem; }

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 30px;
  font-size: 1rem;
  color: #007bff;
}

/* === 모달 스타일 === */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title { font-size: 1.2rem; font-weight: bold; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #777; }
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}
.modal-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 계약서 내용 */
.contract-document { font-size: 0.9rem; line-height: 1.5; color: #333; }
.document-date { text-align: right; margin-bottom: 15px; font-size: 0.85rem; }
.info-box {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}
.info-title { margin-top: 10px; font-weight: bold; }
.detail-list { list-style: disc; padding-left: 20px; margin-top: 5px; font-size: 0.85rem; }
.section-sub-title { font-size: 1rem; font-weight: bold; margin-top: 15px; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
.contract-text { padding-left: 10px; margin-top: 5px; }
.contract-summary { margin-top: 20px; text-align: center; font-style: italic; }
.signature-box { border-top: 1px dashed #ccc; padding-top: 15px; margin-top: 20px; text-align: right; }
</style>
