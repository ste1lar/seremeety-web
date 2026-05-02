import { auth } from '@/firebase';
import { baseApi } from '@/shared/lib/api/baseApi';
import {
  createBlock,
  getBlockedUserIds,
} from '@/shared/lib/firebase/blocks';

interface BlockArgs {
  blockedUserId: string;
  reason?: string;
}

export const blockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 내가 차단한 사용자 uid 목록. ProfilePage 차단 상태 표시에 사용.
    getMyBlockedUserIds: builder.query<string[], void>({
      async queryFn() {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) return { data: [] };
          const set = await getBlockedUserIds(uid);
          return { data: Array.from(set) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ['Block'],
      // 차단 목록은 거의 변하지 않음.
      keepUnusedDataFor: 300,
    }),

    block: builder.mutation<void, BlockArgs>({
      // Optimistic update: 차단 즉시 헤더 차단 버튼이 사라지도록 캐시에 추가.
      async onQueryStarted({ blockedUserId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          blockApi.util.updateQueryData('getMyBlockedUserIds', undefined, (draft) => {
            if (!draft.includes(blockedUserId)) {
              draft.push(blockedUserId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      async queryFn({ blockedUserId, reason }) {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) {
            return { error: new Error('not_authenticated') };
          }
          await createBlock(uid, blockedUserId, reason);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      // 차단 시 추천도 다시 페치되도록 Recommendation도 무효화.
      invalidatesTags: ['Block', 'Recommendation'],
    }),
  }),
});

export const { useGetMyBlockedUserIdsQuery, useBlockMutation } = blockApi;
