import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImage from "../assets/ai.gif"
import userImage from "../assets/user.gif"
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaGraduationCap } from "react-icons/fa";

const Home = () => {
  const {userData, ServerURL, setUserData, getGeminiResponse} = useContext(UserDataContext);
  const navigate = useNavigate();
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [listening, setListening] = useState(false);
  const [ham, setHam] = useState(false);
  const [learningFeedback, setLearningFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const isRecognizingRef = useRef(false);

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${ServerURL}/api/auth/logout`, { withCredentials: true });
      navigate("/signin");
      setUserData(null);
      console.log(result.data); 
    } catch (error) {
      console.log(error);
      setUserData(null);
    }
  };

  // Toggle Learning Mode
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
        
        // Speak the status
        const statusMsg = result.data.learningMode 
          ? "Learning mode activated. I will now help you improve your English."
          : "Learning mode deactivated. Back to normal mode.";
        speak(statusMsg);
      }
    } catch (error) {
      console.error("Error toggling learning mode:", error);
    }
  };

  const startRecognition = () => {
    if(!isRecognizingRef.current && !isSpeakingRef.current){
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (error) {
        if(!error.message.includes("start")){
          console.error("Recognition error:", error);
        }
      }
    }
  }

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN');
    
    if(indianVoice){
      utterance.voice = indianVoice;
    }
    
    isSpeakingRef.current = true;
    
    utterance.onend = () => {
      setAiText("");
      setShowFeedback(false); // Hide feedback when AI stops speaking
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 900);
    }
    
    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const {type, userInput, response, learningFeedback, confidence} = data;
    
    // Handle learning mode toggle commands first
    if(type === 'learning-mode-on') {
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          learningMode: true
        }
      }));
    }
    
    if(type === 'learning-mode-off') {
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          learningMode: false
        }
      }));
    }
    
    // Speak the main response
    speak(response);
    
    // Handle learning feedback if present
    if(learningFeedback && learningFeedback.trim() !== "") {
      setLearningFeedback(learningFeedback);
      setShowFeedback(true);
      
      // Speak feedback after main response
      setTimeout(() => {
        speak(learningFeedback);
      }, response.length * 50); // Approximate time based on response length
    }

    // Handle different command types
    switch(type) {
      case 'google-search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
        break;
      
      case 'google-open':
        window.open('https://www.google.com/', '_blank');
        break;
      
      case 'calculator-open':
        window.open('https://www.google.com/search?q=calculator', '_blank');
        break;
      
      case 'instagram-open':
        window.open('https://www.instagram.com/', '_blank');
        break;
      
      case 'facebook-open':
        window.open('https://www.facebook.com/', '_blank');
        break;
      
      case 'twitter-open':
        window.open('https://www.twitter.com/', '_blank');
        break;
      
      case 'whatsapp-open':
        window.open('https://web.whatsapp.com/', '_blank');
        break;
      
      case 'get-weather':
        window.open('https://www.google.com/search?q=weather', '_blank');
        break;
      
      case 'youtube-search':
      case 'youtube-play':
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
        break;
      
      case 'youtube-open':
        window.open('https://www.youtube.com/', '_blank');
        break;
      
      case 'get-news':
        window.open('https://news.google.com/', '_blank');
        break;
      
      case 'open-website':
        if(userInput.includes('http')) {
          window.open(userInput, '_blank');
        } else {
          window.open(`https://${userInput}`, '_blank');
        }
        break;
      
      default:
        break;
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;
    
    const safeRecognition = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (error) {
          if(error.name !== "InvalidStateError"){
            console.error(error);
          }
        }
      }
    }, 1100);

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    }

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);

      if(isMounted && !isSpeakingRef.current){
        setTimeout(() => {
          if (isMounted){
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (error) {
              if (error.name !== "InvalidStateError"){
                console.error(error);
              }
            }
          }
        }, 800);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      
      if(event.error !== "aborted" && !isSpeakingRef.current && isMounted){
        setTimeout(() => {
          if (isMounted){
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (error) {
              if (error.name !== "InvalidStateError"){
                console.error(error);
              }
            }
          }
        }, 1000);
      }
    }

    recognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim();
      console.log("Heard:", transcript);

      if (userData?.user?.assistantName && 
          transcript.toLowerCase().includes(userData.user.assistantName.toLowerCase())) {
        
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const fallback = setInterval(() => {
      if(!isSpeakingRef.current && !isRecognizingRef.current){
        try {
          recognition.start();
        } catch (error) {
          if(error.name !== "InvalidStateError"){
            console.error(error);
          }
        }
      }
    }, 10000);

    const greeting = new SpeechSynthesisUtterance(
      `Hello ${userData.user.name}, What can I help you with?`
    );
    greeting.lang = 'en-IN';
    window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(safeRecognition);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    }
  }, []);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[#050505] to-[#06032b] flex justify-center items-center flex-col gap-[15px] overflow-hidden relative'>
      
      {/* Learning Feedback Toast */}
      {showFeedback && learningFeedback && (
        <div className='absolute top-[20px] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-[20px] py-[15px] rounded-lg shadow-2xl max-w-[90%] md:max-w-[500px] z-50 animate-bounce'>
          <div className='flex items-center gap-[10px]'>
            <FaGraduationCap className='w-[25px] h-[25px]' />
            <p className='font-semibold text-[16px]'>{learningFeedback}</p>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <IoMenu className='lg:hidden text-white absolute top-[20px] right-[25px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
      
      <div className={`lg:hidden absolute top-0 w-full h-full bg-[#00000028] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform z-40`}>
        <RxCross2 className='text-white absolute top-[20px] right-[25px] w-[25px] h-[25px]' onClick={() => setHam(false)}/>
        
        <button 
          className='min-w-[100px] h-[40px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer px-[20px] py-[1px]' 
          onClick={() => navigate("/customize")}
        >
          <span className="bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent">
            Customize Your Assistant
          </span>
        </button>
        
        <button 
          className='min-w-[100px] h-[40px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer px-[20px] py-[1px]' 
          onClick={toggleLearningMode}
        >
          <span className={`bg-gradient-to-t ${userData?.user?.learningMode ? 'from-[#4ade80] to-[#22c55e]' : 'from-[#f59e0b] to-[#f97316]'} bg-clip-text text-transparent flex items-center gap-[5px]`}>
            <FaGraduationCap className='inline w-[20px] h-[20px]' />
            {userData?.user?.learningMode ? 'Learning Mode: ON' : 'Learning Mode: OFF'}
          </span>
        </button>
        
        <button 
          className='min-w-[100px] h-[40px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer px-[20px] py-[1px]' 
          onClick={handleLogout}
        >
          <span className="bg-gradient-to-t from-[#f85d3a] to-[#f302b7] bg-clip-text text-transparent">
            Logout
          </span>
        </button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='font-bold text-[25px] bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent'>
          History
        </h1>
        
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col text-white'>
          {userData.user.history?.map((his, index) => (
            <span key={index} className='text-white text-[18px] mt-[5px]'>{his}</span>
          ))}
        </div>
      </div>

      {/* Desktop Buttons */}
      <button 
        className='min-w-[100px] h-[40px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer absolute hidden lg:block top-[20px] right-[20px] px-[20px] py-[2px]' 
        onClick={() => navigate("/customize")}
      >
        <span className="bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent">
          Customize Your Assistant
        </span>
      </button>
      
      <button 
        className='min-w-[100px] h-[40px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer absolute hidden lg:block top-[75px] right-[20px] px-[20px] py-[2px]' 
        onClick={toggleLearningMode}
      >
        <span className={`bg-gradient-to-t ${userData?.user?.learningMode ? 'from-[#4ade80] to-[#22c55e]' : 'from-[#f59e0b] to-[#f97316]'} bg-clip-text text-transparent flex items-center gap-[5px] justify-center`}>
          <FaGraduationCap className='inline w-[20px] h-[20px]' />
          {userData?.user?.learningMode ? 'Learning Mode: ON' : 'Learning Mode: OFF'}
        </span>
      </button>
      
      <button 
        className='min-w-[100px] h-[40px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer absolute hidden lg:block top-[130px] right-[20px] px-[20px] py-[2px]' 
        onClick={handleLogout}
      >
        <span className="bg-gradient-to-t from-[#f85d3a] to-[#f302b7] bg-clip-text text-transparent">
          Logout
        </span>
      </button>

      {/* Assistant Image */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData.user?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      
      {/* Listening Indicator - Between Image and Name */}
      {listening && !isSpeakingRef.current && (
        <div className='flex items-center gap-[10px] bg-[#ffffff20] backdrop-blur-md px-[20px] py-[10px] rounded-full'>
          <div className='w-[10px] h-[10px] bg-red-500 rounded-full animate-pulse'></div>
          <span className='text-white text-[16px]'>Listening...</span>
        </div>
      )}
      
      <h1 className='text-white text-[18px] font-semibold'>
        I'm <span className="bg-gradient-to-t from-[#e45ce4] to-[#7649e8] bg-clip-text text-transparent text-[25px] font-bold">
          {userData.user?.assistantName}
        </span>
      </h1>
      
      {!aiText && <img src={userImage} alt="userVoice..." className='w-[200px]'/>}
      {aiText && <img src={aiImage} alt="aiVoice..." className='w-[200px]'/>}
      
      <h1 className='text-white text-[18px] font-semibold text-wrap px-[20px] text-center'>
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
}

export default Home;