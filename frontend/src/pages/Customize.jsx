import React, { useContext, useRef } from 'react';
import Card from '../components/Card';
import image1 from '../assets/1.jpg';
import image2 from '../assets/2.webp';
import image3 from '../assets/3.webp';
import image4 from '../assets/4.jpg';
import image5 from '../assets/5.jpg';
import image6 from '../assets/6.jpeg';
import image7 from '../assets/7.avif';
import { RiImageAddLine } from "react-icons/ri";
import { UserDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';

function Customize() {
  const {
    frontendImage,
    setFrontendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    userData
  } = useContext(UserDataContext);
  const navigate = useNavigate();
  const inputImage = useRef();

  const currentTheme = userData?.user?.theme || 'dark';

  const themes = {
    dark: {
      bg: 'from-[#050505] to-[#06032b]',
      card: 'bg-[#ffffff10]',
      text: 'text-white',
      accent: 'from-[#dd1cf7] to-[#2fc5d6]',
      button: 'from-purple-500 to-pink-500',
    },
    light: {
      bg: 'from-[#f0f9ff] to-[#e0e7ff]',
      card: 'bg-white/80',
      text: 'text-gray-800',
      accent: 'from-[#8b5cf6] to-[#ec4899]',
      button: 'from-purple-500 to-pink-500',
    },
    neon: {
      bg: 'from-[#0a0a0a] to-[#1a0033]',
      card: 'bg-[#1a0033]/50',
      text: 'text-cyan-100',
      accent: 'from-[#00ffff] to-[#ff00ff]',
      button: 'from-cyan-400 to-purple-600',
    },
    sunset: {
      bg: 'from-[#1e0533] to-[#330867]',
      card: 'bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffd93d]/20',
      text: 'text-orange-50',
      accent: 'from-[#ff6b6b] to-[#ffd93d]',
      button: 'from-orange-400 to-red-500',
    }
  };

  const theme = themes[currentTheme];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className={`w-full min-h-[100vh] bg-gradient-to-br ${theme.bg} flex justify-center items-center flex-col p-6 relative overflow-hidden`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-float"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <button
          onClick={() => navigate("/")}
          className={`${theme.card} backdrop-blur-lg ${theme.text} p-3 rounded-2xl hover:scale-110 transition-all duration-300 mb-8 flex items-center gap-2`}
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
          <span className="font-semibold">Back</span>
        </button>

        <h1 className={`${theme.text} text-3xl md:text-4xl text-center mb-12 font-bold`}>
          Select Your{' '}
          <span className={`bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
            Assistant Image
          </span>
        </h1>

        <div className={`${theme.card} backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8`}>
          <div className="flex justify-center items-center gap-4 md:gap-6 flex-wrap">
            <Card image={image1} />
            <Card image={image2} />
            <Card image={image3} />
            <Card image={image4} />
            <Card image={image5} />
            <Card image={image6} />
            <Card image={image7} />

            <div
              className={`w-20 h-32 lg:w-28 lg:h-40 ${theme.card} border-2 backdrop-blur-lg rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-110 flex items-center justify-center ${
                selectedImage === "input"
                  ? "border-4 border-purple-500 shadow-2xl shadow-purple-500/50 scale-105"
                  : "border-purple-500/30"
              }`}
              onClick={() => {
                inputImage.current.click();
                setSelectedImage("input");
              }}
            >
              {!frontendImage && (
                <RiImageAddLine className={`${theme.text} w-8 h-8`} />
              )}
              {frontendImage && (
                <img
                  src={frontendImage}
                  className="h-full w-full object-cover rounded-2xl"
                  alt="Custom"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={inputImage}
              hidden
              onChange={handleImage}
            />
          </div>
        </div>

        {selectedImage && (
          <div className="flex justify-center">
            <button
              className={`bg-gradient-to-r ${theme.button} text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300`}
              onClick={() => navigate("/customize2")}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Customize;