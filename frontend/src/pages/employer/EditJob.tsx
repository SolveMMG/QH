import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useJobs, Job } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import JobForm from '@/components/JobForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, updateJob, isLoading } = useJobs();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) {
          setFetchError('Job ID is missing in URL');
          return;
        }

        if (!user) {
          setFetchError('User not authenticated');
          return;
        }

        const foundJob = jobs.find(j => j.id === id);

        if (!foundJob) {
          toast.error('Job not found');
          setFetchError('Job not found');
          return navigate('/employer/dashboard');
        }

        if (foundJob.employerId !== user.id) {
          toast.error('You do not have permission to edit this job');
          setFetchError('Permission denied');
          return navigate('/employer/dashboard');
        }

        setJob(foundJob);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching job:', error);
        setFetchError('An unexpected error occurred');
      } finally {
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [id, jobs, user, navigate]);

  const handleSubmit = async (data: Omit<Job, 'id' | 'createdAt' | 'employerId' | 'employerName'>) => {
    if (!id) {
      toast.error('Job ID missing');
      return;
    }

    try {
      const rawSkills = data.skills;
      console.log("Raw incoming data.skills:", rawSkills);
      console.log("Type of skills:", typeof rawSkills);

      const sanitizedSkills = Array.isArray(rawSkills)
        ? rawSkills.map(skill => {
            if (typeof skill === 'string') return skill;
            if (skill && typeof skill === 'object' && 'id' in skill) return (skill as any).id;
            console.warn('Invalid skill detected:', skill);
            return null;
          }).filter(Boolean)
        : [];

      const sanitizedPayload = {
        ...data,
        skills: sanitizedSkills,
      };

      console.log("Sanitized payload to updateJob:", sanitizedPayload);

      const updated = await updateJob(id, sanitizedPayload);
      toast.success('Job updated successfully');
      navigate(`/jobs/${id}`);
    } catch (err) {
      console.error('Error updating job:', err);
      toast.error('Failed to update job. Please try again.');
    }
  };

  // User is not logged in
  if (!user) {
    toast.error('Please log in to continue');
    return <Navigate to="/login" />;
  }

  // User is not employer
  if (user.role !== 'employer') {
    toast.error('Only employers can edit jobs');
    return <Navigate to="/" />;
  }

  // Still fetching or error
  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading job...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-600 font-semibold">
          <p>{fetchError || 'Failed to load job'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Normalize initialData.skills before sending to JobForm
  const normalizedSkills = Array.isArray(job.skills)
    ? job.skills.map(skill =>
        typeof skill === 'string' ? skill : skill?.id
      ).filter(Boolean)
    : [];

  console.log("Normalized initialData.skills:", normalizedSkills);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Edit Job</h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <JobForm
              initialData={{
                title: job.title,
                description: job.description,
                budget: job.budget,
                skills: normalizedSkills,
              }}
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

export default EditJob;
