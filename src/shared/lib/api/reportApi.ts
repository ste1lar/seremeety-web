import { auth } from '@/firebase';
import { baseApi } from '@/shared/lib/api/baseApi';
import { createReport } from '@/shared/lib/firebase/reports';
import type { ReportTargetType } from '@/shared/types/model/safety';

interface ReportArgs {
  targetType: ReportTargetType;
  targetId: string;
  targetUserId?: string;
  reason: string;
  description?: string;
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation<void, ReportArgs>({
      async queryFn(args) {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) {
            return { error: new Error('not_authenticated') };
          }
          await createReport(uid, args);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['Report'],
    }),
  }),
});

export const { useCreateReportMutation } = reportApi;
