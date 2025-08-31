import './MypageContent.css';
import MyProfilePreview from './MyProfilePreview';
import ProfileStatusBox from './ProfileStatusBox';

const MypageContent = ({ userProfile }) => {
  return (
    <div className="mypage-content">
      <MyProfilePreview userProfile={userProfile} />
      <ProfileStatusBox
        stats={{
          hasProfileImage: true,
          introLength: 234,
          hasSelso: false,
          requestsReceived: 7,
          profileRating: 'Shine', // Light, Calm, Glow, Shine, Brilliant, Star, Superstar
        }}
      />
    </div>
  );
};

export default MypageContent;
