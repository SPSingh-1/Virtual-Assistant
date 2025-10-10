import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImage from "../assets/ai.gif"
import userImage from "../assets/user.gif"
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";



const Home = () => {
  const {userData, ServerURL,setUserData,getGeminiResponse} = useContext(UserDataContext);
  const navigate = useNavigate();
  const [userText,setUserText] = useState("");
  const [aiText,setAiText] = useState("");
  const [listening,setListening]=useState(false);
  const [ham, setHam]=useState(false);
  const isSpeakingRef=useRef(false);
  const recognitionRef=useRef(null);
  const synth=window.speechSynthesis;
  const isRecognizingRef=useRef(false);

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
  //synth.cancel(); // stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang === 'hi-IN');
  if(hindiVoice){
    utterance.voice = hindiVoice;
  }
  isSpeakingRef.current=true;
  utterance.onend=()=>{
    setAiText("");
    isSpeakingRef.current=false;
    setTimeout(()=>{
      startRecognition();
    },900);
    
  }
  synth.cancel();
  synth.speak(utterance);
};

const handleCommand=(data)=>{
  const {type,userInput,response}=data
  speak(response);

  if (type === 'google-search'){
    const query = encodeURIComponent(userInput);
    window.open(`https://www.google.com/search?query=${query}`,'_blank');
  }
  if (type === 'google-open'){
    window.open(`https://www.google.com/`,'_blank');
  }
  if(type === 'calculator-open'){
    window.open(`https://www.google.com/search?q=calculator`,'_blank');
  }
  if(type === "instagram-open"){
    window.open(`https://www.instagram.com/`,'_blank');
  }
  if(type === "facebook-open"){
    window.open(`https://www.facebook.com/`,'_blank');
  }
  if(type === "get-weather"){
    window.open(`https://www.google.com/search?q=weather`, '_blank');
  }
  if(type === 'youtube-search' || type === 'youtube-play'){
    const query = encodeURIComponent(userInput);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  }
  if(type === 'youtube-search' || type === 'youtube-open'){
    window.open(`https://www.youtube.com/`,'_blank');
  }
}
  useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognitionRef.current=recognition;

  let isMounted = true;
  
  const safeRecognition = setTimeout(()=> {
    if (isMounted && ! isSpeakingRef.current && !isRecognizingRef.current){
      try {
        recognition.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if(error.name !== "InvalidStateError"){
          console.error(error);
        }
        
      }
    }
  },1100);
  // const safeRecognition=()=>{
  //   if(!isSpeakingRef.current && !isRecognizingRef.current){
  //     try {
  //       recognition.start();
  //       console.log("Recognition requested to start")
  //     } catch (error) {
  //       if(error.name !== "IncalidStateError"){
  //         console.error("Start error:", error)
  //       }else {
  //         console.log("Recognition already active — skipping start()");
  //       }
  //     }
  //   }
  // }

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
        //safeRecognition();
        if (isMounted){
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (error) {
            if (error.name !== "InvalidStateError");
            console.error(error);
          }
        }
      }, 800);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:",event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if(event.error !== "aborted" && !isSpeakingRef.current &&  isMounted){
      setTimeout(() => {
        if (isMounted){
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (error) {
            if (error.name !== "InvalidStateError");
            console.error(error);
          }
        }
      },1000);
    }
  }

  recognition.onresult = async (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript.trim();
    console.log("Heard:", transcript);

    if (userData?.user?.assistantName && transcript.toLowerCase().includes(userData.user.assistantName.toLowerCase())) {
      setAiText("")
      setUserText(transcript)
      recognition.stop();
      isRecognizingRef.current=false;
      setListening(false);
      const data = await getGeminiResponse(transcript);
      // console.log("Response:", data);
      // speak(data.response);
      handleCommand(data)
      setAiText(data.response);
      setUserText("");
    }
  };


  // return () => recognition.stop(); // cleanup on unmount

const fallback=setInterval(()=>{
  if(!isSpeakingRef.current && !isRecognizingRef.current){
    safeRecognition();
  }
},10000)


  const greeting = new SpeechSynthesisUtterance(`Hello ${userData.user.name}, What can I help you with?`);
  greeting.lang = 'hi-IN';

  window.speechSynthesis.speak(greeting);

return()=>{
  isMounted = false;
  clearTimeout(safeRecognition);
  recognition.stop();
  setListening(false);
  isRecognizingRef.current=false;
  clearInterval(fallback);
}
}, []);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[#050505] to-[#06032b] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <IoMenu className='lg:hidden text-white absolute top-[20px] right-[25px] w-[25px] h-[25px]' onClick={()=>setHam(true)} />
      <div className={`lg:hidden absolute top-0 w-full h-full bg-[#00000028] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
      <RxCross2 className='text-white absolute top-[20px] right-[25px] w-[25px] h-[25px] ' onClick={()=>setHam(false)}/>
        <button className='min-w-[100px] h-[40px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer px-[20px] py-[1px]' onClick={()=> navigate("/customize")}><span className="bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent">Customize Your Assistant</span></button>
        <button className='min-w-[100px] h-[40px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer px-[20px] py-[1px]' onClick={handleLogout}><span className="bg-gradient-to-t from-[#f85d3a] to-[#f302b7] bg-clip-text text-transparent">Logout</span></button>

        <div className='w-full h-[2px] bg-gray-400'></div>
          <h1 className='font-bold text-[25px] bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent'>History</h1>
        
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col text-white'>
          {userData.user.history?.map((his, index)=>(
            <span key={index} className='text-white text-[18px] mt-[5px]'>{his}</span>
          ))}

        </div>
      </div>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>

        <button className='min-w-[100px] h-[40px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer absolute hidden lg:block top-[20px] right-[20px] px-[20px] py-[2px]' onClick={()=> navigate("/customize")}><span className="bg-gradient-to-t from-[#f52e02] to-[#f302b7] bg-clip-text text-transparent">Customize Your Assistant</span></button>
        <button className='min-w-[100px] h-[40px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer absolute hidden lg:block top-[75px] right-[20px] px-[20px] py-[2px]' onClick={handleLogout}><span className="bg-gradient-to-t from-[#f85d3a] to-[#f302b7] bg-clip-text text-transparent">Logout</span></button>
        <img src={userData.user?.assistantImage} alt="" className='h-full object-cover'/>
        
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm   <span className="bg-gradient-to-t from-[#e45ce4] to-[#7649e8] bg-clip-text text-transparent text-[25px] font-bold">{userData.user?.assistantName}</span></h1>
      {!aiText && <img src={userImage} alt="userVoice..." className='w-[200px]'/>}
      {aiText && <img src={aiImage} alt="userVoice..." className='w-[200px]'/>}
      <h1 className='text-white text-[18px] font-semibold text-wrap '>{userText?userText:aiText?aiText:null}</h1>
    </div>
  );
}

export default Home;
