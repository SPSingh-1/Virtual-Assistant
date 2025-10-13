import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSettings, IoColorPalette } from "react-icons/io5";
import { FaGraduationCap, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Home = () => {
  const {userData, ServerURL, setUserData, getGeminiResponse} = useContext(UserDataContext);
  const navigate = useNavigate();
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [listening, setListening] = useState(false);
  const [learningFeedback, setLearningFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const [audioData, setAudioData] = useState([]);
  const [theme, setTheme] = useState(userData?.user?.theme || 'dark');
  const [isSupported, setIsSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userInitiated, setUserInitiated] = useState(false);
  const [displayText, setDisplayText] = useState(""); // NEW: Separate display text
  
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const synth = window.speechSynthesis;
  const isRecognizingRef = useRef(false);
  const hasGreetedRef = useRef(false);

  // Theme configurations
  const themes = {
    dark: {
      bg: 'from-[#050505] to-[#06032b]',
      card: 'bg-[#ffffff10]',
      text: 'text-white',
      accent: 'from-[#e45ce4] to-[#7649e8]',
      button: 'from-[#8b5cf6] to-[#ec4899]',
      buttonHover: 'hover:shadow-lg hover:shadow-purple-500/50',
    },
    light: {
      bg: 'from-[#f0f9ff] to-[#e0e7ff]',
      card: 'bg-white/80',
      text: 'text-gray-800',
      accent: 'from-[#8b5cf6] to-[#ec4899]',
      button: 'from-[#8b5cf6] to-[#ec4899]',
      buttonHover: 'hover:shadow-lg hover:shadow-purple-400/50',
    },
    neon: {
      bg: 'from-[#0a0a0a] to-[#1a0033]',
      card: 'bg-[#1a0033]/50 border-2 border-cyan-400/30',
      text: 'text-cyan-100',
      accent: 'from-[#00ffff] to-[#ff00ff]',
      button: 'from-[#00ffff] to-[#ff00ff]',
      buttonHover: 'hover:shadow-lg hover:shadow-cyan-500/50',
    },
    sunset: {
      bg: 'from-[#1e0533] to-[#330867]',
      card: 'bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffd93d]/20',
      text: 'text-orange-50',
      accent: 'from-[#ff6b6b] to-[#ffd93d]',
      button: 'from-[#ff6b6b] to-[#ffd93d]',
      buttonHover: 'hover:shadow-lg hover:shadow-orange-500/50',
    }
  };

  const currentTheme = themes[theme] || themes.dark;

  // Check device and browser support
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsMobile(isMobileDevice);
      setIsSupported(!!SpeechRecognition && !!window.speechSynthesis);
      
      if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
      }
    };
    
    checkSupport();
  }, []);

  // Get emotion emoji
  const getEmotionEmoji = (emotion) => {
    const emojis = {
      sad: '😢',
      happy: '😊',
      angry: '😠',
      stressed: '😰',
      tired: '😴',
      neutral: '😐'
    };
    return emojis[emotion] || '😐';
  };

  // Setup audio visualization (only on desktop)
  useEffect(() => {
    if (isMobile) return;
    
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    };
    setupAudio();
  }, [isMobile]);

  // Animate audio visualization
  useEffect(() => {
    if (isMobile) return;
    
    let animationId;
    const animate = () => {
      if (analyserRef.current && listening) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        setAudioData([...dataArrayRef.current]);
      }
      animationId = requestAnimationFrame(animate);
    };
    if (listening) animate();
    return () => cancelAnimationFrame(animationId);
  }, [listening, isMobile]);

  const getSpeechLang = () => {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'hinglish': 'hi-IN',
      'pa': 'pa-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'gu': 'gu-IN'
    };
    return langMap[userData?.user?.preferredLanguage] || 'en-IN';
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerURL}/api/auth/logout`, { withCredentials: true });
      navigate("/signin");
      setUserData(null);
    } catch (error) {
      console.log(error);
      setUserData(null);
    }
  };

  const toggleLearningMode = async () => {
    try {
      const result = await axios.post(`${ServerURL}/api/user/toggle-learning`, {}, 
        { withCredentials: true }
      );
      
      if(result.data.success) {
        setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            learningMode: result.data.learningMode
          }
        }));
      }
    } catch (error) {
      console.error("Error toggling learning mode:", error);
    }
  };

  // FIXED: Keep text visible during and after speech
  const speak = (text) => {
    return new Promise((resolve) => {
      synth.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLang();
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        let voices = synth.getVoices();
        if (voices.length === 0) {
          synth.addEventListener('voiceschanged', () => {
            voices = synth.getVoices();
            const preferredVoice = voices.find(v => v.lang === getSpeechLang());
            if (preferredVoice) utterance.voice = preferredVoice;
          });
        } else {
          const preferredVoice = voices.find(v => v.lang === getSpeechLang());
          if (preferredVoice) utterance.voice = preferredVoice;
        }
        
        isSpeakingRef.current = true;
        
        utterance.onend = () => {
          isSpeakingRef.current = false;
          // CHANGED: Don't clear aiText immediately
          // Let it stay visible for user to read
          setShowFeedback(false);
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          isSpeakingRef.current = false;
          resolve();
        };
        
        synth.speak(utterance);
      }, 100);
    });
  };

  const startRecognition = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported on this browser. Please use Chrome on Android or desktop.');
      return;
    }

    if (!userInitiated && isMobile) {
      return;
    }

    if (isRecognizingRef.current || isSpeakingRef.current) {
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setListening(true);
      }
    } catch (error) {
      if (error.name !== 'InvalidStateError') {
        console.error("Recognition start error:", error);
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      isRecognizingRef.current = false;
    }
  };

  const toggleRecognition = () => {
    if (!userInitiated) {
      setUserInitiated(true);
      
      if (!hasGreetedRef.current) {
        hasGreetedRef.current = true;
        const greeting = `Hello ${userData.user.name}, What can I help you with?`;
        setDisplayText(greeting);
        speak(greeting);
      }
    }

    if (listening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const handleCommand = async (data) => {
    const {type, userInput, response, learningFeedback, emotion: detectedEmotion} = data;
    
    if (detectedEmotion) setEmotion(detectedEmotion);
    
    if (type === 'learning-mode-on') {
      setUserData(prev => ({
        ...prev,
        user: { ...prev.user, learningMode: true }
      }));
    }
    
    if (type === 'learning-mode-off') {
      setUserData(prev => ({
        ...prev,
        user: { ...prev.user, learningMode: false }
      }));
    }
    
    // CHANGED: Keep response visible
    setDisplayText(response);
    await speak(response);
    
    if (learningFeedback && learningFeedback.trim() !== "") {
      setLearningFeedback(learningFeedback);
      setShowFeedback(true);
      await speak(learningFeedback);
    }

    const commandActions = {
      'google-search': () => window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank'),
      'google-open': () => window.open('https://www.google.com/', '_blank'),
      'youtube-search': () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank'),
      'youtube-open': () => window.open('https://www.youtube.com/', '_blank'),
    };

    commandActions[type]?.();
    
    // CHANGED: Clear display text after a delay (5 seconds)
    setTimeout(() => {
      setDisplayText("");
    }, 5000);
    
    // Restart recognition
    if (userInitiated) {
      setTimeout(() => startRecognition(), 1000);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = !isMobile;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognitionRef.current = recognition;

    let isMounted = true;
    
    if (!isMobile) {
      setTimeout(() => {
        if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
          setUserInitiated(true);
          hasGreetedRef.current = true;
          const greeting = `Hello ${userData.user.name}, What can I help you with?`;
          setDisplayText(greeting);
          speak(greeting)
            .then(() => {
              if (isMounted) startRecognition();
            });
        }
      }, 1000);
    }

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      
      if (isMounted && !isSpeakingRef.current && !isMobile && userInitiated) {
        setTimeout(() => {
          if (isMounted) {
            try { 
              recognition.start(); 
            } catch (error) {
              // Ignore
            }
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      isRecognizingRef.current = false;
      setListening(false);
      
      if (event.error === 'no-speech' && !isMobile) {
        setTimeout(() => startRecognition(), 1000);
      }
    };

    recognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim();

      console.log('Heard:', transcript);

      if (userData?.user?.assistantName && 
          transcript.toLowerCase().includes(userData.user.assistantName.toLowerCase())) {
        
        // Show what user said
        setUserText(transcript);
        setDisplayText(`You: ${transcript}`);
        
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        
        try {
          const data = await getGeminiResponse(transcript);
          setAiText(data.response);
          await handleCommand(data);
        } catch (error) {
          console.error('Error getting response:', error);
          const errorMsg = "Sorry, I encountered an error. Please try again.";
          setDisplayText(errorMsg);
          await speak(errorMsg);
          setTimeout(() => setDisplayText(""), 3000);
          if (userInitiated) {
            setTimeout(() => startRecognition(), 1000);
          }
        } finally {
          setUserText("");
        }
      } else if (isMobile && listening) {
        setTimeout(() => startRecognition(), 500);
      }
    };

    return () => {
      isMounted = false;
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      synth.cancel();
    };
  }, [isMobile, userInitiated]);

  return (
    <div className={`w-full min-h-[100vh] bg-gradient-to-br ${currentTheme.bg} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
      
      {/* Support Warning */}
      {!isSupported && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-[90%] z-50">
          <p className="font-semibold text-center">
            Speech recognition is not supported in your browser. Please use Chrome on Android or desktop.
          </p>
        </div>
      )}

      {/* Mobile Instructions */}
      {isMobile && !userInitiated && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-[90%] z-50 text-center">
          <p className="font-semibold mb-2">Tap the microphone button below to start</p>
          <p className="text-sm">Voice recognition requires your permission</p>
        </div>
      )}

      {/* Top Bar with Buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/settings")}
            className={`${currentTheme.card} backdrop-blur-lg ${currentTheme.text} p-3 rounded-2xl ${currentTheme.buttonHover} transition-all duration-300 flex items-center gap-2`}
          >
            <IoSettings className="w-5 h-5" />
            <span className="hidden md:inline">Settings</span>
          </button>
          
          <button
            onClick={() => navigate("/customize")}
            className={`${currentTheme.card} backdrop-blur-lg ${currentTheme.text} p-3 rounded-2xl ${currentTheme.buttonHover} transition-all duration-300 flex items-center gap-2`}
          >
            <IoColorPalette className="w-5 h-5" />
            <span className="hidden md:inline">Customize</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleLearningMode}
            className={`${currentTheme.card} backdrop-blur-lg ${currentTheme.text} p-3 rounded-2xl ${currentTheme.buttonHover} transition-all duration-300 flex items-center gap-2`}
          >
            <FaGraduationCap className="w-5 h-5" />
            <span className="hidden md:inline">
              {userData?.user?.learningMode ? 'Learning: ON' : 'Learning: OFF'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className={`bg-gradient-to-r ${currentTheme.button} text-white p-3 rounded-2xl ${currentTheme.buttonHover} transition-all duration-300 flex items-center gap-2`}
          >
            <MdLogout className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Learning Feedback Toast */}
      {showFeedback && learningFeedback && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-[90%] md:max-w-[500px] z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <FaGraduationCap className="w-6 h-6" />
            <p className="font-semibold">{learningFeedback}</p>
          </div>
        </div>
      )}

      {/* Emotion Indicator */}
      {userData?.user?.emotionDetection && emotion !== 'neutral' && (
        <div className={`absolute top-20 right-4 ${currentTheme.card} backdrop-blur-lg px-5 py-3 rounded-full z-40`}>
          <span className="text-3xl">{getEmotionEmoji(emotion)}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center gap-8 z-10 max-w-4xl w-full">
        
        {/* Assistant Image with Glow Effect */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.accent} rounded-full blur-2xl opacity-30 animate-pulse`}></div>
          <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/10">
            <img 
              src={userData.user?.assistantImage} 
              alt="Assistant" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Assistant Name */}
        <h1 className={`${currentTheme.text} text-2xl font-semibold text-center`}>
          I'm{' '}
          <span className={`bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent text-4xl font-bold`}>
            {userData.user?.assistantName}
          </span>
        </h1>

        {/* FIXED: Mobile Microphone Button */}
        {isMobile && isSupported && (
          <button
            onClick={toggleRecognition}
            className={`${listening ? 'bg-red-500' : `bg-gradient-to-r ${currentTheme.button}`} text-white p-6 rounded-full ${currentTheme.buttonHover} transition-all duration-300 shadow-2xl`}
          >
            {listening ? (
              <FaMicrophoneSlash className="w-8 h-8 animate-pulse" />
            ) : (
              <FaMicrophone className="w-8 h-8" />
            )}
          </button>
        )}

        {/* Voice Visualizer */}
        {listening && !isMobile && (
          <div className={`${currentTheme.card} backdrop-blur-lg rounded-3xl p-6 w-full max-w-md`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaMicrophone className={`${currentTheme.text} w-5 h-5 animate-pulse`} />
              <span className={`${currentTheme.text} font-semibold`}>Listening...</span>
            </div>
            <div className="flex items-end justify-center gap-1 h-24">
              {audioData.slice(0, 50).map((value, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-t ${currentTheme.accent} rounded-full transition-all duration-75`}
                  style={{
                    width: '4px',
                    height: `${(value / 255) * 100}%`,
                    minHeight: '8px'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Listening Indicator */}
        {listening && isMobile && (
          <div className={`${currentTheme.card} backdrop-blur-lg rounded-3xl p-6 w-full max-w-md`}>
            <div className="flex items-center justify-center gap-2">
              <FaMicrophone className={`${currentTheme.text} w-5 h-5 animate-pulse`} />
              <span className={`${currentTheme.text} font-semibold`}>Listening...</span>
            </div>
          </div>
        )}

        {/* FIXED: Text Display - Now uses displayText state */}
        {displayText && (
          <div className={`${currentTheme.card} backdrop-blur-lg rounded-3xl p-6 max-w-2xl w-full animate-fade-in`}>
            <p className={`${currentTheme.text} text-lg text-center leading-relaxed whitespace-pre-wrap`}>
              {displayText}
            </p>
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;