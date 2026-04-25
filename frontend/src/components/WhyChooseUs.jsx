import { Shield, MessageCircle, MapPin, Zap, Users, Clock, Star, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Zap className="h-7 w-7 text-cyan-800" />,
      title: "Instant Matching",
      description: "AI-powered algorithm matches you with compatible riders in seconds, not minutes.",
    },
    {
      icon: <Shield className="h-7 w-7 text-cyan-800" />,
      title: "Enhanced Safety",
      description: "Verified profiles, real-time tracking, emergency contacts, and 24/7 support.",
    },
    {
      icon: <MessageCircle className="h-7 w-7 text-cyan-800" />,
      title: "Smart Communication",
      description: "In-app messaging with translation, voice messages, and automated updates.",
    },
    {
      icon: <MapPin className="h-7 w-7 text-cyan-800" />,
      title: "Flexible Routes",
      description: "Dynamic route optimization and multiple pickup points for maximum convenience.",
    },
    {
      icon: <CreditCard className="h-7 w-7 text-cyan-800" />,
      title: "Transparent Pricing",
      description: "Fair pricing with no hidden fees. Split costs automatically with built-in payment.",
    },
    {
      icon: <Users className="h-7 w-7 text-cyan-800" />,
      title: "Community Driven",
      description: "Build your reputation with reviews and connect with regular travel companions.",
    },
    {
      icon: <Clock className="h-7 w-7 text-cyan-800" />,
      title: "Flexible Timing",
      description: "Book in advance or find last-minute rides with our flexible scheduling system.",
    },
    {
      icon: <Star className="h-7 w-7 text-cyan-800" />,
      title: "Premium Experience",
      description: "Choice of vehicle types, preferred driver matching, and priority booking.",
    },
  ];

  return (
    <section id="why-choose-us" className="py-20 bg-gray-50 font-sans">
      <div className="container max-w-screen-xl mx-auto px-4">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose <span className="text-cyan-800">TripBuddy?</span>
          </h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            We've built the features that existing platforms are missing, creating the most comprehensive carpooling experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
