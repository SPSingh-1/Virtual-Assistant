import React, { useContext } from 'react';
import { UserDataContext } from '../context/userDataContext';

function Card({ image }) {
  const {
    selectedImage,
    setSelectedImage,
    setBackendImage,
    setFrontendImage,
    userData
  } = useContext(UserDataContext);

  const currentTheme = userData?.user?.theme || 'dark';

  const themes = {
    dark: { border: 'border-purple-500', shadow: 'shadow-purple-500/50' },
    light: { border: 'border-purple-400', shadow: 'shadow-purple-400/50' },
    neon: { border: 'border-cyan-400', shadow: 'shadow-cyan-500/50' },
    sunset: { border: 'border-orange-400', shadow: 'shadow-orange-500/50' }
  };

  const theme = themes[currentTheme];

  return (
    <div
      className={`w-20 h-32 lg:w-28 lg:h-40 bg-white/5 backdrop-blur-lg border-2 ${
        selectedImage === image
          ? `border-4 ${theme.border} shadow-2xl ${theme.shadow} scale-105`
          : `${theme.border} border-opacity-30`
      } rounded-2xl hover:shadow-2xl hover:${theme.shadow} transition-all duration-300 cursor-pointer hover:scale-110 overflow-hidden`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img
        src={image}
        className="h-full w-full object-cover"
        alt="Assistant option"
      />
    </div>
  );
}

export default Card;