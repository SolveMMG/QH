
import React from 'react';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    return <Navigate to={user.role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard'} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
