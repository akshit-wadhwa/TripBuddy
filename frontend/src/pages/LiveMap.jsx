import React, { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, InfoWindow, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Navigation, MapPin, Clock, Phone, MessageCircle, Car, X, ArrowLeft, Route, Users, Timer } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import Header from "../components/Navbar";

const GOOGLE_MAPS_LIBRARIES = ["geometry", "places", "marker"];
const MAP_STYLES = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e8e8e8" }]
  }
];

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy"
};

let socket = null;

const initSocket = () => {
  if (!socket || socket.disconnected) {
    console.log('🔌 Initializing Socket.IO connection...');
    
    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('🌐 Connecting to:', socketUrl);
    
    socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'], 
      withCredentials: true,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      autoConnect: true,
      upgrade: true
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected successfully!');
      console.log('Socket ID:', socket.id);
      console.log('Transport:', socket.io.engine.transport.name);
      
      socket.io.engine.on('upgrade', () => {
        console.log('Upgraded to:', socket.io.engine.transport.name);
      });
    });

    socket.on('connection_confirmed', (data) => {
      console.log('Connection confirmed by server:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      console.log('Will attempt to reconnect...');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    socket.emit('test-message', { message: 'Hello from frontend!' });
    
    socket.on('test-response', (data) => {
      console.log('Test response received:', data);
    });
  }
  return socket;
};

const LiveMap = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  const mounted = useRef(true);
  const watchIdRef = useRef(null);
  const mockIntervalRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [otherUserLocation, setOtherUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [directions, setDirections] = useState(null);
  const [rideRoute, setRideRoute] = useState(null);
  const [carRotation, setCarRotation] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [isUsingMockLocation, setIsUsingMockLocation] = useState(false);
  
  const currentUserMarkerRef = useRef(null);
  const otherUserMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  
  const [rideRouteInfo, setRideRouteInfo] = useState({
    distance: null,
    duration: null,
    estimatedCost: null
  });
  const [showRideDetails, setShowRideDetails] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: "weekly"
  });

  useEffect(() => {
    const socketInstance = initSocket();
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeComponent = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        let user;
        if (userData) {
          user = JSON.parse(userData);
        } else {
          user = { 
            _id: "guest-user",
            name: "Guest User",
            email: ""
          };
        }
        
        if (!isMounted) return;
        setCurrentUser(user);

        if (rideId) {
          console.log("Fetching ride details for:", rideId);
          
          try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rides/${rideId}`, {
              headers: { Authorization: `${token}` }
            });
            
            if (!isMounted) return;
            
            const rideData = response.data.ride?.ride || response.data.ride || response.data;
            setRideDetails(rideData);

            const isDriver = rideData.driver?.userId?._id === user._id || 
                           rideData.driver?._id === user._id || 
                           rideData.driverId === user._id;
            const role = isDriver ? 'driver' : 'passenger';
            setUserRole(role);
            
            console.log("🔍 Driver check:", { 
              driverUserId: rideData.driver?.userId?._id,
              driverId: rideData.driver?._id,
              currentUserId: user._id,
              isDriver,
              role 
            });
            
            if (isDriver) {
              setOtherUserInfo({
                _id: rideData.passenger?.userId?._id || rideData.passenger?._id || rideData.passengerId,
                name: rideData.passenger?.name || rideData.passenger?.userId?.name || "Passenger",
                role: "Passenger",
                phone: rideData.passenger?.phone || rideData.passenger?.userId?.phone
              });
            } else {
              setOtherUserInfo({
                _id: rideData.driver?.userId?._id || rideData.driver?._id || rideData.driverId,
                name: rideData.driver?.name || rideData.driver?.userId?.name || "Driver",
                role: "Driver",
                phone: rideData.driver?.phone || rideData.driver?.userId?.phone || "+91 87654 32109",
                rating: rideData.driver?.rating || 5,
                email: rideData.driver?.email || rideData.driver?.userId?.email,
                car: {
                  model: rideData.car?.model || "Unknown Car",
                  color: rideData.car?.color || "Unknown",
                  plateNumber: rideData.car?.licensePlate || "Unknown"
                }
              });
            }
            
            console.log("Ride data loaded:", { role, rideData });
            
          } catch (error) {
            console.error("Error fetching ride details:", error);
            
            if (!isMounted) return;
            
            setRideDetails({
              _id: rideId,
              from: "Firozpur, Punjab, India",
              to: "Chandigarh, India",
              fromCoords: { lat: 30.9293, lng: 74.6057 },
              toCoords: { lat: 30.7333, lng: 76.7794 },
              price: 550,
              availableSeats: 3,
              time: "12:05",
              date: "2025-10-10T06:35:00.000Z",
              status: "active",
              driver: { 
                userId: { _id: "670390e0b2e5c024b4e2b5a3" },
                name: "Music Man",
                phone: "+91 87654 32109",
                rating: 5,
                email: "musicstylzman111@gmail.com"
              },
              car: {
                model: "Toyota",
                color: "Grey",
                licensePlate: "PB 01 AF 1027"
              }
            });
            
            setUserRole('passenger');
            setOtherUserInfo({
              _id: "670390e0b2e5c024b4e2b5a3",
              name: "Music Man",
              role: "Driver",
              phone: "+91 87654 32109",
              rating: 5,
              email: "musicstylzman111@gmail.com",
              car: {
                model: "Toyota",
                color: "Grey",
                plateNumber: "PB 01 AF 1027"
              }
            });
          }
        }
        
      } catch (error) {
        console.error("Error initializing component:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeComponent();
    
    return () => {
      isMounted = false;
    };
  }, [rideId]); 

  const calculateCarRotation = useCallback((prevLocation, newLocation) => {
    if (!prevLocation || !newLocation) return 0;
    
    if (!window.google?.maps?.geometry?.spherical) {
      const deltaLat = newLocation.lat - prevLocation.lat;
      const deltaLng = newLocation.lng - prevLocation.lng;
      return Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
    }
    
    try {
      return window.google.maps.geometry.spherical.computeHeading(
        new window.google.maps.LatLng(prevLocation.lat, prevLocation.lng),
        new window.google.maps.LatLng(newLocation.lat, newLocation.lng)
      );
    } catch (error) {
      console.warn("Error calculating heading:", error);
      return 0;
    }
  }, []);

  const createAdvancedMarker = useCallback((position, type = 'user', options = {}) => {
    if (!map || !window.google?.maps) return null;

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: rotate(${options.rotation || 0}deg);
      transition: transform 0.3s ease-out;
      z-index: ${options.zIndex || 100};
    `;

    switch (type) {
      case 'driver':
        markerElement.style.width = '48px';
        markerElement.style.height = '48px';
        markerElement.innerHTML = `
          <div style="
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%);
            border-radius: 50% 50% 50% 20%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
            border: 3px solid white;
            position: relative;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.6-1.6h-1.9c-.7 0-1.3-.6-1.3-1.3 0-.4-.2-.8-.4-1.1L15.8 7H8.2l-1 2.4c-.2.4-.4.7-.4 1.1 0 .7-.6 1.3-1.3 1.3H3.6C2.7 11.8 2 12.5 2 13.4v2.8c0 .4.4.8.9.8H5c0 1.6 1.3 3 2.9 3s3-1.4 3-3h2.2c0 1.6 1.3 3 2.9 3s3-1.4 3-3z"/>
            </svg>
          </div>
        `;
        break;

      case 'passenger':
        markerElement.style.width = '40px';
        markerElement.style.height = '40px';
        markerElement.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #4285F4 0%, #5A9BFF 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(66, 133, 244, 0.4);
            border: 3px solid white;
            font-weight: bold;
            color: white;
            font-size: 18px;
          ">
            ${options.initial || 'P'}
          </div>
        `;
        break;

      case 'start':
        markerElement.style.width = '36px';
        markerElement.style.height = '44px';
        markerElement.innerHTML = `
          <div style="
            width: 36px;
            height: 44px;
            background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">S</div>
          </div>
        `;
        break;

      case 'end':
        markerElement.style.width = '36px';
        markerElement.style.height = '44px';
        markerElement.innerHTML = `
          <div style="
            width: 36px;
            height: 44px;
            background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">E</div>
          </div>
        `;
        break;

      default:
        markerElement.style.width = '32px';
        markerElement.style.height = '32px';
        markerElement.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background: #34D399;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(52, 211, 153, 0.3);
          "></div>
        `;
    }

    if (window.google.maps.marker?.AdvancedMarkerElement) {
      try {
        return new window.google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: map,
          content: markerElement,
          title: options.title || "Location",
          zIndex: options.zIndex || 100
        });
      } catch (error) {
        console.warn("AdvancedMarkerElement failed, using fallback:", error);
      }
    }

    return new window.google.maps.Marker({
      position: position,
      map: map,
      title: options.title || "Location",
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${options.color || '#4285F4'}" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="8" fill="white"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      },
      zIndex: options.zIndex || 100
    });
  }, [map]);

  const calculateRideRoute = useCallback(async () => {
    if (!rideDetails || !window.google?.maps || !map) return;

    console.log("🗺️ Calculating full ride route...");

    let startCoords, endCoords;
    
    if (rideDetails.fromCoords && rideDetails.toCoords) {
      startCoords = rideDetails.fromCoords;
      endCoords = rideDetails.toCoords;
      console.log("📍 Using provided coordinates:", { startCoords, endCoords });
    } else if (rideDetails.from && rideDetails.to) {
      const geocoder = new window.google.maps.Geocoder();
      
      try {
        console.log("🔍 Geocoding addresses...", rideDetails.from, "to", rideDetails.to);
        const [fromResult, toResult] = await Promise.all([
          new Promise((resolve, reject) => {
            geocoder.geocode({ address: rideDetails.from }, (results, status) => {
              if (status === 'OK') {
                console.log("From location geocoded:", results[0]);
                resolve(results[0].geometry.location);
              } else {
                reject(new Error(`Geocoding failed for ${rideDetails.from}: ${status}`));
              }
            });
          }),
          new Promise((resolve, reject) => {
            geocoder.geocode({ address: rideDetails.to }, (results, status) => {
              if (status === 'OK') {
                console.log("To location geocoded:", results[0]);
                resolve(results[0].geometry.location);
              } else {
                reject(new Error(`Geocoding failed for ${rideDetails.to}: ${status}`));
              }
            });
          })
        ]);
        
        startCoords = { lat: fromResult.lat(), lng: fromResult.lng() };
        endCoords = { lat: toResult.lat(), lng: toResult.lng() };
      } catch (error) {
        console.error("Geocoding failed:", error);
        return;
      }
    } else {
      console.warn("No coordinates or addresses available", rideDetails);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    console.log("Calculating directions from", startCoords, "to", endCoords);
    
    directionsService.route({
      origin: startCoords,
      destination: endCoords,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidTolls: false,
      avoidHighways: false,
      optimizeWaypoints: true,
      unitSystem: window.google.maps.UnitSystem.METRIC,
    }, (result, status) => {
      if (status === 'OK') {
        console.log("Ride route calculated successfully", result);
        setRideRoute(result);
        
        const route = result.routes[0].legs[0];
        
        setRideRouteInfo({
          distance: route.distance.text,
          duration: route.duration.text,
          estimatedCost: rideDetails.price || 'N/A'
        });
        
        console.log(`🎯 Full route details:`, {
          distance: route.distance.text,
          duration: route.duration.text,
          steps: route.steps.length
        });
        
        if (startMarkerRef.current) {
          if (startMarkerRef.current.setMap) startMarkerRef.current.setMap(null);
          else if (startMarkerRef.current.map) startMarkerRef.current.map = null;
        }
        if (endMarkerRef.current) {
          if (endMarkerRef.current.setMap) endMarkerRef.current.setMap(null);
          else if (endMarkerRef.current.map) endMarkerRef.current.map = null;
        }
        
        const newStartMarker = createAdvancedMarker(startCoords, 'start', {
          title: `Start: ${rideDetails.from}`,
          zIndex: 300
        });
        const newEndMarker = createAdvancedMarker(endCoords, 'end', {
          title: `End: ${rideDetails.to}`,
          zIndex: 300
        });
        
        startMarkerRef.current = newStartMarker;
        endMarkerRef.current = newEndMarker;
        
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(startCoords);
        bounds.extend(endCoords);
        
        map.fitBounds(bounds, { 
          padding: { top: 120, bottom: 200, left: 60, right: 60 }
        });
        
        setTimeout(() => {
          const currentZoom = map.getZoom();
          if (currentZoom > 12) {
            map.setZoom(12);
          }
        }, 1000);
        
      } else {
        console.error("Route calculation failed:", status, result);
      }
    });
  }, [rideDetails, map, createAdvancedMarker]);

  const calculateLiveRoute = useCallback((from, to) => {
    if (!from || !to || !window.google?.maps) return;

    console.log("🔄 Calculating live route between users...");

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin: from,
      destination: to,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidTolls: false,
      avoidHighways: false,
    }, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
        const route = result.routes[0].legs[0];
        setEta(route.duration.text);
        setDistance(route.distance.text);
        
        console.log(`📍 Live route: ${route.distance.text}, ETA: ${route.duration.text}`);
      } else {
        console.error("❌ Live route calculation failed:", status);
      }
    });
  }, []);

  const handleLocationError = useCallback((errorCode) => {
    let fallbackLocation = { lat: 30.7333, lng: 76.7794 }; // Chandigarh
    let errorMessage = "";

    switch (errorCode) {
      case 1:
      case 'PERMISSION_DENIED':
        errorMessage = "Location access denied. Using demo mode.";
        break;
      case 2:
        errorMessage = "Location unavailable. Using default location.";
        break;
      case 3:
        errorMessage = "Location request timeout. Using default location.";
        break;
      default:
        errorMessage = "Location service error. Using demo mode.";
    }

    console.warn(errorMessage);
    setCurrentLocation(fallbackLocation);
    setLocationError(errorMessage);
    setTimeout(() => setLocationError(null), 7000);
  }, []);

  const startMockMovement = useCallback(() => {
    if (!currentUser) return;
    
    console.log("🚗 Starting mock movement...");
    setIsUsingMockLocation(true);

    const startingPoint = currentLocation || { lat: 30.9293, lng: 74.6057 };
    
    const mockRoute = [
      startingPoint,
      { lat: startingPoint.lat + 0.002, lng: startingPoint.lng + 0.003 },
      { lat: startingPoint.lat + 0.005, lng: startingPoint.lng + 0.008 },
      { lat: startingPoint.lat + 0.010, lng: startingPoint.lng + 0.015 },
      { lat: startingPoint.lat + 0.015, lng: startingPoint.lng + 0.025 },
      { lat: startingPoint.lat + 0.020, lng: startingPoint.lng + 0.035 },
    ];

    let currentIndex = 0;
    
    const moveInterval = setInterval(() => {
      if (currentIndex >= mockRoute.length) {
        clearInterval(moveInterval);
        setIsUsingMockLocation(false);
        console.log("🏁 Mock movement completed");
        return;
      }

      const nextLocation = mockRoute[currentIndex];
      const prevLocation = currentIndex > 0 ? mockRoute[currentIndex - 1] : nextLocation;
      
      const rotation = calculateCarRotation(prevLocation, nextLocation);
      setCarRotation(rotation);
      
      const mockCoords = {
        ...nextLocation,
        accuracy: 8,
        speed: 45 + Math.random() * 15,
        timestamp: Date.now()
      };

      setCurrentLocation(mockCoords);
      
      if (socket) {
        socket.emit("location-update", {
          userId: currentUser._id,
          rideId,
          userRole,
          coords: mockCoords,
          rotation: rotation,
          timestamp: Date.now()
        });
      }

      console.log(`🚗 Mock position ${currentIndex + 1}/${mockRoute.length}`, mockCoords);
      currentIndex++;
    }, 3000);

    mockIntervalRef.current = moveInterval;
  }, [currentUser, rideId, userRole, calculateCarRotation, currentLocation]);

  useEffect(() => {
    if (!navigator.geolocation || !currentUser || !userRole || !mounted.current) return;

    let prevLocation = null;

    const options = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    };

    const setupLocationTracking = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'denied') {
            handleLocationError('PERMISSION_DENIED');
            return;
          }
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!mounted.current) return;
            
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
              speed: position.coords.speed || 0,
              heading: position.coords.heading || null
            };

            console.log("Initial location obtained:", coords);
            setCurrentLocation(coords);
            prevLocation = coords;
            setLocationError(null);

            startWatching();
          },
          (error) => {
            console.error("Initial geolocation error:", error);
            handleLocationError(error.code);
          },
          options
        );
      } catch (error) {
        console.error("Permission check failed:", error);
        handleLocationError('UNKNOWN');
      }
    };

    const startWatching = () => {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (!mounted.current) return;
          
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            speed: position.coords.speed || 0,
            heading: position.coords.heading || null
          };

          if (prevLocation && userRole === 'driver') {
            const rotation = calculateCarRotation(prevLocation, coords);
            setCarRotation(rotation);
          }

          setCurrentLocation(coords);
          prevLocation = coords;
          
          if (socket) {
            socket.emit("location-update", {
              userId: currentUser._id,
              rideId,
              userRole,
              coords,
              rotation: carRotation,
              timestamp: coords.timestamp
            });
          }
        },
        (error) => {
          console.error("Watch position error:", error);
        },
        options
      );
    };

    setupLocationTracking();
  }, [currentUser, userRole, handleLocationError, calculateCarRotation, rideId, carRotation]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (currentLocation) {
      if (currentUserMarkerRef.current) {
        if (currentUserMarkerRef.current.position) {
          currentUserMarkerRef.current.position = currentLocation;
        } else if (currentUserMarkerRef.current.setPosition) {
          currentUserMarkerRef.current.setPosition(currentLocation);
        }
        
        if (userRole === 'driver' && currentUserMarkerRef.current.content) {
          const markerDiv = currentUserMarkerRef.current.content;
          if (markerDiv) {
            markerDiv.style.transform = `rotate(${carRotation}deg)`;
          }
        }
      } else {
        const markerType = userRole === 'driver' ? 'driver' : 'passenger';
        const marker = createAdvancedMarker(currentLocation, markerType, {
          title: "Your Location",
          rotation: carRotation,
          initial: currentUser?.name?.charAt(0) || 'Y',
          zIndex: 400
        });
        currentUserMarkerRef.current = marker;
      }
    }

    if (otherUserLocation) {
      if (otherUserMarkerRef.current) {
        if (otherUserMarkerRef.current.position) {
          otherUserMarkerRef.current.position = otherUserLocation;
        } else if (otherUserMarkerRef.current.setPosition) {
          otherUserMarkerRef.current.setPosition(otherUserLocation);
        }
      } else {
        const markerType = userRole === 'driver' ? 'passenger' : 'driver';
        const marker = createAdvancedMarker(otherUserLocation, markerType, {
          title: otherUserInfo?.name || "Other User",
          initial: otherUserInfo?.name?.charAt(0) || 'O',
          zIndex: 350
        });
        otherUserMarkerRef.current = marker;
      }
    }
  }, [currentLocation, otherUserLocation, map, isLoaded, carRotation, createAdvancedMarker, userRole, currentUser, otherUserInfo]);

  useEffect(() => {
    if (map && isLoaded && rideDetails && window.google?.maps) {
      const timer = setTimeout(() => {
        calculateRideRoute();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [map, isLoaded, rideDetails]); 

  useEffect(() => {
    if (currentLocation && otherUserLocation && isLoaded) {
      calculateLiveRoute(currentLocation, otherUserLocation);
    }
  }, [currentLocation, otherUserLocation, isLoaded]); 

  useEffect(() => {
    if (!currentUser || !socket) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId === rideId && data.userId !== currentUser._id) {
        console.log("📍 Received location update:", data);
        setOtherUserLocation(data.coords);
      }
    };

    socket.on("receive-location-update", handleLocationUpdate);

    return () => {
      socket.off("receive-location-update", handleLocationUpdate);
    };
  }, [rideId, currentUser]);

  useEffect(() => {
    if (!currentUser || !rideId || !userRole || !socket) return;

    socket.emit("join-ride-tracking", { rideId, userId: currentUser._id, userRole });
    
    return () => {
      socket.emit("leave-ride-tracking", { rideId, userId: currentUser._id });
    };
  }, [rideId, currentUser, userRole]);

  const onLoad = useCallback((mapInstance) => {
    console.log("🗺️ Map loaded successfully");
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    mounted.current = true;
    
    return () => {
      mounted.current = false;
    
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
   
      [currentUserMarkerRef, otherUserMarkerRef, startMarkerRef, endMarkerRef].forEach(markerRef => {
        if (markerRef.current) {
          if (markerRef.current.setMap) markerRef.current.setMap(null);
          else if (markerRef.current.map) markerRef.current.map = null;
        }
      });
    };
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Map Loading Error</h2>
          <p>Please check your Google Maps API key and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading ride tracking...</p>
          <p className="text-gray-400 text-sm mt-2">Ride ID: {rideId}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Header />
      {locationError && (
        <div className="absolute top-20 left-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-30 mx-auto max-w-md">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {!currentLocation && !locationError && !loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center">
            <MapPin className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enable Location Access</h3>
            <p className="text-gray-600 mb-6">
              To track your ride and provide real-time updates, please enable location access.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Enable Location Access
              </button>
              
              <button
                onClick={startMockMovement}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Use Demo Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {showRideDetails && rideDetails && (
        <div className="absolute top-20 left-4 bg-white rounded-2xl shadow-2xl z-30 p-6 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ride Details</h3>
            <button 
              onClick={() => setShowRideDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">From</span>
              </div>
              <p className="text-gray-900 ml-5">{rideDetails.from}</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">To</span>
              </div>
              <p className="text-gray-900 ml-5">{rideDetails.to}</p>
            </div>
            
            {rideRouteInfo.distance && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Route className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-bold text-gray-900">{rideRouteInfo.distance}</p>
                </div>
                <div className="text-center">
                  <Timer className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-bold text-gray-900">{rideRouteInfo.duration}</p>
                </div>
              </div>
            )}
            
            {rideDetails.price && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-green-700">Ride Cost</p>
                <p className="text-xl font-bold text-green-900">₹{rideDetails.price}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={currentLocation || { lat: 30.7333, lng: 76.7794 }}
        zoom={10}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {rideRoute && (
          <DirectionsRenderer
            directions={rideRoute}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: "#000",
                strokeWeight: 10,
                strokeOpacity: 0.8,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: "M 0,-1 0,1",
                      strokeOpacity: 1,
                      strokeWeight: 4,
                      strokeColor: "#000"
                    },
                    offset: "0",
                    repeat: "40px"
                  }
                ]
              }
            }}
          />
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: userRole === 'driver' ? "#FF6B35" : "#4285F4",
                strokeWeight: 8,
                strokeOpacity: 0.9,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: "M 0,-1 0,1",
                      strokeOpacity: 1,
                      strokeWeight: 3,
                      strokeColor: "#FFFFFF"
                    },
                    offset: "0",
                    repeat: "25px"
                  }
                ]
              }
            }}
          />
        )}

        {showInfoWindow && otherUserLocation && (
          <InfoWindow 
            position={otherUserLocation}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">{otherUserInfo?.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{otherUserInfo?.role}</p>
              {distance && (
                <p className="text-sm text-cyan-600 font-medium mb-1">{distance} away</p>
              )}
              {eta && (
                <p className="text-sm text-green-600 font-medium">ETA: {eta}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-20 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="h-6 w-6 text-gray-700" />
      </button>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg z-20 hover:bg-gray-50 transition-colors"
      >
        <X className="h-6 w-6 text-gray-700" />
      </button>

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cyan-900 via-gray-800 to-cyan-900 text-white p-4 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Car className="h-6 w-6" />
            <div>
              <p className="font-bold text-lg">
                {userRole === 'driver' ? 'Driving to Passenger' : 'Driver En Route'}
              </p>
              {rideDetails && (
                <p className="text-sm text-gray-300 truncate max-w-xs">
                  {rideDetails.from} → {rideDetails.to}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isUsingMockLocation && (
                <span className="text-xs bg-orange-500 px-2 py-1 rounded-full font-medium">DEMO</span>
              )}
              {rideRoute && (
                <span className="text-xs bg-purple-500 px-2 py-1 rounded-full font-medium">
                  {rideRouteInfo.distance || 'ROUTE'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {rideRouteInfo.duration && (
              <div className="flex items-center space-x-1 bg-purple-600 px-3 py-1 rounded-full">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-medium">{rideRouteInfo.duration}</span>
              </div>
            )}
            {eta && (
              <div className="flex items-center space-x-1 bg-green-600 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{eta}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 space-y-3">
        <button
          onClick={startMockMovement}
          disabled={isUsingMockLocation}
          className={`p-4 rounded-full shadow-lg transition-colors text-white ${
            isUsingMockLocation 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
          title="Start test movement"
        >
          🚗
        </button>
        
        <button
          onClick={() => setShowRideDetails(!showRideDetails)}
          className="bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
          title="Show ride details"
        >
          📋
        </button>
        
        <button
          onClick={() => calculateRideRoute()}
          className="bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
          title="Show full route"
        >
          🗺️
        </button>
      </div>

      <div className="absolute bottom-6 right-4 space-y-3">
        <button
          onClick={() => {
            if (currentLocation && map) {
              map.panTo(currentLocation);
              map.setZoom(16);
            }
          }}
          className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Center on my location"
        >
          <Navigation className="h-6 w-6 text-gray-700" />
        </button>
        
        {otherUserLocation && (
          <button
            onClick={() => setShowInfoWindow(!showInfoWindow)}
            className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            title="Show other user info"
          >
            <MapPin className="h-6 w-6 text-gray-700" />
          </button>
        )}
      </div>

      {otherUserInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-10">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {otherUserInfo.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">{otherUserInfo.name}</h3>
                  <p className="text-gray-600">{otherUserInfo.role}</p>
                  {otherUserInfo.car && (
                    <p className="text-sm text-gray-500">
                      {otherUserInfo.car.model} • {otherUserInfo.car.plateNumber} • {otherUserInfo.car.color}
                    </p>
                  )}
                  {otherUserInfo.rating && (
                    <p className="text-sm text-yellow-600">★ {otherUserInfo.rating}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {otherUserInfo.phone && (
                  <a
                    href={`tel:${otherUserInfo.phone}`}
                    className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
                  >
                    <Phone className="h-6 w-6" />
                  </a>
                )}
                
                <button
                  onClick={() => navigate(`/ride/${rideId}/chat`)}
                  className="p-4 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors shadow-lg"
                >
                  <MessageCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {distance && (
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{distance}</span>
                </div>
              )}
              {eta && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{eta}</span>
                </div>
              )}
              {rideRouteInfo.distance && (
                <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                  <Route className="h-4 w-4" />
                  <span className="font-medium">{rideRouteInfo.distance}</span>
                </div>
              )}
              {rideDetails?.availableSeats && (
                <div className="flex items-center space-x-2 text-cyan-600 bg-cyan-50 px-3 py-2 rounded-lg">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{rideDetails.availableSeats} seats</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveMap);