import { Search, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
 
  const fetchPlaces = async (value, setter) => {
    if (!value) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText",
          },
          body: JSON.stringify({
            input: value,
          }),
        }
      );

      const data = await res.json();
      if (data.suggestions) {
        setter(
          data.suggestions.map((s) => ({
            id: s.placePrediction.placeId,
            main: s.placePrediction.structuredFormat.mainText.text,
            secondary: s.placePrediction.structuredFormat.secondaryText?.text,
          }))
        );
      } else {
        setter([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      setter([]);
    }
  };

  const handleFindRides = () => {
 
    if (!from || !to) {
      alert("Please fill in both From and To locations");
      return;
    }

     
    const searchParams = new URLSearchParams({
      from: from,
      to: to,
      ...(date && { date: date }),  
      passengers: "1"  
    });

   
    navigate(`/search-rides?${searchParams.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-100 to-cyan-100 py-20">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Smart Carpooling
                <span className="block bg-gradient-to-r from-cyan-800 to-cyan-700 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Join thousands of travelers who save money, reduce emissions,
                and make new connections through our intelligent matching system.
              </p>
            </div>

           
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* From Input */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="From: City or address"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      fetchPlaces(e.target.value, setFromSuggestions);
                    }}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-800"
                  />
                  {fromSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-60 overflow-y-auto">
                      {fromSuggestions.map((s, idx) => (
                        <li
                          key={s.id || idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                          onClick={() => {
                            setFrom(s.main + (s.secondary ? `, ${s.secondary}` : ""));
                            setFromSuggestions([]);
                          }}
                        >
                          <span className="font-medium">{s.main}</span>
                          {s.secondary && (
                            <span className="block text-xs text-gray-500">
                              {s.secondary}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="To: City or address"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      fetchPlaces(e.target.value, setToSuggestions);
                    }}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {toSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-60 overflow-y-auto">
                      {toSuggestions.map((s, idx) => (
                        <li
                          key={s.id || idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                          onClick={() => {
                            setTo(s.main + (s.secondary ? `, ${s.secondary}` : ""));
                            setToSuggestions([]);
                          }}
                        >
                          <span className="font-medium">{s.main}</span>
                          {s.secondary && (
                            <span className="block text-xs text-gray-500">
                              {s.secondary}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

             
              <button className="w-full mt-4 h-12 bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition" 
              onClick={handleFindRides}>
                <Search className="h-5 w-5" />
                Find Your Ride
              </button>
            </div>

          
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50k+</div>
                <div>Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500k+</div>
                <div>Rides Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div>Average Rating</div>
              </div>
            </div>
          </div>

          
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl"></div>
            <img
              src="/Screenshot_2025-10-07_104340-removebg-preview.png"
              alt="People carpooling together in a modern, safe environment"
              className="relative rounded-2xl ml-5 w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrontPage;
