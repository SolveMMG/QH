
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import api from '@/services/api';
import JobsContext from '@/context/JobsContext';
import { Job, Application, Skill } from '@/types/jobs';
import { normalizeJob, normalizeJobs, normalizeStatus } from '@/utils/jobUtils';

export const JobsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [skillFetchError, setSkillFetchError] = useState<boolean>(false);


  useEffect(() => {
    // Load skills on initial render
    getAvailableSkills();
    
    // Load jobs
    refreshJobs();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'employer') {
        fetchUserJobs();
      } else if (user.role === 'freelancer') {
        fetchUserApplications();
      }
    }
  }, [user]);

  const fetchUserJobs = async () => {
    if (!user || user.role !== 'employer') return;
    try {
      const response = await api.get('/jobs/employer/dashboard');
      const normalizedJobs = normalizeJobs(response.data.jobs || []);
      setUserJobs(normalizedJobs);
    } catch (error) {
      console.error('Error fetching user jobs:', error);
    }
  };

  const fetchUserApplications = async () => {
    if (!user || user.role !== 'freelancer') return;
    try {
      const response = await api.get('/applications/freelancer/dashboard');
      setUserApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const refreshJobs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/jobs');
      const normalizedJobs = normalizeJobs(response.data.jobs);
      setJobs(normalizedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

const getAvailableSkills = async (): Promise<Skill[]> => {
  try {
    setSkillFetchError(false); // Reset error state
    const { data } = await api.get('/skills');

    if (
      !Array.isArray(data) ||
      !data.every(
        (skill): skill is Skill =>
          skill &&
          typeof skill === 'object' &&
          typeof skill.id === 'string' &&
          typeof skill.name === 'string'
      )
    ) {
      throw new Error('Invalid skills format');
    }

    setAvailableSkills(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    setSkillFetchError(true);
    toast.error('Failed to fetch skills');
    return [];
  }
};


  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return normalizeJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to fetch job details');
      return null;
    }
  };

  
  const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'employerId' | 'employerName' | 'applicationCount'>) => {
    if (!user || user.role !== 'employer') {
      toast.error('Only employers can create jobs');
      throw new Error('Unauthorized');
    }

    setIsLoading(true);
    try {
      const response = await api.post('/jobs', jobData);
      
      const newJob = normalizeJob(response.data.job);
      
      // Update jobs list with new job
      setJobs(prev => [...prev, newJob]);
      setUserJobs(prev => [...prev, newJob]);
      toast.success('Job created successfully');
      
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    if (!user || user.role !== 'employer') {
      toast.error('Only employers can update jobs');
      throw new Error('Unauthorized');
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      
      // Update job in state
      const updatedJob = normalizeJob(response.data.job);
      
      setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      setUserJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      
      toast.success('Job updated successfully');
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveJob = async (id: string) => {
    if (!user || user.role !== 'employer') {
      toast.error('Only employers can archive jobs');
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/jobs/${id}`);
      
      // Update job status in state
      const updatedJobs = jobs.map(job => 
        job.id === id ? { ...job, status: normalizeStatus('archived') } : job
      );
      
      setJobs(updatedJobs);
      setUserJobs(prev => prev.map(job => 
        job.id === id ? { ...job, status: normalizeStatus('archived') } : job
      ));
      
      toast.success('Job archived successfully');
    } catch (error) {
      console.error('Error archiving job:', error);
      toast.error('Failed to archive job');
    } finally {
      setIsLoading(false);
    }
  };

  const applyToJob = async (jobId: string, message: string) => {
    if (!user || user.role !== 'freelancer') {
      toast.error('Only freelancers can apply to jobs');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/applications/jobs/${jobId}`, { message });
      
      // Update applications list
      const newApplication = response.data.application;
      setApplications(prev => [...prev, newApplication]);
      setUserApplications(prev => [...prev, newApplication]);
      
      toast.success('Application submitted successfully');
    } catch (error: any) {
      console.error('Error applying to job:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit application');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const getJobApplications = (jobId: string): Application[] => {
    return applications.filter(app => app.jobId === jobId);
  };

  const getUserApplications = (): Application[] => {
    if (!user || user.role !== 'freelancer') return [];
    return userApplications;
  };

  const getUserJobs = (): Job[] => {
    if (!user || user.role !== 'employer') return [];
    return userJobs;
  };

  const filterJobs = async (skills: string[], search: string, status = 'open', page = 1, limit = 6) => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (skills && skills.length > 0) {
        skills.forEach(skill => params.append('skills', skill));
      }
      
      if (search) {
        params.append('search', search);
      }
      
      if (status) {
        // Convert to uppercase for backend
        params.append('status', status.toUpperCase());
      }
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get(`/jobs?${params.toString()}`);
      
      // Normalize the jobs before returning
      const normalizedJobs = normalizeJobs(response.data.jobs);
      
      return {
        jobs: normalizedJobs,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error filtering jobs:', error);
      toast.error('Failed to fetch jobs');
      return {
        jobs: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 6,
          pages: 0
        }
      };
    } finally {
      setIsLoading(false);
    }
  };
const fetchApplicationsForJob = async (jobId: string): Promise<Application[]> => {
  if (!user || user.role !== 'employer') {
    toast.error('Only employers can fetch applications for a job');
    return [];
  }

  try {
    const response = await api.get(`/applications/jobs/${jobId}`);
    const applications = response.data.applications || [];
    return applications;
  } catch (error) {
    console.error('Error fetching applications for job:', error);
    toast.error('Failed to fetch applications for this job');
    return [];
  }
};



  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        isLoading,
        createJob,
        updateJob,
        archiveJob,
        applyToJob,
        getJobApplications,
        getUserApplications,
        getUserJobs,
        filterJobs,
        getAvailableSkills,
        availableSkills,
        skillFetchError,
        refreshJobs,
        getJobById,
        fetchApplicationsForJob,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export default JobsProvider;