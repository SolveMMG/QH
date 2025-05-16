
import { useContext } from 'react';
import JobsContext from '@/context/JobsContext';
import { Job, Application, Skill, JobsContextType, AVAILABLE_SKILLS } from '@/types/jobs';

// Re-export values
export { AVAILABLE_SKILLS };
// Re-export types with explicit 'export type' syntax
export type { Job, Application, Skill, JobsContextType };

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

export { default as JobsProvider } from '@/providers/JobsProvider';
