import './MyProfileContent.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { compressImage, getAgeByBirthDate, myProfileForm } from '../../utils';
import CropperModal from '../common/cropper/CropperModal';
import ImageLoading from '../common/image-loading/ImageLoading';
import MyProfileForm from './MyProfileForm';

const MyProfileContent = ({ userProfile, setFormData, style }) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);
  const imageUploadRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleFormDataChange = useCallback(
    (id, data) => {
      setFormData((prevState) => {
        const updatedData = { ...prevState, [id]: data };
        if (id === 'birthdate') {
          updatedData['age'] = data ? `${getAgeByBirthDate(data)}세` : '';
        }
        return updatedData;
      });
    },
    [setFormData]
  );

  const handleSelectImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setSelectedImage(URL.createObjectURL(compressedFile));
        setOpenCropper(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleCropComplete = () => {
    setFormData({ ...userProfile, profilePictureUrl: croppedImage });
    setOpenCropper(false);
  };

  return (
    <div className="my-profile-content" style={style}>
      {openCropper && (
        <CropperModal
          selectedImage={selectedImage}
          setCroppedImage={setCroppedImage}
          setOpenCropper={setOpenCropper}
          handleCropComplete={handleCropComplete}
        />
      )}
      <div className="my-profile-content__img-section">
        {!isImgLoaded && <ImageLoading borderRadius={'5px'} />}
        <img
          alt="PROFILE"
          src={userProfile['profilePictureUrl']}
          onClick={() => imageUploadRef.current.click()}
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </div>
      <input
        type="file"
        ref={imageUploadRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleSelectImage}
      />
      {myProfileForm.map((it, idx) => (
        <MyProfileForm
          key={idx}
          {...it}
          data={userProfile[it.id]}
          onChange={handleFormDataChange}
          isDisabled={userProfile['profileStatus']}
        />
      ))}
    </div>
  );
};

export default MyProfileContent;
