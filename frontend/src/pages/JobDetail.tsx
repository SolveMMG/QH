
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobs, Job } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/ApplicationForm';
import ApplicationsTable from '@/components/ApplicationsTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, applications, applyToJob, getJobApplications, archiveJob, updateJob } = useJobs();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasApplied, setUserHasApplied] = useState(false);
  const [jobApplications, setJobApplications] = useState<any[]>([]);


  useEffect(() => {
    if (id) {
      const foundJob = jobs.find(j => j.id === id);
      if (foundJob) {
        setJob(foundJob);
      } else {
        // Job not found, redirect to jobs list
        toast.error('Job not found');
        navigate('/jobs');
      }
    }
  }, [id, jobs, navigate]);

  useEffect(() => {
    if (job && user) {
      // Check if user has already applied to this job
      if (user.role === 'freelancer') {
        const applied = applications.some(
          a => a.jobId === job.id && a.freelancerId === user.id
        );
        setUserHasApplied(applied);
      }

      // Get job applications if user is the employer
      if (user.role === 'employer' && user.id === job?.employerId) {
        setJobApplications(getJobApplications(job.id));
      }
    }
  }, [job, user, applications, getJobApplications]);

  const handleApply = async (message: string) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await applyToJob(id, message);
      setUserHasApplied(true);
    } catch (error) {
      console.error('Error applying to job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveJob = async () => {
    if (!job) return;
    
    setIsSubmitting(true);
    try {
      await archiveJob(job.id);
      toast.success('Job archived successfully');
    } catch (error) {
      console.error('Error archiving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJobStatus = async (status: 'open' | 'closed' | 'archived') => {
    if (!job) return;
    
    setIsSubmitting(true);
    try {
      await updateJob(job.id, { status });
      toast.success(`Job ${status === 'open' ? 'opened' : 'closed'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const isEmployer = user && user.role === 'employer' && user.id === job.employerId;
  const isFreelancer = user && user.role === 'freelancer';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <div className="mb-6">
            <Link 
              to="/jobs"
              className="text-brand-blue hover:underline flex items-center"
            >
              ← Back to Jobs
            </Link>
          </div>
          
          {/* Job Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                
                <Badge 
                  className={`${
                    job.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : job.status === 'closed'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
                <div>
                  <span className="font-medium">Posted:</span>{' '}
                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </div>
                <div>
                  <span className="font-medium">By:</span> {job.employerName}
                </div>
                <div>
                  <span className="font-medium">Budget:</span> ${job.budget}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Job Description</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {job.description}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="outline" 
                      className="bg-blue-50 border-blue-200"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {isEmployer && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link to={`/employer/jobs/${job.id}/edit`}>
                    <Button variant="outline" className="border-gray-300">
                      Edit Job
                    </Button>
                  </Link>
                  
                  {job.status === 'open' ? (
                    <Button 
                      onClick={() => handleUpdateJobStatus('closed')}
                      disabled={isSubmitting}
                      variant="outline" 
                      className="border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    >
                      Close Job
                    </Button>
                  ) : job.status === 'closed' ? (
                    <Button 
                      onClick={() => handleUpdateJobStatus('open')}
                      disabled={isSubmitting}
                      variant="outline" 
                      className="border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      Reopen Job
                    </Button>
                  ) : null}
                  
                  {job.status !== 'archived' && (
                    <Button 
                      onClick={handleArchiveJob}
                      disabled={isSubmitting}
                      variant="outline" 
                      className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Archive Job
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Applications Section */}
          <div className="mt-8 grid md:grid-cols-5 gap-8">
            {/* If employer, show applications */}
            {isEmployer ? (
              <div className="md:col-span-5">
                <h2 className="text-xl font-semibold mb-4">Applications ({jobApplications.length})</h2>
                <ApplicationsTable applications={jobApplications} />
              </div>
            ) : (
              <>
                <div className="md:col-span-3 order-2 md:order-1">
                  {job.status === 'open' ? (
                    <>
                      {userHasApplied ? (
                        <Card>
                          <CardContent className="p-6">
                            <div className="text-center">
                              <h2 className="text-xl font-semibold text-green-600 mb-2">Application Submitted</h2>
                              <p className="text-gray-600">
                                You have already applied to this job. The employer will review your application.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <ApplicationForm 
                          jobId={job.id}
                          onSubmit={handleApply}
                          isLoading={isSubmitting}
                        />
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
                            This job is no longer accepting applications
                          </h2>
                          <p className="text-gray-600">
                            {job.status === 'closed' 
                              ? 'The employer has closed this job.'
                              : 'This job has been archived.'
                            }
                          </p>
                          <Link to="/jobs" className="mt-4 inline-block">
                            <Button className="bg-brand-blue hover:bg-brand-darkBlue">
                              Browse Other Jobs
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="md:col-span-2 order-1 md:order-2">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-3">How to Apply</h2>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Review the job description and requirements carefully</li>
                        <li>Make sure your skills match what the employer is looking for</li>
                        <li>Write a brief message explaining why you're a good fit</li>
                        <li>Include relevant experience and expertise</li>
                        <li>Submit your application</li>
                      </ol>
                      
                      {!isFreelancer && !user && (
                        <div className="mt-6">
                          <Link to="/login">
                            <Button className="w-full bg-brand-blue hover:bg-brand-darkBlue">
                              Sign In to Apply
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobDetail;
