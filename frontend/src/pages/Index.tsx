
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-indigo py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Find Remote Work or Hire Freelancers
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            QuickHire connects talented freelancers with employers looking for skills on demand,
            all in one simple platform.
          </p>
          <div className="flex justify-center gap-4 flex-col sm:flex-row">
            <Link to="/jobs">
              <Button className="bg-white text-brand-blue hover:bg-blue-50 text-lg px-8 py-6">
                Find Work
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How QuickHire Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-blue text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up as an employer to post jobs or as a freelancer to find work opportunities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-blue text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {`${`Post or Find Jobs`}`}
              </h3>
              <p className="text-gray-600">
                Employers post job details with required skills. Freelancers browse and filter jobs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-blue text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Apply & Connect</h3>
              <p className="text-gray-600">
                Freelancers apply with custom messages. Employers review applications and connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Skills in Demand</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Browse jobs requiring these popular skills or showcase your expertise in these areas.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              'React', 'Node.js', 'TypeScript', 'Python', 
              'JavaScript', 'UI/UX Design', 'AWS', 'React Native', 
              'GraphQL', 'Docker'
            ].map((skill) => (
              <Link 
                key={skill} 
                to={`/jobs?skill=${skill}`}
                className="bg-white border border-gray-200 rounded-lg py-3 px-4 text-center hover:border-brand-blue hover:shadow-sm transition-all"
              >
                <span className="text-gray-800 font-medium">{skill}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-brand-darkBlue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of freelancers and employers today and start connecting.
          </p>
          <Link to="/register">
            <Button className="bg-white text-brand-darkBlue hover:bg-gray-100 text-lg px-8 py-6">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
