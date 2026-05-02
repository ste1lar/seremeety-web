import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/shared/types/model/user';
import type { RootState } from './store';

// Firebase auth는 onAuthStateChanged 구독 stream이라 server-state(RTK Query)
// 도메인은 아니다. Firebase User 객체 자체도 메서드 가진 클래스라 직렬화 불가.
// 따라서 auth slice에는 직렬화 가능한 메타(uid + role + 두 단계 로딩)만 보관하고,
// User 메서드(getIdToken 등)가 필요한 곳에서는 firebase의 모듈 글로벌인
// `auth.currentUser`를 직접 참조한다.
interface AuthState {
  uid: string | null;
  role: UserRole | null;
  isInitializing: boolean; // onAuthStateChanged 첫 콜백 전
  isReady: boolean;        // user doc / V2 부트스트랩 완료
}

const initialState: AuthState = {
  uid: null,
  role: null,
  isInitializing: true,
  isReady: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUid: (state, action: PayloadAction<string | null>) => {
      state.uid = action.payload;
      if (action.payload === null) {
        state.isReady = false;
        state.role = null;
      }
    },
    setAuthRole: (state, action: PayloadAction<UserRole | null>) => {
      state.role = action.payload;
    },
    setAuthInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },
  },
});

export const {
  setAuthUid,
  setAuthRole,
  setAuthInitializing,
  setAuthReady,
} = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUid = (state: RootState) => state.auth.uid;
export const selectAuthRole = (state: RootState) => state.auth.role;
export const selectIsAdmin = (state: RootState) => state.auth.role === 'admin';

// "로딩 중"의 정의: 초기화 전이거나, 로그인된 상태인데 user doc 부트스트랩이 끝나지 않음.
export const selectIsAuthLoading = (state: RootState) =>
  state.auth.isInitializing ||
  (state.auth.uid !== null && !state.auth.isReady);

// 인증 완료 + 부트스트랩 완료된 상태인지 한 번에 판단.
export const selectIsAuthenticated = (state: RootState) =>
  !state.auth.isInitializing && state.auth.uid !== null && state.auth.isReady;
