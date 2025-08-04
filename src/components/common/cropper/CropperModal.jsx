import { Cropper } from "react-cropper";
import "./CropperModal.css";
import "cropperjs/dist/cropper.css";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../../../utils";

const CropperModal = ({ selectedImage, setCroppedImage, setOpenCropper, handleCropComplete }) => {
    const cropperRef = useRef(null);

    const onCrop = () => {
        const imageElement = cropperRef.current;
        const cropper = imageElement.cropper;
        const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
        setCroppedImage(croppedDataURL);
    };

    return (
        <div className="cropper-modal-custom">
            <div className="cropper-modal-custom__menu">
                <div className="cropper-modal-custom__back-button" onClick={() => setOpenCropper(false)}>
                    <FontAwesomeIcon
                        icon={icons.faAngleLeft}
                        className="cropper-modal-custom__icon"
                    />
                </div>
                <div className="cropper-modal-custom__apply-button" onClick={handleCropComplete}>
                    적용
                </div>
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
                    data={{ width: "100%" }}
                />
            </div>
        </div>
    );
};

export default CropperModal;