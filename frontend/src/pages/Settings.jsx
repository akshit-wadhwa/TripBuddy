import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Shield, 
  Bell, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Settings,
  LogOut,
  Star,
  Award
} from 'lucide-react';
import Header from '../components/Navbar';
import { useSimpleAlert } from '../components/SimpleAlert';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, AlertComponent } = useSimpleAlert();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    rating: 0,
    totalRides: 0,
    joinDate: ''
  });

 
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vehicleType: 'car'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    rideUpdates: true,
    promotions: false,
    weeklyReports: true
  });

  const [privacy, setPrivacy] = useState({
    showPhone: true,
    showEmail: false,
    showLastSeen: true,
    allowMessages: true,
    shareLocation: true
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '', relationship: '' }
  ]);

  useEffect(() => {
    fetchUserData();
    fetchVehicles();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user data:', data.user);
        setUserData(prevData => ({
          ...prevData,
          ...data.user,
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : ''
        }));
        
     }
} catch (error) {
     console.error('Error fetching user data:', error);
} finally {
     setLoading(false);
     console.log("hello" + userData);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/vehicles', {
        headers: {
          'Authorization': `${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const token = localStorage.getItem('token');
   
      const profileUpdateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        pincode: userData.pincode,
        bio: userData.bio
      };
      
      console.log('Sending profile update data:', profileUpdateData);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileUpdateData)
      });

      if (response.ok) {
        showSuccess('Profile Updated!', 'Your profile has been updated successfully');
        
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        showError('Update Failed', errorData.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Network Error', 'Unable to update profile. Please check your connection.');
    } finally {
      setSaveLoading(false);
    }
  };
  console.log("hi " +  userData.name);
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('Password Mismatch', 'New passwords do not match. Please try again.');
      return;
    }

    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showSuccess('Password Changed!', 'Your password has been updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        showError('Password Change Failed', error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Network Error', 'Unable to change password. Please check your connection.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/vehicles', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVehicle)
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles([...vehicles, data.vehicle]);
        setNewVehicle({ make: '', model: '', year: '', color: '', licensePlate: '', vehicleType: 'car' });
        showSuccess('Vehicle Added!', 'Your vehicle has been added successfully');
      } else {
        showError('Add Vehicle Failed', 'Failed to add vehicle. Please try again.');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showError('Network Error', 'Unable to add vehicle. Please check your connection.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (response.ok) {
        setVehicles(vehicles.filter(v => v._id !== vehicleId));
        showSuccess('Vehicle Deleted!', 'Your vehicle has been removed successfully');
      } else {
        showError('Delete Failed', 'Failed to delete vehicle. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showError('Network Error', 'Unable to delete vehicle. Please check your connection.');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showWarning('Account Deletion', 'Account deletion requested. Please contact support to complete this process.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'emergency', label: 'Emergency', icon: Phone }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
           
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={userData.profilePicture || '/default-avatar.png'}
                      alt={userData.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <button className="absolute -bottom-1 -right-1 bg-cyan-600 text-white p-1 rounded-full hover:bg-cyan-700 transition-colors">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <h3 className="mt-3 font-medium text-gray-900">{userData.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{userData.rating || 5.0}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1" />
                    {userData.totalRides || 0} rides
                  </div>
                </div>
              </div>

              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-cyan-50 text-cyan-700 border-r-2 border-cyan-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={userData.dateOfBirth}
                        onChange={(e) => setUserData({...userData, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={userData.gender}
                        onChange={(e) => setUserData({...userData, gender: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={userData.city}
                        onChange={(e) => setUserData({...userData, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={userData.address}
                      onChange={(e) => setUserData({...userData, address: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Tell other users about yourself..."
                      maxLength={300}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {userData.bio?.length || 0}/300 characters
                    </p>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h3 className="text-md font-medium text-gray-900">Change Password</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                    >
                      {saveLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-900">Enable Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Add extra security to your account</div>
                      </button>
                      
                      <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-900">Download Account Data</div>
                        <div className="text-sm text-gray-500">Get a copy of your data</div>
                      </button>
                      
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <div className="font-medium text-red-600">Delete Account</div>
                        <div className="text-sm text-red-500">Permanently delete your account and data</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">My Vehicles</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-cyan-100 p-3 rounded-lg">
                              <Car className="h-6 w-6 text-cyan-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {vehicle.color} • {vehicle.licensePlate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="p-2 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Add New Vehicle</h3>
                    <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                        <input
                          type="text"
                          value={newVehicle.make}
                          onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="e.g., Toyota"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                        <input
                          type="text"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="e.g., Camry"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="number"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="2020"
                          min="1950"
                          max="2024"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <input
                          type="text"
                          value={newVehicle.color}
                          onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="e.g., Black"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                        <input
                          type="text"
                          value={newVehicle.licensePlate}
                          onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="ABC123"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                        <select
                          value={newVehicle.vehicleType}
                          onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="car">Car</option>
                          <option value="suv">SUV</option>
                          <option value="truck">Truck</option>
                          <option value="van">Van</option>
                          <option value="motorcycle">Motorcycle</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="flex items-center space-x-2 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Vehicle</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Communication Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-gray-700">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </label>
                              <p className="text-sm text-gray-500">
                                {key === 'emailNotifications' && 'Receive notifications via email'}
                                {key === 'smsNotifications' && 'Receive notifications via SMS'}
                                {key === 'pushNotifications' && 'Receive push notifications'}
                                {key === 'rideUpdates' && 'Get updates about your rides'}
                                {key === 'promotions' && 'Receive promotional offers'}
                                {key === 'weeklyReports' && 'Get weekly activity reports'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-4">
                        {Object.entries(privacy).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-gray-700">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </label>
                              <p className="text-sm text-gray-500">
                                {key === 'showPhone' && 'Allow other users to see your phone number'}
                                {key === 'showEmail' && 'Allow other users to see your email address'}
                                {key === 'showLastSeen' && 'Show when you were last active'}
                                {key === 'allowMessages' && 'Allow other users to message you'}
                                {key === 'shareLocation' && 'Share your location during rides'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setPrivacy({...privacy, [key]: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contacts</h2>
                  
                  <div className="space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => {
                                const updated = [...emergencyContacts];
                                updated[index].name = e.target.value;
                                setEmergencyContacts(updated);
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              placeholder="Contact name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => {
                                const updated = [...emergencyContacts];
                                updated[index].phone = e.target.value;
                                setEmergencyContacts(updated);
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              placeholder="Phone number"
                            />
                          </div>
                          
                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                              <select
                                value={contact.relationship}
                                onChange={(e) => {
                                  const updated = [...emergencyContacts];
                                  updated[index].relationship = e.target.value;
                                  setEmergencyContacts(updated);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              >
                                <option value="">Select</option>
                                <option value="parent">Parent</option>
                                <option value="spouse">Spouse</option>
                                <option value="sibling">Sibling</option>
                                <option value="friend">Friend</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            
                            {emergencyContacts.length > 1 && (
                              <button
                                onClick={() => {
                                  const updated = emergencyContacts.filter((_, i) => i !== index);
                                  setEmergencyContacts(updated);
                                }}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relationship: '' }])}
                      className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Emergency Contact</span>
                    </button>
                  </div>

                  <div className="mt-8">
                    <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                      Save Emergency Contacts
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AlertComponent />
    </div>
  );
};

export default AccountSettings;