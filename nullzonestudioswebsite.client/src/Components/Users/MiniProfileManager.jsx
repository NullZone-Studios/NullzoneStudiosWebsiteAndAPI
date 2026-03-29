import React, { useState } from 'react';
import MiniProfile from './MiniProfile';
import Logo from '../../assets/nullzone_logo.png';

let setMiniProfileGlobal = null;

export const MiniProfileManagerAPI = {
  openMiniProfile: (userId, event) => {
    if (!event) {
      setMiniProfileGlobal({
        isVisible: true,
        position: { x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100 },
        userId,
      });
      return;
    }

    event.stopPropagation();

    const cardWidth = 320;
    const screenWidth = window.innerWidth;
    const clickX = event.clientX;

    // If click is on the right half of the screen, position card to the left of cursor
    const x = clickX > screenWidth / 2 ? clickX - cardWidth : clickX;

    setMiniProfileGlobal({
      isVisible: true,
      position: { x, y: event.clientY },
      userId,
    });
  },

  closeMiniProfile: () => {
    setMiniProfileGlobal(prev => ({ ...prev, isVisible: false }));
  },
};

const MiniProfileManager = () => {
  const [miniProfile, setMiniProfile] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    userId: null,
  });

  setMiniProfileGlobal = setMiniProfile;

  return (
    <>
      {miniProfile.isVisible && (
        <div
          className="mini-profile-overlay"
          onClick={() => MiniProfileManagerAPI.closeMiniProfile()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999,
          }}
        >
          <MiniProfile
            userId={miniProfile.userId}
            position={miniProfile.position}
            isVisible={miniProfile.isVisible}
            onClose={() => MiniProfileManagerAPI.closeMiniProfile()}
          />
        </div>
      )}
    </>
  );
};

export default MiniProfileManager;