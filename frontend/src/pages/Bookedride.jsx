import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  MessageCircle, 
  Navigation, 
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Navbar';

const BookedRides = () => {
  const navigate = useNavigate();
  const [bookedRides, setBookedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchBookedRides();
  }, []);

const fetchBookedRides = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view your rides');
      navigate('/signin');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/user/booked`, {
      headers: { Authorization: `${token}` }
    });

    if (response.data.success) {
      const processedRides = response.data.rides.map(ride => {
        const rideDate = new Date(ride.date);
        const currentDate = new Date();
  
        rideDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        if (rideDate < currentDate && ride.status === 'active') {
          return { ...ride, status: 'completed' };
        } else if (rideDate === currentDate.getTime() && ride.status === 'active') {
          return { ...ride, status: 'in_progress' };
        } else if (rideDate > currentDate && ride.status !== 'cancelled') {
          return { ...ride, status: 'active' };
        }
        
        return ride;
      });
      
      setBookedRides(processedRides);
    } else {
      throw new Error(response.data.message || 'Failed to fetch rides');
    }

  } catch (error) {
    console.error('Error fetching booked rides:', error);
    setError('Failed to load booked rides');
    setBookedRides([]);
  } finally {
    setLoading(false);
  }
};


const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'text-blue-600 bg-blue-100';
    case 'upcoming':
      return 'text-green-600 bg-green-100';
    case 'completed':
      return 'text-gray-600 bg-gray-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'in_progress':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'active':
      return <Clock className="h-4 w-4" />;
    case 'upcoming':
      return <CheckCircle className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    case 'in_progress':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};


const filteredRides = bookedRides.filter(ride => {
  let matchesFilter = false;
 
  switch (filter) {
    case 'all':
      matchesFilter = true;
      break;
    case 'upcoming':
      matchesFilter = ride.status === 'active' || ride.status === 'in_progress';
      break;
    case 'active':
      matchesFilter = ride.status === 'active';
      break;
    case 'completed':
      matchesFilter = ride.status === 'completed';
      break;
    case 'cancelled':
      matchesFilter = ride.status === 'cancelled';
      break;
    default:
      matchesFilter = ride.status === filter;
  }
  
  const matchesSearch = 
    ride.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.driver?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  
  return matchesFilter && matchesSearch;
});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (timeString.includes(':')) return timeString;
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading your rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-white shadow-sm border-b mt-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>

    

<div className="bg-white border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex space-x-8">
      {[
        { key: 'all', label: 'All Rides', count: bookedRides.length },
        { 
          key: 'upcoming', 
          label: 'Upcoming', 
          count: bookedRides.filter(r => r.status === 'active' || r.status === 'in_progress').length 
        },
        { 
          key: 'completed', 
          label: 'Completed', 
          count: bookedRides.filter(r => r.status === 'completed').length 
        },
        { 
          key: 'cancelled', 
          label: 'Cancelled', 
          count: bookedRides.filter(r => r.status === 'cancelled').length 
        }
      ].map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            filter === key
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {label} ({count})
        </button>
      ))}
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {filteredRides.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't booked any rides yet." 
                : `No ${filter} rides found.`}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Find Rides
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredRides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                        {getStatusIcon(ride.status)}
                        <span className="ml-1 capitalize">{ride.status}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ride.userRole === 'driver' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'
                      }`}>
                        {ride.userRole === 'driver' ? '🚗 Driver' : '👤 Passenger'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{ride.price}</p>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">{ride.from}</p>
                          <p className="text-sm text-gray-500">Pickup</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">{ride.to}</p>
                          <p className="text-sm text-gray-500">Drop-off</p>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(ride.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{formatTime(ride.time)}</span>
                    </div>
                  </div>

                  {/* Driver/Passenger Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                        {ride.userRole === 'driver' 
                          ? ride.passengers?.[0]?.userId?.name?.charAt(0) || 'P'
                          : ride.driver?.userId?.name?.charAt(0) || 'D'
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {ride.userRole === 'driver' 
                            ? ride.passengers?.[0]?.userId?.name || 'Passenger'
                            : ride.driver?.userId?.name || 'Driver'
                          }
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {ride.userRole === 'driver' ? 'Passenger' : 'Driver'}
                          </span>
                          {ride.driver?.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{ride.driver.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{ride.availableSeats}/{ride.totalSeats || 4}</span>
                      </div>
                    </div>
                  </div>

                  {ride.car && (
                    <div className="flex items-center space-x-2 text-gray-600 mb-4">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">
                        {ride.car.model} • {ride.car.color} • {ride.car.licensePlate}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-3">
                      {ride.status === 'active' && (
                        <>
                          <button
                            onClick={() => navigate(`/ride/${ride._id}/track`)}
                            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
                          >
                            <Navigation className="h-4 w-4" />
                            <span>Track Ride</span>
                          </button>
                          
                          <a
                            href={`tel:${ride.userRole === 'driver' ? ride.passengers?.[0]?.userId?.phone : ride.driver?.userId?.phone}`}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </a>
                          
                          <button
                            onClick={() => navigate(`/ride/${ride._id}/chat`)}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Chat</span>
                          </button>
                        </>
                      )}
                      
                      {ride.status === 'completed' && (
                        <button
                          onClick={() => {/* Handle rate/review */}}
                          className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          <span>Rate</span>
                        </button>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Booked {formatDate(ride.bookingDate || ride.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedRides;