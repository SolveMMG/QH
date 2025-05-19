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

  useEffect(() => {
    if (id && user) {
      const foundJob = jobs.find(j => j.id === id);

      if (foundJob) {
        // Check if user is the employer for this job
        if (foundJob.employerId !== user.id) {
          toast.error('You do not have permission to edit this job');
          navigate('/employer/dashboard');
        } else {
          setJob(foundJob);
        }
      } else {
        toast.error('Job not found');
        navigate('/employer/dashboard');
      }
    }
  }, [id, jobs, user, navigate]);

  // Redirect if not logged in or not an employer
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'employer') {
    return <Navigate to="/" />;
  }

  if (!job) {
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

 const handleSubmit = async (
  data: { title: string; description: string; budget: number; skills: string[] }
) => {

    if (!id) return;

    // ✅ Sanitize skills to ensure they are string IDs
    const sanitizedSkills = data.skills?.map(skill =>
      typeof skill === 'string' ? skill : (skill as any).id
    );

    const sanitizedPayload = {
      ...data,
      status: job.status, // Or 'open' or any logic you want
      skills: data.skills.map(skill =>
        typeof skill === 'string' ? skill : (skill as any).id
      ),
    };


    console.log("Payload being sent:", sanitizedPayload);

    try {
      const updatedJob = await updateJob(id, sanitizedPayload);
      console.log('Updated job:', updatedJob);
      toast.success('Job updated successfully');
      navigate(`/jobs/${id}`);
    } catch (error) {
      // Error is already handled in the updateJob function
    }
  };
  console.log("job.skills:", job.skills);
console.log("typeof job.skills:", typeof job.skills);


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
                  skills: Array.isArray(job.skills)
                    ? job.skills.map((skill) => skill.id)
                    : [], // fallback
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