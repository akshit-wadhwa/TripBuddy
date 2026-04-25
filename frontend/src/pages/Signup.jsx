import { useState } from "react";
import Navbar from "../components/Navbar";
import { Navigate, useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agree: false,
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    console.log("Signup Data:", formData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        setMessage("✅ Signup successful! Redirecting...");
        setTimeout(() => navigate("/signin/email"), 1500);
      } else {
        setMessage(`❌ ${data.error || data.msg || "Signup failed. Please try again."}`);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-start justify-center px-4">
        <div className="max-w-xl w-full mt-16">

          <h1 className="text-3xl md:text-4xl font-bold text-center text-cyan-900 mb-6">
            Create your account
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Join <span className="font-semibold text-cyan-700">TripBuddy</span> and start sharing rides today.
          </p>


          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-center ${message.includes("✅")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
                }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-cyan-600 focus:ring-2 focus:ring-cyan-800 focus:outline-none bg-gray-100 text-gray-800 text-lg"
            />


            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-cyan-600 focus:ring-2 focus:ring-cyan-800 focus:outline-none bg-gray-100 text-gray-800 text-lg"
            />


            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-cyan-600 focus:ring-2 focus:ring-cyan-800 focus:outline-none bg-gray-100 text-gray-800 text-lg"
            />


            <label className="flex items-start gap-2 cursor-pointer text-gray-700">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="h-5 w-5 border-2 border-gray-400 rounded focus:ring-0 mt-1"
              />
              <span className="text-sm md:text-base leading-relaxed">
                By signing up, I agree to receive ride updates and promotional offers from{" "}
                <span className="font-semibold text-cyan-800">TripBuddy</span>.
                I can opt out anytime in my profile settings.
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-cyan-800 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
            >
              Sign up
            </button>
          </form>


          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <a href="/signin/email" className="text-cyan-700 font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
