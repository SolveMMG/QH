
import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '@/hooks/useJobs';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="py-4 flex-1">
        <div className="flex justify-between items-start">
          <Link to={`/jobs/${job.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-brand-blue">{job.title}</h3>
          </Link>
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
        
        <div className="text-sm text-gray-500 mt-1">
          Posted by {job.employerName} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>
        
        <div className="mt-4 text-gray-700 line-clamp-3">
          {job.description}
        </div>
        
        <div className="mt-4">
          <p className="text-brand-darkBlue font-medium">${job.budget}</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill.id} variant="outline" className="bg-blue-50 border-blue-200">
              {skill.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex justify-end">
        <Link 
          to={`/jobs/${job.id}`}
          className="text-sm text-brand-blue hover:text-brand-darkBlue font-medium hover:underline"
        >
          View Details →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
