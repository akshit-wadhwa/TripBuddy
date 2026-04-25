import { Search, UserCheck, Car, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Works = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Search & Match",
      description:
        "Enter your route and let our AI find the perfect travel companions based on your preferences.",
      step: "01",
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Connect Safely",
      description:
        "Review verified profiles, ratings, and chat with potential riders before confirming your trip.",
      step: "02",
    },
    {
      icon: <Car className="h-8 w-8" />,
      title: "Travel Together",
      description:
        "Enjoy real-time tracking, in-app navigation, and seamless communication during your journey.",
      step: "03",
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Rate & Repeat",
      description:
        "Complete your trip, rate your experience, and build your reputation in the whole community.",
      step: "04",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 font-sans bg-gray-50">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            How It Works?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Follow these four easy steps to begin
            your smart carpooling journey.
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gray-200 z-0" />
              )}

        
              <div className="relative z-10 text-center border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-8">
              
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-800 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold shadow">
                    {step.step}
                  </div>
                </div>
 
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
 
                <p className="text-gray-600 mt-2">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Works;
