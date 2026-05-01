'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Plus, Star, X } from 'lucide-react';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import CropperModal from '@/shared/components/common/cropper/CropperModal';
import {
  MAX_PROFILE_PHOTOS,
  createProfilePhoto,
  getProfilePhotosByUserId,
  setMainProfilePhoto,
  softDeleteProfilePhoto,
} from '@/shared/lib/firebase/profilePhotos';
import { writePhotoToLegacyUser } from '@/shared/lib/firebase/legacyBridge';
import { compressImage, dataURLToFile, uploadImageToStorage } from '@/shared/lib/media';
import { cx } from '@/shared/lib/classNames';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import styles from './ProfilePhotosManager.module.scss';

interface ProfilePhotosManagerProps {
  userId: string;
  profileId: string;
  onChange?: (photos: ProfilePhoto[]) => void;
}

const ProfilePhotosManager = ({ userId, profileId, onChange }: ProfilePhotosManagerProps) => {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getProfilePhotosByUserId(userId);
        setPhotos(list);
        onChange?.(list);
      } catch (err) {
        console.error(err);
        setError('사진을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    // onChange는 의도적으로 deps에서 제외 (마운트 시 1회 호출)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const refresh = async () => {
    const list = await getProfilePhotosByUserId(userId);
    setPhotos(list);
    onChange?.(list);
    return list;
  };

  const handleSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    setError(null);
    try {
      const compressed = await compressImage(file);
      setSelectedImage(URL.createObjectURL(compressed));
      setOpenCropper(true);
    } catch (err) {
      console.error(err);
      setError('이미지를 불러오지 못했어요.');
    }
  };

  const handleCropComplete = async () => {
    if (!croppedImage) {
      setOpenCropper(false);
      return;
    }
    setOpenCropper(false);
    setIsUploading(true);
    setError(null);

    try {
      const file = dataURLToFile(croppedImage, 'profile_picture.jpg');
      const compressed = await compressImage(file);
      const uploadedUrl = await uploadImageToStorage(compressed, userId);

      const isFirstPhoto = photos.length === 0;
      const nextOrder = photos.reduce((max, p) => Math.max(max, p.order), 0) + 1;

      await createProfilePhoto(userId, profileId, {
        storagePath: `/profile_pictures/${userId}`,
        displayUrl: uploadedUrl,
        order: nextOrder,
        isMain: isFirstPhoto,
      });

      if (isFirstPhoto) {
        await writePhotoToLegacyUser(userId, uploadedUrl);
      }

      await refresh();
      setCroppedImage(null);
    } catch (err) {
      console.error(err);
      setError('업로드 중 오류가 발생했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetMain = async (photo: ProfilePhoto) => {
    if (photo.isMain || photo.status === 'rejected') {
      return;
    }
    setBusyPhotoId(photo.id);
    setError(null);
    try {
      await setMainProfilePhoto(userId, photo.id);
      await writePhotoToLegacyUser(userId, photo.displayUrl);
      await refresh();
    } catch (err) {
      console.error(err);
      setError('메인 사진 설정 중 오류가 발생했어요.');
    } finally {
      setBusyPhotoId(null);
    }
  };

  const handleDelete = async (photo: ProfilePhoto) => {
    setBusyPhotoId(photo.id);
    setError(null);
    try {
      await softDeleteProfilePhoto(photo.id);
      const remaining = await refresh();

      // 메인 사진을 삭제한 경우 다음 후보(첫 비삭제 사진)를 메인으로 자동 승격.
      if (photo.isMain && remaining.length > 0 && !remaining.some((p) => p.isMain)) {
        const nextMain = remaining[0];
        await setMainProfilePhoto(userId, nextMain.id);
        await writePhotoToLegacyUser(userId, nextMain.displayUrl);
        await refresh();
      } else if (remaining.length === 0) {
        await writePhotoToLegacyUser(userId, '');
      }
    } catch (err) {
      console.error(err);
      setError('사진 삭제 중 오류가 발생했어요.');
    } finally {
      setBusyPhotoId(null);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>사진을 불러오고 있어요...</div>;
  }

  const emptySlots = Math.max(MAX_PROFILE_PHOTOS - photos.length, 0);

  return (
    <section className={styles.root} aria-labelledby="photos-section-title">
      <header className={styles.header}>
        <h2 className={styles.title} id="photos-section-title">
          프로필 사진
        </h2>
        <p className={styles.subtitle}>
          최대 {MAX_PROFILE_PHOTOS}장까지 등록할 수 있어요. 첫 번째 사진이 메인입니다.
        </p>
      </header>

      <div className={styles.grid}>
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            busy={busyPhotoId === photo.id}
            onDelete={() => void handleDelete(photo)}
            onSetMain={() => void handleSetMain(photo)}
          />
        ))}

        {emptySlots > 0 && (
          <label
            className={cx(styles.slot, styles['slot--empty'], isUploading && styles.busy)}
          >
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleSelectFile}
              disabled={isUploading}
            />
            {isUploading ? (
              <span className={styles.slotLabel}>업로드 중...</span>
            ) : (
              <>
                <Plus aria-hidden="true" size={28} />
                <span className={styles.slotLabel}>사진 추가</span>
              </>
            )}
          </label>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

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

interface PhotoCardProps {
  photo: ProfilePhoto;
  busy: boolean;
  onDelete: () => void;
  onSetMain: () => void;
}

const PhotoCard = ({ photo, busy, onDelete, onSetMain }: PhotoCardProps) => {
  const [imgError, setImgError] = useState(false);
  const showSetMainButton = !photo.isMain && photo.status !== 'rejected';

  return (
    <figure className={cx(styles.slot, photo.isMain && styles['slot--main'])}>
      <Image
        alt="프로필 사진"
        src={imgError ? sereMeetyLogo.src : photo.displayUrl}
        fill
        sizes="(max-width: 480px) 30vw, 160px"
        loading="eager"
        className={styles.image}
        onError={() => setImgError(true)}
      />

      {photo.status === 'pending' && <span className={styles.badgePending}>심사 중</span>}
      {photo.status === 'rejected' && (
        <span className={styles.badgeRejected}>반려</span>
      )}
      {photo.isMain && (
        <span className={styles.badgeMain}>
          <Star aria-hidden="true" size={12} /> 메인
        </span>
      )}

      <div className={styles.actions}>
        {showSetMainButton && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onSetMain}
            disabled={busy}
            aria-label="메인 사진으로 설정"
          >
            <Star aria-hidden="true" size={14} />
          </button>
        )}
        <button
          type="button"
          className={cx(styles.actionButton, styles['actionButton--danger'])}
          onClick={onDelete}
          disabled={busy}
          aria-label="사진 삭제"
        >
          <X aria-hidden="true" size={14} />
        </button>
      </div>

      {busy && <div className={styles.busyOverlay}>처리 중...</div>}
    </figure>
  );
};

export default ProfilePhotosManager;
