import { ChevronLeft } from 'lucide-react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import { useRef } from 'react';
import type { CropperModalProps } from '@/shared/types/domain';
import styles from './CropperModal.module.scss';

const CropperModal = ({
  selectedImage,
  setCroppedImage,
  setOpenCropper,
  handleCropComplete,
}: CropperModalProps) => {
  const cropperRef = useRef<ReactCropperElement | null>(null);

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return;
    }
    const croppedDataURL = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.85);
    setCroppedImage(croppedDataURL);
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <button
          className={styles.back}
          type="button"
          onClick={() => setOpenCropper(false)}
          aria-label="이미지 자르기 닫기"
        >
          <ChevronLeft aria-hidden="true" className={styles.icon} size="1em" />
        </button>
        <button
          className={styles.apply}
          type="button"
          onClick={handleCropComplete}
        >
          적용
        </button>
      </div>
      <div className={styles.canvas}>
        <Cropper
          src={selectedImage}
          crop={onCrop}
          ref={cropperRef}
          aspectRatio={1}
          viewMode={1}
          background={false}
          guides={false}
        />
      </div>
    </div>
  );
};

export default CropperModal;
