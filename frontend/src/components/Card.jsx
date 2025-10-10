import React, { useContext } from 'react'
import { UserDataContext } from '../context/userDataContext';

function Card({ image }) {
    const{
        selectedImage,
        setSelectedImage,
        setBackendImage,
        setFrontendImage}=useContext(UserDataContext);
    
  return (
    <div className={`w-[70px] h-[140px] lg:w-[100px] lg:h-[150px] bg-[#030326] border-2 border-[blue] rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 cursor-pointer hover:border-4 hover:border-[blue] ${selectedImage==image ? "border-4 border-[blue] shadow-2xl shadow-blue-500/50": null}`}>
      <img src={image} className='h-full object-cover rounded-2xl overflow-hidden' onClick={()=> {
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)
        }}/>
    </div>
  )
}

export default Card
