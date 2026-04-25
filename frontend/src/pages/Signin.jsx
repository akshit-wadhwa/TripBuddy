import { Mail, Facebook, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Signin = () => {

  const navigate = useNavigate();

  const handleEmailContinue = () => {
    navigate('/signin/email');
  };

  const handleFacebookContinue = () => {
 
    console.log("Continue with Facebook");
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br  from-white to-blue-50 flex items-start justify-center px-4">
      <div className="max-w-2xl w-full">
   
        <div className="text-center mb-8 mt-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wider">
            How you'd like to continue?
          </h1>
          <p className="text-gray-600">
            Choose your preferred way to get started with TripBuddy
          </p>
        </div>

    
        <div className="space-y-4">
 <div
  onClick={handleEmailContinue}
  className="w-full border-b-2 border-gray-300 text-gray-700 py-2 px-6 rounded-lg font-Inter hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-between"
>
  <div className="flex items-center gap-3">
    <Mail className="h-5 w-5" />
    Continue with Email
  </div>
  <ArrowRight className="h-5 w-5" />
</div>
 
 <div
  onClick={handleFacebookContinue}
  className="w-full border-b-2 border-white-600 bg-cyan-800 text-white py-2 px-6 rounded-lg  hover:bg-cyan-700 transition-colors cursor-pointer flex items-center justify-between"
>
  <div className="flex items-center gap-3">
    <Facebook className="h-5 w-5" />
    Continue with Facebook
  </div>
  <ArrowRight className="h-5 w-5" />
</div>
</div>

       
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Signin;