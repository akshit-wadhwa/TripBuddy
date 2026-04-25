import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  Car,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  AlertCircle,
  User,
  Settings
} from "lucide-react";
import Header from "../components/Navbar";
import Footer from "../components/Footer";
import { useSimpleAlert } from "../components/SimpleAlert";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PublishRide = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, AlertComponent } = useSimpleAlert();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    from: "",
    fromCoords: null,
    to: "",
    toCoords: null,
    date: "",
    time: "",
    availableSeats: "",
    price: "",
    driverName: "",
    phone: "",
    email: "",
    carModel: "",
    carColor: "",
    licensePlate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });

  // Check profile completion and vehicles on component mount
  useEffect(() => {
    checkProfileAndVehicles();
  }, []);

  const checkProfileAndVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showError('Authentication Required', 'Please login to publish rides');
        navigate('/signin');
        return;
      }

      // Fetch user profile
      const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.user);
      }

      // Fetch user vehicles
      const vehiclesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/vehicles`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setUserVehicles(vehiclesData.vehicles || []);
      }
    } catch (error) {
      console.error('Error checking profile and vehicles:', error);
      showError('Error', 'Unable to verify profile. Please try again.');
    } finally {
      setProfileCheckLoading(false);
    }
  };

  const isProfileComplete = () => {
    if (!userProfile) return false;
    
    const requiredFields = ['name', 'email', 'phone'];
    return requiredFields.every(field => userProfile[field] && userProfile[field].trim() !== '');
  };

  const hasVehicles = () => {
    return userVehicles && userVehicles.length > 0;
  };

  const validateUserEligibility = () => {
    if (!isProfileComplete()) {
      showWarning(
        'Incomplete Profile', 
        'Please complete your profile with name, email, and phone number before publishing rides.',
        {
          actions: [
            {
              label: 'Complete Profile',
              variant: 'primary',
              onClick: () => navigate('/settings')
            }
          ]
        }
      );
      return false;
    }

    if (!hasVehicles()) {
      showWarning(
        'No Vehicle Added', 
        'Please add at least one vehicle to your profile before publishing rides.',
        {
          actions: [
            {
              label: 'Add Vehicle',
              variant: 'primary', 
              onClick: () => navigate('/settings?tab=vehicles')
            }
          ]
        }
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (rideId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const ride = data.ride;
            console.log(ride);
            
            setFormData({
              from: ride.ride.from || "",
              to: ride.ride.to || "",
              date: ride.ride.date ? ride.ride.date.split("T")[0] : "",
              time: ride.ride.time || "",
              availableSeats: ride.ride.availableSeats || "",
              price: ride.ride.price || "",
              distance: ride.ride.distance || "",
              duration: ride.duration || "",
              driverName: ride.ride.driver && ride.ride.driver.name ? ride.ride.driver.name : "",
              phone: ride.ride.driver && ride.ride.driver.phone ? ride.ride.driver.phone : "",
              email: ride.ride.driver && ride.ride.driver.email ? ride.ride.driver.email : "",
              carModel: ride.ride.car && ride.ride.car.model ? ride.ride.car.model : "",
              carColor: ride.ride.car && ride.ride.car.color ? ride.ride.car.color : "",
              licensePlate: ride.ride.car && ride.ride.car.licensePlate ? ride.ride.car.licensePlate : "",
              notes: ride.ride.notes || ""
            });

          }
        })
        .catch((err) => console.error("Error fetching ride:", err));
    }
  }, [rideId]);

  const fetchPredictions = async (input, type) => {
    if (!input) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input,
            sessionToken: crypto.randomUUID(),
          }),
        }
      );
      const data = await response.json();
      if (data?.suggestions) {
        setSuggestions((prev) => ({ ...prev, [type]: data.suggestions }));
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const fetchPlaceDetails = async (placeId, type) => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_API_KEY}&fields=location,formattedAddress`
      );
      const data = await response.json();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          [type]: data.formattedAddress || "",
          [`${type}Coords`]: data.location
            ? {
                lat: data.location.latitude,
                lng: data.location.longitude,
              }
            : null,
        }));
      }
    } catch (err) {
      console.error("Place details error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "from" || name === "to") {
      fetchPredictions(value, name);
    }
  };

  const handleSelect = (s, type) => {
    const description = s.placePrediction?.text?.text;
    const placeId = s.placePrediction?.placeId;

    setFormData({ ...formData, [type]: description });
    setSuggestions((prev) => ({ ...prev, [type]: [] }));

    if (placeId) {
      fetchPlaceDetails(placeId, type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUserEligibility()) {
      return;
    }
    
    setLoading(true);

    if (
      !formData.from ||
      !formData.to ||
      !formData.date ||
      !formData.time ||
      !formData.availableSeats ||
      !formData.price ||
      !formData.driverName ||
      !formData.phone
    ) {
      showWarning("Missing Fields", "Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const rideData = {
        from: formData.from,
        fromCoords: formData.fromCoords,
        to: formData.to,
        toCoords: formData.toCoords,
        date: dateTime.toISOString(),
        time: formData.time,
        availableSeats: parseInt(formData.availableSeats),
        price: parseInt(formData.price),
        driver: {
          name: formData.driverName,
          rating: 5,
          phone: formData.phone,
          email: formData.email || undefined,
        },
        car: {
          model: formData.carModel || undefined,
          color: formData.carColor || undefined,
          licensePlate: formData.licensePlate || undefined,
        },
        notes: formData.notes || undefined,
      };

      const token = localStorage.getItem("token");
 
      const url = rideId
        ? `${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/rides/addRide`;
      const method = rideId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(rideData),
      });

      const result = await response.json();
      if (result.success) {
        if (rideId) {
          showSuccess("Ride Updated!", "Your ride has been updated successfully");
        } else {
          showSuccess("Ride Published!", "Your ride is now live and available for booking");
        }
        
        if (!rideId) {
          setFormData({
            from: "",
            fromCoords: null,
            to: "",
            toCoords: null,
            date: "",
            time: "",
            availableSeats: "",
            price: "",
            driverName: "",
            phone: "",
            email: "",
            carModel: "",
            carColor: "",
            licensePlate: "",
            notes: "",
          });
        }
      } else {
        showError("Error", result.message || "Failed to save ride");
      }
    } catch (error) {
      console.error("Error publishing ride:", error);
      showError("Network Error", "Please check your connection and try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 justify-center">
            <Car className="h-6 w-6 text-blue-600" />
            <span className="text-cyan-900">
              {rideId ? "Edit Your Ride" : "Publish Your Ride"}
            </span>
          </h2>

          {/* Profile & Vehicle Status */}
          {!profileCheckLoading && (
            <div className="mb-6 space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                isProfileComplete() 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <User className="h-5 w-5" />
                <span className="font-medium">
                  {isProfileComplete() ? '✓ Profile Complete' : '⚠ Profile Incomplete'}
                </span>
                {!isProfileComplete() && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Complete Profile
                  </button>
                )}
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                hasVehicles() 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <Car className="h-5 w-5" />
                <span className="font-medium">
                  {hasVehicles() ? `✓ ${userVehicles.length} Vehicle(s) Added` : '⚠ No Vehicles Added'}
                </span>
                {!hasVehicles() && (
                  <button
                    onClick={() => navigate('/settings?tab=vehicles')}
                    className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Add Vehicle
                  </button>
                )}
              </div>

              {(!isProfileComplete() || !hasVehicles()) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Complete your profile and add a vehicle to publish rides
                  </span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From & To with Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> From *
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  placeholder="Starting location"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.from.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow">
                    {suggestions.from.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelect(s, "from")}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {s.placePrediction?.text?.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> To *
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="Destination"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.to.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow">
                    {suggestions.to.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelect(s, "to")}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {s.placePrediction?.text?.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Date & Time */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" /> Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" /> Departure Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" /> Available Seats *
                </label>
                <select
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select seats</option>
                  <option value="1">1 seat</option>
                  <option value="2">2 seats</option>
                  <option value="3">3 seats</option>
                  <option value="4">4 seats</option>
                  <option value="5">5 seats</option>
                  <option value="6">6 seats</option>
                </select>
              </div>
              <div>
                <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" /> Price per Seat *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
 
            <div>
              <h3 className="text-lg font-semibold mb-2">Driver Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            
            <div>
              <h3 className="text-lg font-semibold mb-2">Car Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Car Model
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Camry"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Car Color
                  </label>
                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    placeholder="e.g., White"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="MH 01 AB 1234"
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional info (pickup points, preferences, etc.)"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              ></textarea>
            </div>
 
            <div>
              <button
                type="submit"
                disabled={loading || !isProfileComplete() || !hasVehicles()}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  loading || !isProfileComplete() || !hasVehicles()
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                    : 'bg-cyan-800 text-white hover:bg-cyan-700'
                }`}
              >
                {loading
                  ? rideId
                    ? "Updating Ride..."
                    : "Publishing Ride..."
                  : (!isProfileComplete() || !hasVehicles())
                  ? "Complete Requirements Above"
                  : rideId
                  ? "Update Ride"
                  : "Publish Ride"}
              </button>
              
              {(!isProfileComplete() || !hasVehicles()) && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    Go to Settings
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <AlertComponent />
    </div>
  );
};

export default PublishRide;
