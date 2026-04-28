'use client';

import {
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import { getProfileByUserId } from '@/shared/lib/firebase/profiles';
import {
  createProfilePhoto,
  getProfilePhotosByUserId,
} from '@/shared/lib/firebase/profilePhotos';
import { setOnboardingStatus } from '@/shared/lib/firebase/usersV2';
import { writePhotoToLegacyUser } from '@/shared/lib/firebase/legacyBridge';
import { compressImage, dataURLToFile, uploadImageToStorage } from '@/shared/lib/media';
import CropperModal from '@/shared/components/common/cropper/CropperModal';
import Button from '@/shared/components/common/button/Button';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import styles from './PhotoStepPage.module.scss';

const PhotoStepPage = () => {
  const router = useRouter();
  const { currentUser } = useAuthSession();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [mainPhoto, setMainPhoto] = useState<ProfilePhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [openCropper, setOpenCropper] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const load = async () => {
      const profile = await getProfileByUserId(currentUser.uid);
      if (profile) {
        setProfileId(profile.id);
      }
      const photos = await getProfilePhotosByUserId(currentUser.uid);
      const main = photos.find((p) => p.isMain);
      if (main) {
        setMainPhoto(main);
        setImgError(false);
      }
      setIsLoading(false);
    };
    void load();
  }, [currentUser]);

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const compressed = await compressImage(file);
      setSelectedImage(URL.createObjectURL(compressed));
      setOpenCropper(true);
    } catch (err) {
      console.error(err);
      setError('이미지를 불러오지 못했어요.');
    }
    event.target.value = '';
  };

  const handleCropComplete = async () => {
    if (!croppedImage || !currentUser || !profileId) {
      setOpenCropper(false);
      return;
    }
    setOpenCropper(false);
    setIsUploading(true);
    setError(null);

    try {
      const uid = currentUser.uid;
      const file = dataURLToFile(croppedImage, 'profile_picture.jpg');
      const compressed = await compressImage(file);
      const uploadedUrl = await uploadImageToStorage(compressed, uid);

      const photoId = await createProfilePhoto(uid, profileId, {
        storagePath: `/profile_pictures/${uid}`,
        displayUrl: uploadedUrl,
        order: 1,
        isMain: true,
      });

      await writePhotoToLegacyUser(uid, uploadedUrl);

      setMainPhoto({
        id: photoId,
        userId: uid,
        profileId,
        storagePath: `/profile_pictures/${uid}`,
        displayUrl: uploadedUrl,
        order: 1,
        isMain: true,
        status: 'pending',
        createdAt: null,
        updatedAt: null,
      });
      setImgError(false);
      setCroppedImage(null);
    } catch (err) {
      console.error(err);
      setError('업로드 중 오류가 발생했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (!currentUser || !mainPhoto) {
      return;
    }
    setIsAdvancing(true);
    try {
      await setOnboardingStatus(currentUser.uid, 'preference_required');
      router.replace('/onboarding/preferences');
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했어요.');
      setIsAdvancing(false);
    }
  };

  return (
    <section className={styles.root}>
      <p className={styles.step}>STEP 3 / 6</p>
      <h1 className={styles.title}>프로필 사진</h1>
      <p className={styles.description}>
        대표 사진을 한 장 등록해주세요. 정사각형으로 잘라 올라갑니다.
      </p>

      <figure className={styles.preview}>
        {mainPhoto ? (
          <Image
            src={imgError ? sereMeetyLogo.src : mainPhoto.displayUrl}
            alt="대표 프로필 사진"
            fill
            sizes="(max-width: 480px) calc(100vw - 3rem), 432px"
            priority
            className={styles.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.placeholder}>아직 사진이 없어요</div>
        )}
        {isUploading && <div className={styles.uploadingOverlay}>업로드 중...</div>}
      </figure>

      <label className={styles.uploadLabel} htmlFor="onboarding-photo-input">
        {mainPhoto ? '사진 변경' : '사진 선택'}
      </label>
      <input
        id="onboarding-photo-input"
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleSelectImage}
        disabled={isUploading || isLoading}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button
          text={isAdvancing ? '저장 중...' : '다음으로'}
          onClick={
            mainPhoto && !isAdvancing && !isUploading ? () => void handleNext() : undefined
          }
        />
      </div>

      {openCropper && selectedImage && (
        <CropperModal
          selectedImage={selectedImage}
          setCroppedImage={setCroppedImage}
          setOpenCropper={setOpenCropper}
          handleCropComplete={handleCropComplete}
        />
      )}
    </section>
  );
};

export default PhotoStepPage;
