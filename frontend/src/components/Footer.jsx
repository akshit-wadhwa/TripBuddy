import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t max-w-screen-2xl px-4 mx-auto flex justify-center">
      <div className="container max-w-screen-xl py-16 justify-center flex-col ml-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-800 to-cyan-700 bg-clip-text text-transparent">
                TripBuddy
              </h3>
              <span className="text-sm text-gray-500">carpool</span>
            </div>
            <p className="text-gray-800">
              Smart carpooling that connects people, saves money, and protects
              our planet.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-500 hover:text-cyan-800 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-500 hover:text-cyan-800 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-500 hover:text-cyan-800 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-500 hover:text-cyan-800 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-800">
              <li><a href="#" className="hover:text-cyan-800 transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">For Drivers</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">For Passengers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-800">
              <li><a href="#" className="hover:text-cyan-800 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Partnerships</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-800">
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-800 transition-colors">Privacy Policy</a></li>
            </ul>
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-800">
                <Mail className="h-4 w-4" />
                <span>support@TripBuddy-carpool.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-800">
                <Phone className="h-4 w-4" />
                <span>+91 628020 6931</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 TripBuddy Carpool. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
