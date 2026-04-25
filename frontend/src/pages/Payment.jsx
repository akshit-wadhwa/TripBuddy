import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Shield, 
  Clock, 
  MapPin, 
  User, 
  Car, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Star,
  Zap,
  Lock,
  Sparkles,
  Heart,
  Award,
  Gift
} from "lucide-react";
import Header from "../components/Navbar";

const PaymentPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUserData = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
       if (userData) {
  setCurrentUser(JSON.parse(userData));
} else if (token) {
  axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
    headers: { Authorization: `${token}` },
  })
  .then(res => setCurrentUser(res.data.user))
  .catch(() => {
    setCurrentUser(null);
    alert("Please log in again.");
  });
} else {
  setCurrentUser(null);
}

      } catch (error) {
        console.error("Error getting user data:", error);
        setCurrentUser({ 
          _id: "default-user",
          name: "User",
          email: ""
        });
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching ride details for ID:", rideId);

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`
          }
        });
        
        console.log("Ride details fetched:", response.data);
        const rideData = response.data.ride?.ride || response.data;
        setRideDetails(rideData);
        
      } catch (error) {
        console.error("Error fetching ride details:", error);
        
        setRideDetails({
          from: "Your Current Location",
          to: "Destination",
          date: new Date().toISOString(),
          price: 150,
          time: "15 minutes",
          passengerName: "User",
          passengerEmail: "",
          passengerPhone: ""
        });
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRideDetails();
    } else {
      console.error("No rideId found in URL");
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          console.log("Razorpay script already loaded");
          resolve(true);
          return;
        }

        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          existingScript.onload = () => {
            console.log("Razorpay script loaded from existing tag");
            resolve(true);
          };
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          console.log("Razorpay script loaded successfully");
          resolve(true);
        };
        
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(false);
        };
        
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (!rideDetails?.price) return 0;
    const basePrice = Number(rideDetails.price);
    const platformFee = 10;
    const gst = Math.round(basePrice * 0.1);
    return basePrice + platformFee + gst;
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentStatus(null);

      const totalAmount = calculateTotalAmount();
      const userId = currentUser?._id;

      const requestData = {
        amount: Number(totalAmount),
        rideId: String(rideId),
        userId: String(userId)
      };

      console.log("📤 Making payment request...");

      // Create Razorpay Order
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/create-order`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("✅ Order created successfully:", data);

      if (!data.order || !data.order.id) {
        console.error("❌ Invalid order data:", data);
        throw new Error("Invalid order response from server");
      }

      const { id: order_id, amount: orderAmount, currency } = data.order;
      
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        console.error("❌ Razorpay key not found in environment");
        throw new Error("Razorpay key not configured");
      }

      if (!window.Razorpay) {
        console.error("❌ Razorpay script not loaded");
        throw new Error("Razorpay script not loaded. Please refresh the page.");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: "TripBuddy - Ride Share",
        description: `Payment for ride from ${rideDetails?.from || 'Unknown'} to ${rideDetails?.to || 'Unknown'}`,
        order_id: order_id,
        handler: async function (response) {
  try {
    console.log("💳 Payment successful:", response);
    
    const verifyRes = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify-payment`, 
      {
        ...response,
        rideId,
        userId
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (verifyRes.data.success) {
      setPaymentStatus('success');
      setTimeout(() => {
        navigate(`/ride/${rideId}/tracking`);
      }, 3000);
    } else {
      setPaymentStatus('failed');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    setPaymentStatus('failed');
  }
},

        modal: {
          ondismiss: function() {
            console.log("Payment cancelled by user");
            setIsProcessing(false);
            setPaymentStatus('cancelled');
          }
        },
        theme: {
          color: "#3B82F6",
        },
        prefill: {
          name: rideDetails?.passengerName || currentUser?.name || "User",
          email: rideDetails?.passengerEmail || currentUser?.email || "",
          contact: rideDetails?.passengerPhone || ""
        }
      };

      console.log("Razorpay options:", options);

      const razor = new window.Razorpay(options);
      razor.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      console.error('Error details:', error.response?.data);
      setPaymentStatus('failed');
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!rideId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-bounce"></div>
            <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Oops! Ride Not Found
          </h2>
          <p className="text-gray-600 mb-8 text-lg">We couldn't find the ride you're looking for</p>
          <button
            onClick={handleBack}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Take Me Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/30 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              <Car className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Journey</h2>
          <p className="text-white/80 text-lg">Loading payment details...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-6 h-6 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-white/30 rounded-full animate-float delay-100"></div>
        <div className="absolute bottom-32 left-20 w-8 h-8 bg-white/10 rounded-full animate-float delay-200"></div>
        
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Heart className="h-8 w-8 text-red-500 animate-bounce" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-3">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-600 text-lg">Your adventure awaits!</p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-6 border border-emerald-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Amount Paid</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                ₹{calculateTotalAmount()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Ride ID</span>
              <span className="text-sm font-mono bg-emerald-100 px-3 py-1 rounded-full text-emerald-800">
                #{rideId?.slice(-8)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <Car className="h-5 w-5 animate-bounce" />
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping delay-100"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping delay-200"></div>
            </div>
            <p className="font-medium">Redirecting to ride tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="mb-8">
            <div className="w-28 h-28 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertCircle className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Payment Failed
            </h2>
            <p className="text-gray-600 text-lg">Don't worry, let's try again!</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setPaymentStatus(null)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Zap className="inline-block h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-cyan-50 rounded-full mr-4 transition-all duration-200 group"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Complete Payment
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Journey</h2>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-600">Premium Ride</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex flex-col items-center mt-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg"></div>
                  <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-300 to-red-300 my-2"></div>
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Pickup Location</p>
                    <p className="font-semibold text-gray-900">{rideDetails?.from || 'Loading...'}</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-700 mb-1">Drop Location</p>
                    <p className="font-semibold text-gray-900">{rideDetails?.to || 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-200">
                <Clock className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-indigo-700 font-medium mb-1">Duration</p>
                <p className="font-bold text-gray-900">{rideDetails?.time || 'Calculating...'}</p>
              </div>
              <div className="bg-cyan-50 rounded-2xl p-4 text-center border border-cyan-200">
                <MapPin className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm text-cyan-700 font-medium mb-1">Date</p>
                <p className="font-bold text-gray-900">
                  {rideDetails?.date ? new Date(rideDetails.date).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>
          
          <div className="space-y-4">
            <label className="relative block cursor-pointer group">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={selectedPaymentMethod === 'razorpay'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <div className={`p-6 border-2 rounded-2xl transition-all duration-200 ${
                selectedPaymentMethod === 'razorpay' 
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-cyan-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}>
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedPaymentMethod === 'razorpay' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === 'razorpay' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">All Payment Methods</p>
                      <p className="text-sm text-gray-600">Cards • UPI • Wallets • Net Banking</p>
                      <div className="flex items-center mt-1">
                        <Shield className="h-4 w-4 text-green-600 mr-1" />
                        <p className="text-xs text-green-600 font-medium">Powered by Razorpay</p>
                      </div>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'razorpay' && (
                    <Award className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Fare Details</h2>
            <Gift className="h-6 w-6 text-cyan-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Base Fare</span>
              <span className="font-bold text-gray-900">₹{rideDetails?.price || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Platform Fee</span>
              <span className="font-bold text-gray-900">₹10</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">GST (10%)</span>
              <span className="font-bold text-gray-900">₹{Math.round((rideDetails?.price || 0) * 0.1)}</span>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    ₹{calculateTotalAmount()}
                  </span>
                  <p className="text-sm text-gray-500">All inclusive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-blue-900">100% Secure Payment</p>
              <p className="text-sm text-blue-700">Bank-level 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRazorpayPayment}
          disabled={isProcessing || !rideDetails?.price}
          className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-indigo-700 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Zap className="h-6 w-6" />
              <span>Pay ₹{calculateTotalAmount()}</span>
              <Sparkles className="h-6 w-6" />
            </>
          )}
        </button>

        {paymentStatus === 'cancelled' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-bold">Payment Cancelled</p>
            </div>
            <p className="text-yellow-700 text-sm">No worries! You can try again whenever you're ready</p>
          </div>
        )}
      </div>
    </div>
  );
};


const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default PaymentPage;