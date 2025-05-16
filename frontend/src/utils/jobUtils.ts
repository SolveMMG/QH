
import { Job } from '../types/jobs';

// Helper function to normalize job status to ensure it's one of the allowed values
export const normalizeStatus = (status: string): 'open' | 'closed' | 'archived' => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'open' || lowerStatus === 'closed' || lowerStatus === 'archived') {
    return lowerStatus as 'open' | 'closed' | 'archived';
  }
  return 'open'; // Default fallback
};

// Helper function to normalize job data
export const normalizeJob = (job: any): Job => {
  return {
    ...job,
    status: normalizeStatus(job.status || 'open')
  };
};

// Helper function to normalize jobs array
export const normalizeJobs = (jobs: any[]): Job[] => {
  return jobs.map(normalizeJob);
};
