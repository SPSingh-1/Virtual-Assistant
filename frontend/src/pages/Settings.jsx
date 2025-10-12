import React, { useContext, useState } from 'react';
import { UserDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaGraduationCap, 
  FaLanguage, 
  FaTheaterMasks, 
  FaHeart, 
  FaArrowLeft,
  FaPalette,
  FaMoon,
  FaSun,
  FaAdjust
} from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';

const Settings = () => {
  const { userData, ServerURL, setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(userData?.user?.theme || 'dark');

  // Theme configurations
  const themes = {
    dark: {
      name: 'Dark',
      icon: <FaMoon />,
      bg: 'from-[#050505] to-[#06032b]',
      card: 'bg-[#ffffff10]',
      text: 'text-white',
      preview: 'bg-gradient-to-br from-[#050505] to-[#06032b]'
    },
    light: {
      name: 'Light',
      icon: <FaSun />,
      bg: 'from-[#f0f9ff] to-[#e0e7ff]',
      card: 'bg-white/80',
      text: 'text-gray-800',
      preview: 'bg-gradient-to-br from-[#f0f9ff] to-[#e0e7ff]'
    },
    neon: {
      name: 'Neon',
      icon: <IoSparkles />,
      bg: 'from-[#0a0a0a] to-[#1a0033]',
      card: 'bg-[#1a0033]/50',
      text: 'text-cyan-100',
      preview: 'bg-gradient-to-br from-[#0a0a0a] via-[#1a0033] to-[#330066]'
    },
    sunset: {
      name: 'Sunset',
      icon: <FaAdjust />,
      bg: 'from-[#1e0533] to-[#330867]',
      card: 'bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffd93d]/20',
      text: 'text-orange-50',
      preview: 'bg-gradient-to-br from-[#1e0533] via-[#ff6b6b]/30 to-[#ffd93d]/30'
    }
  };

  const activeTheme = themes[currentTheme];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' }
  ];

  const personalities = [
    { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and business-like' },
    { value: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm and approachable' },
    { value: 'funny', label: 'Funny', icon: '😄', desc: 'Humorous and entertaining' },
    { value: 'motivational', label: 'Motivational', icon: '💪', desc: 'Inspiring and positive' },
    { value: 'sarcastic', label: 'Sarcastic', icon: '😏', desc: 'Witty with gentle humor' }
  ];

  const changeTheme = async (themeValue) => {
    setLoading(true);
    setCurrentTheme(themeValue);
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/change-theme`,
        { theme: themeValue },
        { withCredentials: true }
      );

      if (result.data.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Error changing theme:', error);
    }
    setLoading(false);
  };

  const changeLanguage = async (langCode) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/change-language`,
        { language: langCode },
        { withCredentials: true }
      );

      if (result.data.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
    setLoading(false);
  };

  const changePersonality = async (personalityValue) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/change-personality`,
        { personality: personalityValue },
        { withCredentials: true }
      );

      if (result.data.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Error changing personality:', error);
    }
    setLoading(false);
  };

  const toggleEmotionDetection = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/toggle-emotion`,
        {},
        { withCredentials: true }
      );

      if (result.data.success) {
        setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            emotionDetection: result.data.emotionDetection
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling emotion detection:', error);
    }
    setLoading(false);
  };

  const toggleLearningMode = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/toggle-learning`,
        {},
        { withCredentials: true }
      );

      if (result.data.success) {
        setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            learningMode: result.data.learningMode
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling learning mode:', error);
    }
    setLoading(false);
  };

  return (
    <div className={`w-full min-h-[100vh] bg-gradient-to-br ${activeTheme.bg} p-4 md:p-8 relative overflow-hidden`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-float"
            style={{
              width: Math.random() * 80 + 40,
              height: Math.random() * 80 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${Math.random() * 8 + 8}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-3 ${activeTheme.text} mb-8 ${activeTheme.card} backdrop-blur-lg px-5 py-3 rounded-2xl hover:scale-105 transition-all duration-300`}
        >
          <FaArrowLeft /> <span className="font-semibold">Back to Home</span>
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Assistant Settings
        </h1>

        {/* Theme Customization Section */}
        <div className={`${activeTheme.card} backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-6 border border-white/10`}>
          <div className="flex items-center gap-4 mb-6">
            <FaPalette className="text-purple-400 text-3xl" />
            <h2 className={`${activeTheme.text} text-2xl md:text-3xl font-bold`}>Theme Customization</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                disabled={loading}
                className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                  currentTheme === key
                    ? 'ring-4 ring-purple-500 scale-105'
                    : 'hover:scale-105'
                }`}
              >
                <div className={`${theme.preview} absolute inset-0`}></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`text-4xl ${currentTheme === key ? 'text-white' : 'text-white/70'}`}>
                    {theme.icon}
                  </div>
                  <span className={`font-bold text-lg ${currentTheme === key ? 'text-white' : 'text-white/70'}`}>
                    {theme.name}
                  </span>
                </div>
                {currentTheme === key && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full px-2 py-1 text-xs">
                    Active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className={`${activeTheme.card} backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-6 border border-white/10`}>
          <div className="flex items-center gap-4 mb-6">
            <FaLanguage className="text-blue-400 text-3xl" />
            <h2 className={`${activeTheme.text} text-2xl md:text-3xl font-bold`}>Preferred Language</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                disabled={loading}
                className={`p-5 rounded-2xl transition-all duration-300 ${
                  userData?.user?.preferredLanguage === lang.code
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg shadow-purple-500/50'
                    : `${activeTheme.card} ${activeTheme.text} hover:scale-105 border border-white/10`
                }`}
              >
                <div className="text-4xl mb-2">{lang.flag}</div>
                <div className="font-semibold text-lg">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Personality Selection */}
        <div className={`${activeTheme.card} backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-6 border border-white/10`}>
          <div className="flex items-center gap-4 mb-6">
            <FaTheaterMasks className="text-pink-400 text-3xl" />
            <h2 className={`${activeTheme.text} text-2xl md:text-3xl font-bold`}>Personality</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalities.map((personality) => (
              <button
                key={personality.value}
                onClick={() => changePersonality(personality.value)}
                disabled={loading}
                className={`p-6 rounded-2xl transition-all duration-300 text-left ${
                  userData?.user?.personality === personality.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg shadow-purple-500/50'
                    : `${activeTheme.card} ${activeTheme.text} hover:scale-105 border border-white/10`
                }`}
              >
                <div className="text-5xl mb-3">{personality.icon}</div>
                <div className="font-bold text-xl mb-2">{personality.label}</div>
                <div className="text-sm opacity-80">{personality.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Features */}
        <div className={`${activeTheme.card} backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-6 border border-white/10`}>
          <div className="flex items-center gap-4 mb-6">
            <FaHeart className="text-red-400 text-3xl" />
            <h2 className={`${activeTheme.text} text-2xl md:text-3xl font-bold`}>Smart Features</h2>
          </div>

          {/* Emotion Detection Toggle */}
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl mb-4 hover:bg-white/10 transition-all duration-300">
            <div>
              <h3 className={`${activeTheme.text} text-xl font-semibold mb-2`}>Emotion Detection</h3>
              <p className="text-gray-400">AI understands your mood and responds accordingly</p>
            </div>
            <button
              onClick={toggleEmotionDetection}
              disabled={loading}
              className={`w-16 h-8 rounded-full transition-all duration-300 relative ${
                userData?.user?.emotionDetection ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${
                  userData?.user?.emotionDetection ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Learning Mode Toggle */}
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
            <div>
              <h3 className={`${activeTheme.text} text-xl font-semibold mb-2 flex items-center gap-2`}>
                <FaGraduationCap />
                Learning Mode
              </h3>
              <p className="text-gray-400">Get corrections to improve your English</p>
            </div>
            <button
              onClick={toggleLearningMode}
              disabled={loading}
              className={`w-16 h-8 rounded-full transition-all duration-300 relative ${
                userData?.user?.learningMode ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${
                  userData?.user?.learningMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-white text-2xl font-bold mb-6">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl">
              <div className="text-white/80 text-sm mb-1">Theme</div>
              <div className="text-white text-xl font-bold capitalize">{currentTheme}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl">
              <div className="text-white/80 text-sm mb-1">Language</div>
              <div className="text-white text-xl font-bold">
                {languages.find(l => l.code === userData?.user?.preferredLanguage)?.name || 'English'}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl">
              <div className="text-white/80 text-sm mb-1">Personality</div>
              <div className="text-white text-xl font-bold capitalize">{userData?.user?.personality || 'Friendly'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-5 rounded-2xl">
              <div className="text-white/80 text-sm mb-1">Smart Features</div>
              <div className="text-white text-xl font-bold">
                {userData?.user?.emotionDetection ? '✓' : '✗'} Emotions | 
                {userData?.user?.learningMode ? ' ✓' : ' ✗'} Learning
              </div>
            </div>
          </div>
        </div>
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
};

export default Settings;