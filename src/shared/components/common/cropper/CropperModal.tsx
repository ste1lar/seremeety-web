import { ChevronLeft } from 'lucide-react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import { useRef } from 'react';
import type { CropperModalProps } from '@/shared/types/domain';

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
    const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
    setCroppedImage(croppedDataURL);
  };

  return (
    <div className="cropper-modal-custom">
      <div className="cropper-modal-custom__menu">
        <button
          className="cropper-modal-custom__back-button"
          type="button"
          onClick={() => setOpenCropper(false)}
        >
          <ChevronLeft aria-hidden="true" className="cropper-modal-custom__icon" size="1em" />
        </button>
        <button
          className="cropper-modal-custom__apply-button"
          type="button"
          onClick={handleCropComplete}
        >
          적용
        </button>
      </div>
      <div className="cropper-modal-custom__wrapper">
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
