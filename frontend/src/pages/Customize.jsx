import React, { useContext} from 'react'
import Card from '../components/Card'
import image1 from '../assets/1.jpg';
import image2 from '../assets/2.webp';
import image3 from '../assets/3.webp';
import image4 from '../assets/4.jpg';
import image5 from '../assets/5.jpg';
import image6 from '../assets/6.jpeg';
import image7 from '../assets/7.avif';
import { RiImageAddLine } from "react-icons/ri";
import { useRef } from 'react';
import { UserDataContext } from '../context/userDataContext';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';

function Customize() {
    const{frontendImage,
    setFrontendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage}=useContext(UserDataContext);
    const navigate=useNavigate();
    const inputImage=useRef();
    const handleImage=(e)=>{
        const file=e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[#010004] to-[#0f094f] flex justify-center items-center flex-col p-[20px]'>
                <IoMdArrowRoundBack className='absolute top-[30px] left-[30px] cursor-pointer text-white w-[25px] h-[25px]' onClick={()=>navigate("/")}/>
        <h1 className='text-white text-[30px] text-center mb-[40px]'>Select Your <span className="bg-gradient-to-t from-[#dd1cf7] to-[#2fc5d6] bg-clip-text text-transparent">Assistant Image</span></h1>
        <div className='w-full max-w-[900px] flex justify-center items-center gap-[15px] flex-wrap'>
            <Card image={image1}/>
            <Card image={image2}/>
            <Card image={image3}/>
            <Card image={image4}/>
            <Card image={image5}/>
            <Card image={image6}/>
            <Card image={image7}/>

            <div className={`w-[70px] h-[140px] lg:w-[100px] lg:h-[150px] bg-[#030326] border-2 border-[blue] rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 cursor-pointer hover:border-4 hover:border-[blue] flex items-center justify-center ${selectedImage=="input" ? "border-4 border-[blue] shadow-2xl shadow-blue-500/50": null}`} onClick={()=> {
                inputImage.current.click();
                setSelectedImage("input");
                }}>
                {!frontendImage && 
                <RiImageAddLine className='text-white w-[25px] h-[25px] '/>}
                {frontendImage && <img src={frontendImage} className='h-full object-cover rounded-2xl overflow-hidden' />}
            </div>
            <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
        </div>
        {selectedImage && <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gradient-to-t from-[#e665d7] to-[#9db5f3] transition-all duration-300 cursor-pointer' onClick={()=> navigate("/customize2")}>Next</button>}
            
    </div>
  )
}

export default Customize
