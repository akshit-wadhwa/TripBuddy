import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Send,
  MoreVertical,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  IndianRupee,
} from "lucide-react";
import Header from "../components/Navbar";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const RideChat = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchCurrentUser(token);
  }, [navigate]);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/signin");
    }
  };

  useEffect(() => {
    if (rideId && currentUser) {
      fetchRideDetails();
    }
  }, [rideId, currentUser]);

  const fetchRideDetails = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const rideResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
      headers: { Authorization: token },
    });
    const rideData = await rideResponse.json();

    if (rideData.success && rideData.ride) {
      setRideDetails(rideData.ride);

      const driver = rideData.ride.ride?.driver || rideData.ride.driver;
      const passenger = rideData.ride.ride?.passenger || rideData.ride.passenger;

      console.log(rideData.ride);
      

      const driverId = driver?.userId?._id || driver?.userId || driver?._id;
      const passengerId = passenger?._id || passenger?.userId;

      const isCurrentUserDriver = currentUser._id === driverId;

      const targetUser = isCurrentUserDriver ? passenger : driver;

      if (targetUser) {
        setOtherUser({
          _id: targetUser.userId?._id || targetUser._id,
          name: targetUser.name || "User",
          email: targetUser.email || "user@example.com",
          phone: targetUser.phone || "N/A",
          role: isCurrentUserDriver ? "Passenger" : "Driver",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            targetUser.name || "User"
          )}&background=${isCurrentUserDriver ? "059669" : "0891b2"}&color=fff`,
        });
      } else {
        setOtherUser({
          _id: "unknown",
          name: isCurrentUserDriver ? "Passenger" : "Driver",
          role: isCurrentUserDriver ? "Passenger" : "Driver",
          avatar: `https://ui-avatars.com/api/?name=${
            isCurrentUserDriver ? "Passenger" : "Driver"
          }&background=${isCurrentUserDriver ? "059669" : "0891b2"}&color=fff`,
        });
      }
    } else {
      console.error("Failed to fetch ride details");
      navigate("/search-rides");
    }
  } catch (error) {
    console.error("Error fetching ride details:", error);
    navigate("/search-rides");
  } finally {
    setLoading(false);
  }
};


  const fetchPassengerInfo = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const chatResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/passenger/${rideId}`, {
        headers: { Authorization: token },
      });
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        if (chatData.success && chatData.passenger) {
          setOtherUser({
            _id: chatData.passenger._id,
            name: chatData.passenger.name,
            email: chatData.passenger.email,
            phone: chatData.passenger.phone,
            role: "Passenger",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatData.passenger.name)}&background=059669&color=fff`,
          });
          return;
        }
      }
  
      setOtherUser({
        _id: "passenger",
        name: "Passenger",
        role: "Passenger",
        avatar: `https://ui-avatars.com/api/?name=Passenger&background=059669&color=fff`,
      });
      
    } catch (error) {
      console.error("Error fetching passenger info:", error);
      setOtherUser({
        _id: "passenger",
        name: "Passenger", 
        role: "Passenger",
        avatar: `https://ui-avatars.com/api/?name=Passenger&background=059669&color=fff`,
      });
    }
  };

  useEffect(() => {
    if (currentUser && rideId && rideDetails) {
      console.log("Setting up 1-on-1 chat for user:", currentUser._id);
      
      socket.emit("register-user", currentUser._id);
      
      const driver = rideDetails.ride?.driver || rideDetails.driver;
      const driverId = driver?.userId || driver?._id;
      
      const isCurrentUserDriver = currentUser._id === driverId;
      const passengerId = isCurrentUserDriver ? null : currentUser._id;

      socket.emit("join-private-chat", {
        rideId,
        driverId,
        passengerId
      });

      const handleReceiveMessage = (data) => {
        console.log("Received message:", data);
        
        setMessages((prev) => {
          const messageExists = prev.some(msg => msg._id === data._id);
          if (messageExists) return prev;
          return [...prev, data];
        });

        if (data.userId !== currentUser._id && otherUser?._id === "passenger") {
          setOtherUser({
            _id: data.userId,
            name: data.userName,
            role: "Passenger",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.userName)}&background=059669&color=fff`,
          });
        }
      };

      const handleTyping = (data) => {
        if (data.userId !== currentUser._id) {
          setIsTyping(true);
          setTypingUser(data.userName);
        }
      };

      const handleStopTyping = () => {
        setIsTyping(false);
        setTypingUser("");
      };

      socket.on("receive-private-message", handleReceiveMessage);
      socket.on("user-typing-private", handleTyping);
      socket.on("user-stop-typing-private", handleStopTyping);

      fetchChatHistory();

      return () => {
        socket.off("receive-private-message", handleReceiveMessage);
        socket.off("user-typing-private", handleTyping);
        socket.off("user-stop-typing-private", handleStopTyping);
      };
    }
  }, [currentUser, rideId, rideDetails, otherUser]);

const fetchChatHistory = async () => {
  if (!currentUser || !rideDetails) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/chat/${rideId}/${currentUser._id}`,
      { headers: { Authorization: token } }
    );
    const data = await res.json();

    if (data.success) setMessages(data.messages || []);
  } catch (err) {
    console.error("Error fetching chat history:", err);
  }
};


useEffect(() => {
  if (messages.length > 0 && currentUser?._id && otherUser?.name === "Passenger") {
    const otherUserMessage = messages.find(msg => msg.userId !== currentUser._id);
    
    if (otherUserMessage) {
      setOtherUser({
        _id: otherUserMessage.userId,
        name: otherUserMessage.userName,
        role: "Passenger",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserMessage.userName)}&background=059669&color=fff`,
      });
    }
  }
}, [messages, currentUser]); 

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || !rideDetails) return;

    const driver = rideDetails.ride?.driver || rideDetails.driver;
    const driverId = driver?.userId || driver?._id;
    const isCurrentUserDriver = currentUser._id === driverId;
    const passengerId = isCurrentUserDriver ? null : currentUser._id;

    const messageData = {
      rideId,
      userId: currentUser._id,
      userName: currentUser.name || currentUser.email,
      message: message.trim(),
      driverId,
      passengerId,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send-private-message", messageData);
    setMessage("");
    
    socket.emit("stop-typing-private", {
      rideId,
      userId: currentUser._id,
      userName: currentUser.name || currentUser.email,
      driverId,
      passengerId,
    });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (currentUser && rideDetails) {
      const driver = rideDetails.ride?.driver || rideDetails.driver;
      const driverId = driver?.userId || driver?._id;
      const isCurrentUserDriver = currentUser._id === driverId;
      const passengerId = isCurrentUserDriver ? null : currentUser._id;

      socket.emit("typing-private", {
        rideId,
        userId: currentUser._id,
        userName: currentUser.name || currentUser.email,
        driverId,
        passengerId,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTypingUser("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  if (loading || !currentUser || !rideDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          <p className="ml-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const driver = rideDetails.ride?.driver || rideDetails.driver;
  const isCurrentUserDriver = currentUser._id === (driver?.userId || driver?._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto pt-20 pb-8">
        <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <img
                src={otherUser?.avatar}
                alt={otherUser?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="text-lg font-semibold">{otherUser?.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    otherUser?.role === 'Driver' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {otherUser?.role}
                  </span>
                  {isTyping && (
                    <span className="text-sm text-green-600">
                      typing...
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {otherUser?.phone && (
                <a
                  href={`tel:${otherUser.phone}`}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                </a>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Start your conversation with {otherUser?.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {rideDetails.from || rideDetails.ride?.from} → {rideDetails.to || rideDetails.ride?.to}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.userId === currentUser._id;
                    
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "ml-12" : "mr-12"}`}>
                          <div
                            className={`p-3 rounded-2xl ${
                              isCurrentUser
                                ? "bg-cyan-600 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p
                            className={`text-xs text-gray-500 mt-1 ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && typingUser && (
                  <div className="flex justify-start mr-12">
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder={`Message ${otherUser?.name}...`}
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="text-center">
                <img
                  src={otherUser?.avatar}
                  alt={otherUser?.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />
                <h3 className="text-lg font-semibold">{otherUser?.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  otherUser?.role === 'Driver' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {otherUser?.role}
                </span>
                
                {otherUser?.phone && otherUser.phone !== "N/A" && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{otherUser.phone}</span>
                  </div>
                )}
                
                {otherUser?.email && otherUser.email !== "user@example.com" && (
                  <div className="mt-1 flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{otherUser.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Ride Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{rideDetails.from || rideDetails.ride?.from}</p>
                    <p className="text-sm text-gray-500">Pickup</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{rideDetails.to || rideDetails.ride?.to}</p>
                    <p className="text-sm text-gray-500">Drop-off</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(rideDetails.date || rideDetails.ride?.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">at {rideDetails.time || rideDetails.ride?.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <IndianRupee className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">₹{rideDetails.price || rideDetails.ride?.price}</p>
                    <p className="text-sm text-gray-500">per seat</p>
                  </div>
                </div>
              </div>

              {(rideDetails.notes || rideDetails.ride?.notes) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{rideDetails.notes || rideDetails.ride?.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideChat;