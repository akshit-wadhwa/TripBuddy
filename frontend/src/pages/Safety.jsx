import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  Star,
  Phone,
  MapPin,
  Camera,
  Users,
  Lock,
  AlertTriangle,
  Heart,
  ArrowRight,
  Play,
  Award,
  Zap,
  Eye,
  UserCheck,
  ShieldCheck,
  Clock,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Globe,
  Target
} from 'lucide-react';
import Header from '../components/Navbar';

const Safety = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % safetyFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const safetyFeatures = [
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Identity Verification",
      description: "Every user undergoes thorough identity verification with government ID and phone number validation.",
      color: "from-cyan-500 to-cyan-500",
      stats: "99.9% verified users"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Rating System",
      description: "Community-driven ratings help you choose trustworthy co-travelers and drivers.",
      color: "from-yellow-500 to-orange-500",
      stats: "4.8+ average rating"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Live Tracking",
      description: "Real-time GPS tracking allows friends and family to monitor your journey.",
      color: "from-green-500 to-emerald-500",
      stats: "Real-time updates"
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Emergency Support",
      description: "24/7 emergency helpline and instant SOS features for immediate assistance.",
      color: "from-red-500 to-pink-500",
      stats: "24/7 support"
    }
  ];

  const trustFactors = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Background Checks",
      description: "All drivers undergo comprehensive background verification",
      metric: "100%"
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Photo Verification",
      description: "Real-time photo matching ensures rider identity",
      metric: "99.8%"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure Payments",
      description: "End-to-end encrypted payment processing",
      metric: "Bank-grade"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Route Monitoring",
      description: "AI-powered route deviation alerts and monitoring",
      metric: "Real-time"
    }
  ];

  const emergencyFeatures = [
    {
      icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
      title: "SOS Alert",
      description: "One-tap emergency alert to contacts and authorities",
      action: "Instant activation"
    },
    {
      icon: <Users className="h-12 w-12 text-cyan-500" />,
      title: "Trusted Contacts",
      description: "Share your trip details with up to 5 trusted contacts",
      action: "Auto-sharing"
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-green-500" />,
      title: "Anonymous Reporting",
      description: "Report safety concerns without revealing your identity",
      action: "Confidential"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Regular Commuter",
      avatar: "PS",
      rating: 5,
      text: "The safety features gave me confidence to travel alone. The live tracking is a game-changer!",
      location: "Mumbai"
    },
    {
      name: "Rahul Kumar",
      role: "Business Traveler",
      avatar: "RK",
      rating: 5,
      text: "Identity verification and driver ratings helped me find trustworthy rides. Excellent safety measures.",
      location: "Delhi"
    },
    {
      name: "Anjali Patel",
      role: "Student",
      avatar: "AP",
      rating: 5,
      text: "My parents feel secure knowing they can track my journey. The emergency features are reassuring.",
      location: "Bangalore"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50">
      <Header  />
      
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-cyan-600/10" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div 
            id="hero"
            data-animate
            className={`text-center transition-all duration-1000 ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Your Safety, Our Priority</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-900 bg-clip-text text-transparent mb-6 leading-tight">
              Travel with Complete
              <span className="block text-cyan-600">Confidence</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience ridesharing with industry-leading safety features, real-time monitoring, 
              and a community you can trust. Your peace of mind is our commitment.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "2M+", label: "Verified Users" },
                { number: "99.9%", label: "Safety Rate" },
                { number: "24/7", label: "Support" },
                { number: "4.9★", label: "Safety Rating" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            id="features"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 delay-200 ${
              isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Advanced Safety <span className="text-cyan-600">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology and community-driven safety measures working together
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${safetyFeatures[activeFeature].color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {safetyFeatures[activeFeature].icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {safetyFeatures[activeFeature].title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {safetyFeatures[activeFeature].description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                    {safetyFeatures[activeFeature].stats}
                  </span>
                  
                  <button className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium group">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {safetyFeatures.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white shadow-xl border-2 border-cyan-200 scale-105'
                      : 'bg-white/50 hover:bg-white/70 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description.slice(0, 60)}...</p>
                    </div>
                    {activeFeature === index && (
                      <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            id="trust"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 delay-300 ${
              isVisible.trust ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built on <span className="text-cyan-600">Trust</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple layers of security and verification ensure every journey is safe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFactors.map((factor, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {factor.icon}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{factor.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{factor.description}</p>
                  
                  <div className="text-2xl font-bold text-cyan-600">{factor.metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            id="emergency"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 delay-400 ${
              isVisible.emergency ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <AlertTriangle className="h-4 w-4" />
              <span>Emergency Features</span>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Help When You <span className="text-red-600">Need It Most</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Instant access to emergency services and support systems designed for your safety
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {emergencyFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                
                <div className="text-sm font-semibold text-cyan-600 bg-cyan-50 px-4 py-2 rounded-full inline-block">
                  {feature.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-cyan-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            id="testimonials"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 delay-500 ${
              isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by <span className="text-cyan-600">Millions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from our community about safety and peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-gray-400" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Safe Journey Today
          </h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Join millions of travelers who trust our platform for safe, reliable ridesharing experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-cyan-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => navigate('/search')}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-cyan-600 transition-all duration-300 flex items-center space-x-2"
            >
              <Shield className="h-5 w-5" />
              <span>Find Safe Rides</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Safety;