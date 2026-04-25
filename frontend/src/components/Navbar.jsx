import {
  Sparkles,
  Zap,
  Globe,
  Compass,
  Rocket,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Heart,
  Briefcase,
  MapPin,
  Calendar,
  CreditCard,
  HelpCircle,
  Shield,
  Crown,
  Activity,
  Car,
  CarIcon
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const cleanToken = token.replace('Bearer ', '').trim();
   
      const payload = JSON.parse(atob(cleanToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
  
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  };

  const getValidToken = async () => {
    let token = localStorage.getItem("token");
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return null;
    }

    const cleanToken = token.replace('Bearer ', '').trim();
    
    if (isTokenExpired(cleanToken)) {
      console.log('Token expired, attempting refresh...');
      
      try {
        const refreshResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`, {}, {
          headers: {
            Authorization: `Bearer ${cleanToken}`
          }
        });

        if (refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);
          console.log('Token refreshed successfully');
          return `Bearer ${newToken}`;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
 
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert('Your session has expired. Please log in again.');
        navigate('/login');
        return null;
      }
    }

    return token.startsWith('Bearer ') ? token : `Bearer ${cleanToken}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    setIsLoggedIn(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchExistingNotifications();
      setupPollingNotifications();
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isLoggedIn]);

  const fetchExistingNotifications = async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      console.log('Fetching existing notifications...');

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/latest`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.notifications) {
        console.log('📋 Loaded existing notifications:', response.data);

        const formattedNotifications = response.data.notifications.map(notif => ({
          id: notif._id || notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          time: new Date(notif.createdAt || notif.timestamp),
          unread: notif.status === 'unread',
          icon: getNotificationIcon(notif.type),
          metadata: notif.metadata || {}
        }));

        setNotifications(formattedNotifications);
        setUnreadCount(response.data.unreadCount || formattedNotifications.filter(n => n.unread).length);
      }
    } catch (error) {
      console.error('Error fetching existing notifications:', error);
    }
  };

  const setupPollingNotifications = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      await fetchLatestNotifications();
    }, 30000);
    
    console.log('Started polling for notifications');
  };

  const fetchLatestNotifications = async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/latest`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.notifications) {
        console.log('Fetched latest notifications:', response.data);
  
        const formattedNotifications = response.data.notifications.map(notif => ({
          id: notif._id || notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          time: new Date(notif.createdAt || notif.timestamp),
          unread: notif.status === 'unread',
          icon: getNotificationIcon(notif.type),
          metadata: notif.metadata || {}
        }));

        setNotifications(prev => {
          const existingIds = prev.map(n => n.id);
          const newNotifications = formattedNotifications.filter(n => !existingIds.includes(n.id));
          return [...newNotifications, ...prev];
        });

        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'ride_match': '🚗',
      'ride_booked': '✅',
      'ride_cancelled': '❌',
      'payment_received': '💰',
      'new_message': '💬',
      'ride_reminder': '⏰',
      'weather_alert': '🌤️',
      'traffic_update': '🚦',
      'safety_alert': '🛡️',
      'achievement': '🏆',
      'tip': '💡',
      'community': '👥',
      'system': '🔔'
    };
    return iconMap[type] || '🔔';
  };

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === notificationId ? { ...notif, unread: false } : notif
      );
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));

    await updateNotificationStatus(notificationId, 'read');
  };

  const markAllAsRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, unread: false }));
      return updated;
    });
    setUnreadCount(0);

    await updateAllNotificationsStatus('read');
  };

  const updateNotificationStatus = async (notificationId, status) => {
    try {
      const token = await getValidToken();
      if (!token) return;

      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notificationId}/status`, 
        { status },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const updateAllNotificationsStatus = async (status) => {
    try {
      const token = await getValidToken();
      if (!token) return;

      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/mark-all-read`, 
        {},
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error updating all notifications status:', error);
    }
  };

  const formatTime = (time) => {
    const now = new Date();
    const diff = now - new Date(time);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'ride_match': 'border-l-green-500 bg-green-50/30',
      'ride_booked': 'border-l-blue-500 bg-blue-50/30',
      'ride_cancelled': 'border-l-red-500 bg-red-50/30',
      'payment_received': 'border-l-yellow-500 bg-yellow-50/30',
      'new_message': 'border-l-purple-500 bg-purple-50/30',
      'safety_alert': 'border-l-orange-500 bg-orange-50/30',
      'achievement': 'border-l-pink-500 bg-pink-50/30',
      'default': 'border-l-blue-500 bg-blue-50/30'
    };
    return colorMap[type] || colorMap.default;
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handlePublish = () => {
    navigate("/add-ride");
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rideNotifications");
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/");
    setTimeout(() => window.location.reload(), 100);
  };

  const handleNavClick = (path) => {
    if (path.startsWith("/")) {
      navigate(path);
    } else {
      const element = document.getElementById(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setShowMobileMenu(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/", label: "Home", icon: Globe, external: false },
    { path: "/search-rides", label: "Explore", icon: Compass, external: false },
    { path: "/my-rides", label: "My Rides", icon: Activity, external: false },
    { path: "/safety", label: "Safety", icon: Shield, external: false },
  ];

  const userMenuItems = isLoggedIn ? [
    { 
      label: "Dashboard", 
      icon: Activity, 
      action: () => navigate("/dashboard"),
      description: "View your activity"
    },
    { 
      label: "My Bookings", 
      icon: Calendar, 
      action: () => navigate("/my-rides"),
      description: "Manage your rides"
    },
    { 
      label: "Messages", 
      icon: Bell, 
      action: () => navigate("/messages"),
      description: "Chat with riders"
    },
    { 
      label: "Payments", 
      icon: CreditCard, 
      action: () => navigate("/payments"),
      description: "Payment history"
    },
    { 
      label: "Settings", 
      icon: Settings, 
      action: () => navigate("/settings"),
      description: "Account settings"
    },
    { 
      label: "Help Center", 
      icon: HelpCircle, 
      action: () => navigate("/help"),
      description: "Get support"
    },
  ] : [
    { 
      label: "Sign In", 
      icon: User, 
      action: () => navigate("/signin"),
      description: "Access your account"
    },
    { 
      label: "Join TripBuddy", 
      icon: Sparkles, 
      action: () => navigate("/signup"),
      description: "Create new account"
    }
  ];

  return (
    <>
      {/* MAIN HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-2xl' 
          : 'bg-transparent '
      }`}>
        
        {/* Gradient Border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
           
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Car className="h-6 w-6 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
               </div>
              
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-700 via-cyan-700 to-cyan-700 bg-clip-text text-cyan-700">
                  TripBuddy
                </h1>
                <p className="text-xs text-gray-700 font-medium -mt-1">Smart Travel</p>
              </div>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const isActive = isActivePath(item.path);
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 transition-transform duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    } group-hover:scale-110`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center space-x-4">
              
              {/* Publish Ride Button */}
              <button
                onClick={handlePublish}
                className="relative flex items-center space-x-2 bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <CarIcon className="h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Offer Ride</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
                >
                  <Bell className="h-5 w-5 group-hover:animate-pulse" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </button>

                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-[140]" 
                      onClick={() => setShowNotifications(false)}
                    />
                    
                    <div
                      ref={notificationRef}
                      className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-3xl shadow-2xl z-[200] animate-in slide-in-from-top-2 duration-300 max-h-[500px] overflow-hidden"
                    >

                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white/95 border-l border-t border-gray-200/50 transform rotate-45" />
                      
                      <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                            <span>Updates</span>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          </h3>
                          <p className="text-sm text-gray-500">{unreadCount} unread updates</p>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`px-6 py-4 border-b border-gray-100/50 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 ${
                                notification.unread ? `${getNotificationColor(notification.type)} border-l-4` : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl flex-shrink-0 mt-1">
                                  {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                      {notification.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(notification.time)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {notification.message}
                                  </p>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                            <p className="text-sm text-gray-400">You'll receive updates here!</p>
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-3 border-t border-gray-200/50 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>Auto-updating every 30s</span>
                          </div>
                          <button
                            onClick={() => fetchLatestNotifications()}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                          >
                            🔄 Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
                >
                  {isLoggedIn && user ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">Premium Member</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[150]" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-3xl shadow-2xl py-4 z-[200] animate-in slide-in-from-top-2 duration-300"
                    >
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white/95 border-l border-t border-gray-200/50 transform rotate-45" />

                      {isLoggedIn && user && (
                        <div className="px-6 pb-4 border-b border-gray-200/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Crown className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-yellow-600 font-medium">Premium</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="py-2">
                        {userMenuItems.map((item, index) => {
                          const IconComponent = item.icon;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                item.action();
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center space-x-4 px-6 py-3 text-left transition-all duration-200 group hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-gray-100 group-hover:bg-gray-200">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs opacity-60">{item.description}</p>
                              </div>
                              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </button>
                          );
                        })}
                        
                        {isLoggedIn && (
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-4 px-6 py-3 text-left transition-all duration-200 group hover:bg-red-50 text-red-600"
                          >
                            <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-all duration-200">
                              <LogOut className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs opacity-60">Logout from account</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl z-[95] lg:hidden border border-gray-200/50 animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              
              {/* User Info */}
              {isLoggedIn && user && (
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <button
                onClick={handlePublish}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 rounded-2xl font-semibold shadow-xl mb-6"
              >
                <Zap className="h-5 w-5" />
                <span>Offer a Ride</span>
              </button>

              {/* User Menu Items */}
              <div className="space-y-1">
                {userMenuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;