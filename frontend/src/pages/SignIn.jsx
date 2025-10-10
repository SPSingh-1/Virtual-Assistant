import React, { useContext, useState } from 'react'
import bg from '../assets/registrationbg.jpg'
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/userDataContext';
import axios from 'axios';
function SignIn() {
    const navigate=useNavigate();
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const {ServerURL,setUserData}=useContext(UserDataContext);
    const[err,setErr]=useState("");
    const[loading,setLoading]=useState(false);
    console.log(ServerURL);
    const handleSignIn=async(e)=>{
        e.preventDefault();
        setErr("");
        setLoading(true); 
        try {
          let result = await axios.post(`${ServerURL}/api/auth/signin`,{
            email,password
          },{withCredentials:true});
          setUserData(result.data);
          setLoading(false);
          navigate("/");
        } catch (error) {
          console.log(error);
          setUserData(null);
          setLoading(false);
          setErr(error.response.data.message);
          
        }
    }
  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage: `url(${bg})`}} >
      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000050] backdrop-blur
            shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignIn}>
                <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Sign In to your <span className="bg-gradient-to-t from-[#dd1cf7] to-[#2fc5d6] bg-clip-text text-transparent font-bold ">Virtual Assistant</span></h1>
                <input type="email" placeholder='Email' className='w-full h-[40px] rounded-lg border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 ' required onChange={(e)=>setEmail(e.target.value)} value={email} />
                <input type="password" placeholder='Password' className='w-full h-[40px] rounded-lg border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 ' required onChange={(e)=>setPassword(e.target.value)} value={password} />
                {err && <p className='text-red-500 text-[17px]'>{err}</p>}
                <button className='w-[80%] h-[40px] bg-blue-500 text-white rounded-md hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 mt-[10px]' disabled={loading}>{loading?"Loding...":"Sign In"}</button>

                <p className='text-white text-[18px] cursor-pointer' onClick={()=>navigate("/signup")}>Want to create a new account? <span className='text-blue-400'>Sign Up</span></p>

            </form>
    </div>
  )
}

export default SignIn
