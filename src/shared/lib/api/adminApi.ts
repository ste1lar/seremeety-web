import { Timestamp } from 'firebase/firestore';
import { auth } from '@/firebase';
import { baseApi } from '@/shared/lib/api/baseApi';
import { writeProfileStatusToLegacyUser } from '@/shared/lib/firebase/legacyBridge';
import {
  getPhotosByStatus,
  updateProfilePhoto,
} from '@/shared/lib/firebase/profilePhotos';
import {
  getProfilesByStatus,
  updateProfile,
} from '@/shared/lib/firebase/profiles';
import {
  getReportsByStatus,
  reviewReport,
} from '@/shared/lib/firebase/reports';
import {
  getUsersByStatus,
  setOnboardingStatus,
  setUserStatus,
} from '@/shared/lib/firebase/usersV2';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import type { Profile } from '@/shared/types/model/profile';
import type { Report } from '@/shared/types/model/safety';
import type { User, UserStatus } from '@/shared/types/model/user';

interface ProfileReviewArgs {
  profileId: string;
  userId: string;
  reason?: string;
}

interface PhotoReviewArgs {
  photoId: string;
  reason?: string;
}

interface ReportReviewArgs {
  reportId: string;
  resolutionNote?: string;
}

interface SetUserStatusArgs {
  uid: string;
  status: UserStatus;
}

// TODO(Phase 3): Functions로 이동. role 검증은 서버 측이 정석. 현재는 클라이언트에서
// role==='admin' 체크 + Firestore Security Rules 보강이 임시 방어선이다.
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingProfiles: builder.query<Profile[], void>({
      async queryFn() {
        try {
          const data = await getProfilesByStatus('pending');
          return { data };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ['AdminReview'],
    }),

    getPendingPhotos: builder.query<ProfilePhoto[], void>({
      async queryFn() {
        try {
          const data = await getPhotosByStatus('pending');
          return { data };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ['AdminReview'],
    }),

    // 프로필 승인: status -> 'approved', users.profileStatus=1, onboardingStatus='approved'.
    approveProfile: builder.mutation<void, ProfileReviewArgs>({
      async queryFn({ profileId, userId }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await updateProfile(profileId, {
            status: 'approved',
            reviewedAt: Timestamp.now(),
            reviewedBy: reviewerUid,
          });
          await writeProfileStatusToLegacyUser(userId, true);
          await setOnboardingStatus(userId, 'approved');
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['AdminReview', 'Profile', 'Me'],
    }),

    // 프로필 반려: status -> 'rejected' + 사유, users.profileStatus=0,
    // onboardingStatus='review_rejected'. 사용자는 /onboarding/rejected에서 재작성 진입.
    rejectProfile: builder.mutation<void, ProfileReviewArgs>({
      async queryFn({ profileId, userId, reason }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await updateProfile(profileId, {
            status: 'rejected',
            rejectionReason: reason ?? '',
            reviewedAt: Timestamp.now(),
            reviewedBy: reviewerUid,
          });
          await writeProfileStatusToLegacyUser(userId, false);
          await setOnboardingStatus(userId, 'review_rejected');
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['AdminReview', 'Profile', 'Me'],
    }),

    approvePhoto: builder.mutation<void, PhotoReviewArgs>({
      async queryFn({ photoId }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await updateProfilePhoto(photoId, {
            status: 'approved',
            reviewedAt: Timestamp.now(),
            reviewedBy: reviewerUid,
          });
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['AdminReview', 'Photo'],
    }),

    rejectPhoto: builder.mutation<void, PhotoReviewArgs>({
      async queryFn({ photoId, reason }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await updateProfilePhoto(photoId, {
            status: 'rejected',
            rejectionReason: reason ?? '',
            reviewedAt: Timestamp.now(),
            reviewedBy: reviewerUid,
            // 반려된 사진은 메인이 될 수 없도록 isMain 해제.
            isMain: false,
          });
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['AdminReview', 'Photo'],
    }),

    getOpenReports: builder.query<Report[], void>({
      async queryFn() {
        try {
          const data = await getReportsByStatus('open');
          return { data };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ['Report'],
    }),

    resolveReport: builder.mutation<void, ReportReviewArgs>({
      async queryFn({ reportId, resolutionNote }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await reviewReport(reportId, {
            status: 'resolved',
            reviewedBy: reviewerUid,
            resolutionNote,
          });
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['Report'],
    }),

    dismissReport: builder.mutation<void, ReportReviewArgs>({
      async queryFn({ reportId, resolutionNote }) {
        try {
          const reviewerUid = auth.currentUser?.uid;
          if (!reviewerUid) {
            return { error: new Error('not_authenticated') };
          }
          await reviewReport(reportId, {
            status: 'dismissed',
            reviewedBy: reviewerUid,
            resolutionNote,
          });
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['Report'],
    }),

    getSuspendedUsers: builder.query<User[], void>({
      async queryFn() {
        try {
          const data = await getUsersByStatus('suspended');
          return { data };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ['AdminReview'],
    }),

    // 사용자 정지/복구. 정지 시 legacy users.profileStatus도 0으로 dual-write해
    // 추천 후보에서 즉시 제외되도록 한다. 복구 시 사용자가 매칭에 다시 노출되려면
    // 본인이 마이페이지에서 저장하거나 admin이 별도로 profileStatus=1 처리해야 함.
    setUserStatus: builder.mutation<void, SetUserStatusArgs>({
      async queryFn({ uid, status }) {
        try {
          await setUserStatus(uid, status);
          if (status !== 'active') {
            await writeProfileStatusToLegacyUser(uid, false);
          }
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ['AdminReview', 'Recommendation'],
    }),
  }),
});

export const {
  useGetPendingProfilesQuery,
  useGetPendingPhotosQuery,
  useApproveProfileMutation,
  useRejectProfileMutation,
  useApprovePhotoMutation,
  useRejectPhotoMutation,
  useGetOpenReportsQuery,
  useResolveReportMutation,
  useDismissReportMutation,
  useGetSuspendedUsersQuery,
  useSetUserStatusMutation,
} = adminApi;
