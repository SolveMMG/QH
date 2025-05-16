
export interface Skill {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: Skill[];
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  employerId: string;
  employerName: string;
  applicationCount?: number;
}

export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  message: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    status: string;
    employerId: string;
    employerName: string;
  };
}

export interface JobsContextType {
  jobs: Job[];
  applications: Application[];
  isLoading: boolean;
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'employerId' | 'employerName' | 'applicationCount'>) => Promise<Job>;
  updateJob: (id: string, jobData: Partial<Job>) => Promise<Job>;
  archiveJob: (id: string) => Promise<void>;
  applyToJob: (jobId: string, message: string) => Promise<void>;
  getJobApplications: (jobId: string) => Application[];
  getUserApplications: () => Application[];
  getUserJobs: () => Job[];
  filterJobs: (skills: string[], search: string, status?: string, page?: number, limit?: number) => Promise<{
    jobs: Job[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>;
  getAvailableSkills: () => Promise<Skill[]>;
  availableSkills: Skill[];
  refreshJobs: () => Promise<void>;
  getJobById: (id: string) => Promise<Job | null>;
}

// Sample skills for reference
export const AVAILABLE_SKILLS: Skill[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'Node.js' },
  { id: '3', name: 'TypeScript' },
  { id: '4', name: 'Python' },
  { id: '5', name: 'UI/UX Design' },
  { id: '6', name: 'JavaScript' },
  { id: '7', name: 'GraphQL' },
  { id: '8', name: 'React Native' },
  { id: '9', name: 'AWS' },
  { id: '10', name: 'Docker' },
];
