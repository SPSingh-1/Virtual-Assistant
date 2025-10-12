import React, { useContext, useState } from 'react';
import bg from '../assets/registrationbg.jpg';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/userDataContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaRobot } from 'react-icons/fa';

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { ServerURL, setUserData } = useContext(UserDataContext);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(`${ServerURL}/api/auth/signup`, {
        name,
        email,
        password
      }, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      if (result.data.success) {
        navigate("/customize");
      }
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setErr(error.response.data.message);
    }
  };

  return (
    <div
      className="w-full min-h-[100vh] bg-cover bg-center flex justify-center items-center p-4 relative overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-black/70 to-blue-900/80"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-float"
            style={{
              width: Math.random() * 80 + 40,
              height: Math.random() * 80 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${Math.random() * 8 + 8}s`
            }}
          />
        ))}
      </div>

      <form
        className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10"
        onSubmit={handleSignUp}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
            <FaRobot className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-2 text-center">
          Create Account
        </h1>
        <p className="text-center mb-8">
          <span className="text-gray-300">Register your </span>
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-bold">
            Virtual Assistant
          </span>
        </p>

        {/* Name Input */}
        <div className="mb-5">
          <label className="text-white text-sm font-semibold mb-2 block">
            Full Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full h-12 rounded-xl bg-white/10 border-2 border-white/20 outline-none pl-12 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              required
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-5">
          <label className="text-white text-sm font-semibold mb-2 block">
            Email Address
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-12 rounded-xl bg-white/10 border-2 border-white/20 outline-none pl-12 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="text-white text-sm font-semibold mb-2 block">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Create a password"
              className="w-full h-12 rounded-xl bg-white/10 border-2 border-white/20 outline-none pl-12 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
        </div>

        {/* Error Message */}
        {err.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-300 text-sm text-center">{err}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating account...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>

        {/* Sign In Link */}
        <p className="text-center text-gray-300">
          Already have an account?{" "}
          <span
            className="text-purple-400 font-semibold cursor-pointer hover:text-purple-300 transition-colors"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </form>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

export default SignUp;