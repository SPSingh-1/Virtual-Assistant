import React, { useContext, useState } from 'react'
import { UserDataContext } from '../context/userDataContext';
import axios from 'axios';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const {userData,backendImage,selectedImage,ServerURL,setUserData} = useContext(UserDataContext);
    const[assistantName,setAssistantName]=useState(userData ?.assistantName || "");
    const [loading, setLoading]=useState(false);
    const navigate = useNavigate();

    const handleUpdateAssistant=async()=>{
        setLoading(true);
        try {
            let formData=new FormData();
            formData.append("assistantName",assistantName);
            if(backendImage){
                formData.append("assistantImage",backendImage);
            }else{
                formData.append("assistantImage",selectedImage);
            }
            const result=await axios.post(`${ServerURL}/api/user/update`,formData,{withCredentials:true});
            setLoading(false);
            console.log(result.data);
            setUserData(result.data);
            navigate("/");
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[#010004] to-[#0f094f] flex justify-center items-center flex-col p-[20px] relative '>
        <IoMdArrowRoundBack className='absolute top-[30px] left-[30px] cursor-pointer text-white w-[25px] h-[25px]' onClick={()=>navigate("/customize")}/>
      <h1 className='text-white text-[30px] text-center mb-[40px]'>Enter Your <span className="bg-gradient-to-t from-[#dd1cf7] to-[#2fc5d6] bg-clip-text text-transparent">Assistant Name</span>
 </h1>

    <input type="text" placeholder='Eg:JARVIS' className='w-full max-w-[600px] h-[40px] rounded-full border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 ' required  onChange={(e)=> setAssistantName(e.target.value)} value={assistantName}/>

    {assistantName && <button className='min-w-[300px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer' disabled={loading} onClick={()=>{
        handleUpdateAssistant();
    }}>{loading ? "Loding...":"Finally create your Assistant"}</button>
    }
    
    </div>

  )
}

export default Customize2
