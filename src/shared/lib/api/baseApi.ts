import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

// ROADMAP Phase 6: 모든 도메인 API slice는 baseApi.injectEndpoints로 확장한다.
// 옵션 A — Phase 3(Functions) 도입 전까지 queryFn은 src/shared/lib/firebase/* 헬퍼를
// 직접 호출하고, 추후 Functions 이전 시 queryFn 본체만 교체하면 컴포넌트는 그대로 둔다.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<Error>(),
  tagTypes: [
    'Me',
    'EntryState',
    'Onboarding',
    'Profile',
    'Preference',
    'Photo',
    'Recommendation',
    'Reaction',
    'Match',
    'Message',
    'Block',
    'Report',
    'IdentityVerification',
    'Entitlement',
    'Payment',
    'AdminReview',
  ],
  endpoints: () => ({}),
});
