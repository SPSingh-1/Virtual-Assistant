import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Customize from './pages/Customize';
import { UserDataContext } from './context/userDataContext';
import Home from './pages/Home';
import Customize2 from './pages/Customize2';

const App = () => {
  const {userData} = useContext(UserDataContext);
  return (
    <Routes>
      <Route path="/" element={!userData ?<Navigate to="/signup" /> : userData.user?.assistantImage && userData.user?.assistantName  ? <Home /> : <Navigate to={"/customizes"}/>} />
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to={"/"}/> } />
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to={"/"}/>} />
      <Route path="/customize" element={userData ? <Customize />: <Navigate to={"/signup"}/>} />
      <Route path="/customize2" element={userData ? <Customize2 />: <Navigate to={"/signup"}/>} />
    </Routes>
  );
}

export default App;
