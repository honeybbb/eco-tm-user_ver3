// composables/useLocation.js

import { ref, computed } from 'vue';

// --- 설정값 (Config) ---
// const OFFICE_LAT = 37.5665; // 근무지 위도
// const OFFICE_LNG = 126.9780; // 근무지 경도
// const ALLOWED_DISTANCE_M = 100; // 허용 오차 거리 (미터 단위)
const OFFICE_LAT = 37.557833; // 근무지 위도
const OFFICE_LNG = 126.921850; // 근무지 경도
const ALLOWED_DISTANCE_M = 10000; // 허용 오차 거리 (미터 단위)

const userLocation = ref(null); // { lat, lng }

// 두 지점 간의 거리 계산 함수 (Haversine 공식)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 거리 (미터)
};

export const useLocation = () => {
    const statusMessage = ref('위치 정보를 가져오는 중...');
    const isLocationFetched = ref(false);

    const fetchUserLocation = () => {
        if (process.client && !navigator.geolocation) {
            statusMessage.value = '🚨 이 브라우저는 위치 정보를 지원하지 않습니다.';
            isLocationFetched.value = true;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.value = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                const distance = getDistance(
                    userLocation.value.lat, userLocation.value.lng,
                    OFFICE_LAT, OFFICE_LNG
                );

                if (distance <= ALLOWED_DISTANCE_M) {
                    statusMessage.value = `✅ 근무지 근처입니다. (거리: ${Math.round(distance)}m)`;
                } else {
                    statusMessage.value = `⚠️ 근무지 외 지역입니다. (거리: ${Math.round(distance)}m) 기록 불가.`;
                }

                isLocationFetched.value = true;
            },
            (error) => {
                statusMessage.value = `❌ 위치 정보 로드 실패: ${error.message}. 설정 확인 필요.`;
                isLocationFetched.value = true;
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const isLocationValid = computed(() => {
        if (!userLocation.value) return false;

        const distance = getDistance(
            userLocation.value.lat, userLocation.value.lng,
            OFFICE_LAT, OFFICE_LNG
        );

        return distance <= ALLOWED_DISTANCE_M;
    });

    return {
        userLocation,
        statusMessage,
        isLocationFetched,
        isLocationValid,
        fetchUserLocation,
        OFFICE_LAT,
        OFFICE_LNG
    };
};
