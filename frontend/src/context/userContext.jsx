import { useEffect, useState } from "react";
import { UserDataContext } from "./userDataContext";
import axios from "axios";

const UserContext = ({ children }) => {
  const ServerURL = "https://virtual-assistant-f0uw.onrender.com";
  const [userData, setUserData] = useState(null);
      const [frontendImage,setFrontendImage]=useState(null);
      const [backendImage,setBackendImage]=useState(null);
      const [selectedImage,setSelectedImage]=useState(null);
  const handleCurrentUser=async () =>{
    try {
      const result = await axios.get(`${ServerURL}/api/user/current`, {withCredentials:true});
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }

  const getGeminiResponse=async(command)=>{
    try {
      const result = await axios.post(`${ServerURL}/api/user/asktoassistant`,{command},{withCredentials:true});
      return result.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);
   
  const value={
    ServerURL,
    userData,
    setUserData,
    handleCurrentUser,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse
  }
  return (
    <UserDataContext.Provider value={ value }>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;

