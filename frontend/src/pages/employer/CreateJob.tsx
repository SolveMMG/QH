
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import JobForm from '@/components/JobForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob, isLoading, getAvailableSkills } = useJobs();
  const { user } = useAuth();

  useEffect(() => {
    // Ensure skills are loaded
    getAvailableSkills();
  }, [getAvailableSkills]);

  // Redirect if not logged in or not an employer
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'employer') {
    return <Navigate to="/" />;
  }
  

 const handleSubmit = async (jobData) => {
  try {
    // Sanitize skills before sending to API
    const sanitizedSkills = jobData.skills?.map(skill =>
      typeof skill === 'string' ? skill : (skill as any).id
    );

    const sanitizedPayload = {
      ...jobData,
      skills: sanitizedSkills,
    };

    const job = await createJob(sanitizedPayload);
    toast.success('Job created successfully!');
    navigate(`/jobs/${job.id}`);
  } catch (error) {
    toast.error('Failed to create job. Please try again.');
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <JobForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateJob;