import React, { useContext, useState } from 'react';
import { UserDataContext } from '../context/userDataContext';
import axios from 'axios';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';

function Customize2() {
  const { userData, backendImage, selectedImage, ServerURL, setUserData } = useContext(UserDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentTheme = userData?.user?.theme || 'dark';

  const themes = {
    dark: {
      bg: 'from-[#050505] to-[#06032b]',
      card: 'bg-[#ffffff10]',
      text: 'text-white',
      accent: 'from-[#dd1cf7] to-[#2fc5d6]',
      button: 'from-purple-500 to-pink-500',
      input: 'bg-white/10 border-white/20 text-white placeholder-gray-400',
    },
    light: {
      bg: 'from-[#f0f9ff] to-[#e0e7ff]',
      card: 'bg-white/80',
      text: 'text-gray-800',
      accent: 'from-[#8b5cf6] to-[#ec4899]',
      button: 'from-purple-500 to-pink-500',
      input: 'bg-white border-gray-300 text-gray-800 placeholder-gray-500',
    },
    neon: {
      bg: 'from-[#0a0a0a] to-[#1a0033]',
      card: 'bg-[#1a0033]/50',
      text: 'text-cyan-100',
      accent: 'from-[#00ffff] to-[#ff00ff]',
      button: 'from-cyan-400 to-purple-600',
      input: 'bg-purple-900/30 border-cyan-400/30 text-cyan-100 placeholder-cyan-300/50',
    },
    sunset: {
      bg: 'from-[#1e0533] to-[#330867]',
      card: 'bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffd93d]/20',
      text: 'text-orange-50',
      accent: 'from-[#ff6b6b] to-[#ffd93d]',
      button: 'from-orange-400 to-red-500',
      input: 'bg-orange-900/20 border-orange-400/30 text-orange-50 placeholder-orange-200/50',
    }
  };

  const theme = themes[currentTheme];

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("assistantImage", selectedImage);
      }
      const result = await axios.post(`${ServerURL}/api/user/update`, formData, {
        withCredentials: true
      });
      setLoading(false);
      console.log(result.data);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
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

      <div className="relative z-10 w-full max-w-3xl">
        <button
          onClick={() => navigate("/customize")}
          className={`${theme.card} backdrop-blur-lg ${theme.text} p-3 rounded-2xl hover:scale-110 transition-all duration-300 mb-8 flex items-center gap-2`}
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
          <span className="font-semibold">Back</span>
        </button>

        <div className={`${theme.card} backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10`}>
          <div className="flex justify-center mb-8">
            <div className={`bg-gradient-to-r ${theme.accent} p-4 rounded-full`}>
              <FaRobot className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className={`${theme.text} text-3xl md:text-4xl text-center mb-4 font-bold`}>
            Name Your{' '}
            <span className={`bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
              Assistant
            </span>
          </h1>

          <p className={`${theme.text} text-center opacity-70 mb-8`}>
            Choose a name you'll use to activate your assistant
          </p>

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Eg: JARVIS"
              className={`w-full h-14 rounded-2xl border-2 outline-none px-6 text-lg font-medium ${theme.input} transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20`}
              required
              onChange={(e) => setAssistantName(e.target.value)}
              value={assistantName}
            />
            {assistantName && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {assistantName && (
            <button
              className={`w-full bg-gradient-to-r ${theme.button} text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading}
              onClick={handleUpdateAssistant}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Your Assistant 🚀"
              )}
            </button>
          )}

          {!assistantName && (
            <div className={`${theme.text} text-center opacity-50 mt-4`}>
              Enter a name to continue
            </div>
          )}
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
}

export default Customize2;