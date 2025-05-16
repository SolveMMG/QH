
import React, { createContext } from 'react';
import { JobsContextType } from '../types/jobs';

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export default JobsContext;
