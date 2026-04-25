import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  User,
  Clock,
  Search,
  Car,
  MapPin,
  Calendar,
} from "lucide-react";
import Header from "../components/Navbar";

const Messages = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
        fetchConversations(token, data.user._id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/signin");
    }
  };

  const fetchConversations = async (token, userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/conversations/${userId}`, {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        console.log("No conversations found");
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (rideId) => {
    navigate(`/ride/${rideId}/chat`);
  };

  const formatLastMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.rideDetails?.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.rideDetails?.to?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          <p className="ml-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto pt-20 pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Start chatting with passengers when they book your rides!"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <div
    key={conversation.uniqueKey} 
    onClick={() => handleOpenChat(conversation.rideId)}
    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
  >
    <div className="flex items-start space-x-4">
      <img
        src={conversation.otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.otherUser.name)}&background=059669&color=fff`}
        alt={conversation.otherUser.name}
        className="w-12 h-12 rounded-full flex-shrink-0"
      />

                    {/* Conversation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatLastMessageTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>

                      {/* Ride Details */}
                      <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>Ride #{conversation.rideId.slice(-6)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(conversation.rideDetails.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="truncate">{conversation.rideDetails.from}</span>
                        <span>→</span>
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="truncate">{conversation.rideDetails.to}</span>
                      </div>

                      {/* Last Message */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 truncate">
                            <span className="font-medium">
                              {conversation.lastMessage.userId === currentUser._id ? "You: " : ""}
                            </span>
                            {conversation.lastMessage.message}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-cyan-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Card */}
        {conversations.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Conversations</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {conversations.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Active Passengers</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {new Set(conversations.map(c => c.otherUser._id)).size}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Unread Messages</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;