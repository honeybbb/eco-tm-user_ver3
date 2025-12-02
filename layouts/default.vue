<template>
  <div id="app-layout">
    <main>
      <slot />
    </main>

    <nav v-if="isLoggedIn" class="bottom-nav">
      <NuxtLink to="/" class="nav-item">
        <span class="icon">⏰</span>
        <span class="label">출퇴근</span>
      </NuxtLink>
      <NuxtLink to="/profile" class="nav-item">
        <span class="icon">👤</span>
        <span class="label">내정보</span>
      </NuxtLink>
      <NuxtLink to="/records" class="nav-item">
        <span class="icon">📊</span>
        <span class="label">근무기록</span>
      </NuxtLink>
      <NuxtLink to="/notice" class="nav-item">
        <span class="icon">📢</span>
        <span class="label">공지</span>
      </NuxtLink>
      <div @click="logout" class="nav-item logout-item">
        <span class="icon">🚪</span>
        <span class="label">로그아웃</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';
import { onMounted } from 'vue';

const { isLoggedIn, logout, checkAuth } = useAuth();

onMounted(() => {
  // 페이지 로드 후 인증 상태 다시 확인 (SSR/CSR 환경 전환 대비)
  checkAuth();
})
</script>

<style scoped>
/* 1. 메인 영역 설정: 하단 메뉴 높이만큼 패딩을 주어 콘텐츠가 가려지지 않게 함
2. 하단 네비게이션 설정: fixed position으로 화면 아래에 고정
*/

#app-layout {
  min-height: 100vh;
  background: #f8f8f8;
}

main {
  padding: 10px;
  max-width: 600px;
  margin: 0 auto;
  /* 하단 네비게이션 바 높이(약 60px)를 고려하여 패딩 추가 */
  padding-bottom: 70px;
}

/* --- 하단 네비게이션 바 스타일 --- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;

  /* 디자인 */
  background-color: #ffffff;
  color: #333;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1); /* 상단 그림자 */
  height: 60px;
  max-width: 600px; /* 메인 콘텐츠와 너비 맞춤 */
  margin: 0 auto;
  z-index: 100; /* 다른 요소 위에 표시 */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 5px;
  flex-grow: 1; /* 영역 균등 분할 */
  transition: color 0.2s;
}

.nav-item:hover {
  color: #007bff; /* 호버 색상 */
}

/* 활성화된 (현재 라우트) 아이템 */
.nav-item.router-link-active {
  color: #007bff; /* 활성화된 색상 */
  font-weight: bold;
}

.icon {
  font-size: 18px; /* 아이콘 크기 */
}

.label {
  font-size: 10px; /* 텍스트 크기 */
  margin-top: 2px;
}

.logout-item {
  cursor: pointer;
}

.logout-item:hover {
  color: #ff6347;
}

/* 로그인 페이지에서는 하단 바 숨김 처리는 v-if="isLoggedIn"이 처리합니다. */
</style>
