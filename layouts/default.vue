<template>
  <div class="mobile-layout">
    <header class="header">
      <h1 class="page-title">{{ currentPageTitle }}</h1>
      <div class="header-icons">
        <NuxtLink to="/notice" class="nav-item" active-class="active">
          <span class="icon">🔔</span>
          <!--span class="label">홈</span-->
        </NuxtLink>
      </div>
    </header>

    <main class="content">
      <slot />
    </main>

    <nav class="bottom-nav">
      <NuxtLink to="/" class="nav-item" active-class="active">
        <span class="icon">🏠</span>
        <span class="label">홈</span>
      </NuxtLink>
      <NuxtLink to="/attendance" class="nav-item" active-class="active">
        <span class="icon">📅</span>
        <span class="label">근무</span>
      </NuxtLink>
      <NuxtLink to="/request" class="nav-item" active-class="active">
        <span class="icon">📝</span>
        <span class="label">신청</span>
      </NuxtLink>
      <NuxtLink to="/profile" class="nav-item" active-class="active">
        <span class="icon">👤</span>
        <span class="label">내정보</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
const route = useRoute();

// 현재 경로에 따라 헤더 타이틀 동적 변경
const currentPageTitle = computed(() => {
  const path = route.path;
  if (path === '/') return '대시보드';
  if (path.includes('attendance')) return '근무 기록';
  if (path.includes('request')) return '신청';
  if (path.includes('profile')) return '마이페이지';
  if (path.includes('notice')) return '공지사항';
  return 'ERP 시스템';
});
</script>

<style scoped>
/* 모바일 웹앱 기본 스타일링 */
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 500px; /* 데스크탑에서 볼 때 모바일 비율 유지 */
  margin: 0 auto;
  background-color: #f8f9fa;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.header {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 80px; /* 하단 네비 높이만큼 여백 */
}

.bottom-nav {
  height: 64px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eee;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #999;
  font-size: 0.75rem;
  transition: color 0.2s;
}

.nav-item.active {
  color: #4A90E2; /* 활성화 색상 */
}

.icon {
  font-size: 1.4rem;
  margin-bottom: 4px;
}
</style>
