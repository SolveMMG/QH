
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ApplicationFormProps {
  jobId: string;
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ jobId, onSubmit, isLoading }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please include a message to the employer');
      return;
    }
    
    setError('');
    await onSubmit(message);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Apply for this Job</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You need to be signed in as a freelancer to apply for jobs.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/login" className="w-full">
            <Button className="w-full bg-brand-blue hover:bg-brand-darkBlue">
              Sign In to Apply
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (user.role !== 'freelancer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Apply for this Job</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Only freelancer accounts can apply for jobs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Apply for this Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block font-medium mb-1">
              Message to Employer
            </label>
            <Textarea
              id="message"
              placeholder="Briefly explain why you're a good fit for this job..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`min-h-[120px] ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-blue hover:bg-brand-darkBlue"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;
