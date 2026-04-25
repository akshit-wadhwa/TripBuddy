import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const SignEmail = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [optOut, setOptOut] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate form fields
    if (!formData.email || !formData.password) {
      setMessage("Please fill in both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signin/email`,
        formData
      );

      console.log("Signin response:", response.data);

      if (response.data.user && response.data.user.token) {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/send-otp`, {
          email: formData.email
        });

        setStep(2);
        setMessage("OTP sent to your email!");
      } else {
        setMessage("Invalid email or password");
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response data:", error.response?.data);
      setMessage(
        error.response?.data?.message || error.response?.data?.error || "Server Error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`,
        {
          email: formData.email,
          otp
        }
      );

      console.log("Verify OTP response:", response.data);

      if (response.data.token) {
        localStorage.setItem('token', "Bearer " + response.data.token);

        setMessage("✅ Login successful!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "❌ Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp("");
    } else {
      navigate("/signin");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-start justify-center px-4">
        <div className="max-w-xl w-full mt-20">

          <h1 className="text-3xl md:text-4xl font-bold text-center text-cyan-900 mb-8">
            {step === 1 ? "What's your email?" : "Enter OTP"}
          </h1>

          {message && (
            <div
              className={`mb-6 p-3 rounded-lg text-center ${message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
                }`}
            >
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-700 focus:ring-2 focus:ring-cyan-700 focus:outline-none bg-gray-100 text-gray-800 text-lg"
              />


              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-cyan-700 focus:ring-2 focus:ring-cyan-700 focus:outline-none bg-gray-100 text-gray-800 text-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>


              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  checked={optOut}
                  onChange={() => setOptOut(!optOut)}
                  className="h-5 w-5 border-2 border-gray-400 rounded focus:ring-0"
                />
                <span className="text-sm md:text-base font-medium">
                  I don’t want to receive special offers and personalized
                  recommendations via email
                </span>
              </label>


              <p className="text-gray-600 text-sm leading-relaxed">
                By entering your email, you agree to receive promotional emails
                from <span className="font-semibold text-cyan-800">TripBuddy</span>.
                You can opt out anytime in your profile settings.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-800 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-700 focus:ring-2 focus:ring-cyan-700 focus:outline-none bg-gray-100 text-center text-lg tracking-widest"
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-cyan-800 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-cyan-700 hover:underline text-sm"
                >
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default SignEmail;
