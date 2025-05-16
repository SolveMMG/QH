
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">QuickHire</h3>
            <p className="text-gray-600 mb-4">
              Connecting talented freelancers with great employers around the world.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-brand-blue transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brand-blue transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} QuickHire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
