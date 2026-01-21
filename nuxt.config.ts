// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
    modules: [],
    // 환경 변수 설정
    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
        }
    },
    devServer: {
        port: 3020,   // 원하는 포트
        host: '0.0.0.0'  // 선택: 로컬 LAN 접속 허용
    },
    vite: {
        server: {
            proxy: {
                "/api": {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''), // 이제 에러 안 납니다!
                }
            }
        }
    }
})
