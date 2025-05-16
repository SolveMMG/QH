
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-brand-blue">Quick<span className="text-brand-indigo">Hire</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/jobs" className="text-gray-600 hover:text-brand-blue transition-colors">
            Browse Jobs
          </Link>
          {user ? (
            <>
              <Link 
                to={user.role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard'} 
                className="text-gray-600 hover:text-brand-blue transition-colors"
              >
                Dashboard
              </Link>
              <Button 
                onClick={logout}
                variant="outline" 
                className="border-gray-300"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="outline" className="border-gray-300">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-brand-blue hover:bg-brand-darkBlue">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/jobs" 
              className="text-gray-600 hover:text-brand-blue transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            {user ? (
              <>
                <Link 
                  to={user.role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard'} 
                  className="text-gray-600 hover:text-brand-blue transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  variant="outline" 
                  className="border-gray-300 w-full"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="border-gray-300 w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="bg-brand-blue hover:bg-brand-darkBlue w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
