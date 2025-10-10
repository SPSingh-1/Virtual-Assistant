import React, { useContext, useState } from 'react'
import bg from '../assets/registrationbg.jpg'
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/userDataContext';
import axios from 'axios';
function SignUp() {
    const navigate=useNavigate();
    const [name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const {ServerURL,setUserData}=useContext(UserDataContext);
    const[err,setErr]=useState("");
        const[loading,setLoading]=useState(false);
    console.log(ServerURL);
    const handleSignUp=async(e)=>{
        e.preventDefault();
        setErr("");
        setLoading(true);
        navigate("/customize");
        try {
          let result = await axios.post(`${ServerURL}/api/auth/signup`,{
            name,email,password
          },{withCredentials:true});
          setUserData(result.data);
          setLoading(false);
          if(result.data.success){
            navigate("/signin");
          }
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
            shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>
                <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to your <span className="bg-gradient-to-t from-[#dd1cf7] to-[#2fc5d6] bg-clip-text text-transparent">Virtual Assistant</span></h1>
                <input type="text" placeholder='Enter Your Name' className='w-full h-[40px] rounded-lg border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 'required onChange={(e)=>setName(e.target.value)} value={name} />
                <input type="email" placeholder='Email' className='w-full h-[40px] rounded-lg border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 ' required onChange={(e)=>setEmail(e.target.value)} value={email} />
                <input type="password" placeholder='Password' className='w-full h-[40px] rounded-lg border-1 border-white outline-none px-[20px] text-[18px] bg-transparent text-white placeholder:gray-400 ' required onChange={(e)=>setPassword(e.target.value)} value={password} />
                {err.length>0 && <p className='text-red-500 text-[17px]'>{err}</p>}
                <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-md text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 ' disabled={loading}>{loading?"Loding...":"Sign Up"}</button>

                <p className='text-white text-[18px] cursor-pointer' onClick={()=>navigate("/signin")}>Already have an account? <span className='text-blue-400'>Sign In</span></p>

            </form>
    </div>
  )
}

export default SignUp
