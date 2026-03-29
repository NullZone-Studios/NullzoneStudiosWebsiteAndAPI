import React, { useState, useEffect } from 'react';
import './MiniProfile.css';
import FallbackImage from '../../assets/images/profile-img-standin.png'
import Icon from '../Frontend/Icon/Icon';

const userProfile = {
  username: 'Unknown',
  name: 'Unknown User',
  about: 'User information could not be loaded.',
  profileImage: FallbackImage
};

const MiniProfile = ({ username, position, isVisible, onClose }) => {
  const [profileData, setProfileData] = useState(userProfile);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !username) return;

    setIsLoading(true);

    const fetchProfile = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`/api/user/${username}`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Failed to fetch user profile:', error);
        return userProfile;
      }
    };

    fetchProfile().then((data) => {
      setProfileData(data);
      setIsLoading(false);
    });
  }, [username, isVisible]);

  if (!isVisible || !username) return null;

  const style = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
  };

  return (
    <div className="mini-profile" style={style} onClick={(e) => e.stopPropagation()}>
      <div className="mini-profile-header">
        {isLoading ? (
          <>
            <div className="mini-profile-loading-spinner"></div>
            <div className="mini-profile-info">
              <h4>Loading...</h4>
              <p>Fetching user data</p>
            </div>
          </>
        ) : (
          <>
            <img src={profileData.img} alt={profileData.name} className="mini-profile-avatar" />
            <div className="mini-profile-info">
              <h4>{profileData.name}</h4>
              <p>{profileData.accessLevel}</p>
            </div>
          </>
        )}
        <button className="mini-profile-close" onClick={onClose}>
          <Icon name="x-lg" />
        </button>
      </div>
      <div className="mini-profile-about">
        <p>{isLoading ? '' : profileData.about}</p>
      </div>
    </div>
  );
};

export default MiniProfile;
