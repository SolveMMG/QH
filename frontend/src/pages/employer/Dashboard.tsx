
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJobs, Job } from '@/hooks/useJobs';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { getUserJobs, applications } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (user) {
      const employerJobs = getUserJobs();
      setJobs(employerJobs);
    }
  }, [user, getUserJobs]);

  // Redirect if not logged in or not an employer
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'employer') {
    return <Navigate to="/freelancer/dashboard" />;
  }

  const getApplicationCount = (jobId: string): number => {
    return applications.filter(a => a.jobId === jobId).length;
  };

  const activeJobs = jobs.filter(job => job.status === 'open');
  const closedJobs = jobs.filter(job => job.status === 'closed');
  const archivedJobs = jobs.filter(job => job.status === 'archived');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Employer Dashboard</h1>
              <p className="text-gray-600">Manage your job postings and applications</p>
            </div>
            <div>
              <Link to="/employer/jobs/new">
                <Button className="bg-brand-blue hover:bg-brand-darkBlue">
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-blue">{activeJobs.length}</p>
                  <p className="text-gray-600">Active Jobs</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-blue">
                    {jobs.reduce((total, job) => total + getApplicationCount(job.id), 0)}
                  </p>
                  <p className="text-gray-600">Total Applications</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-blue">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'N/A'}
                  </p>
                  <p className="text-gray-600">Last Login</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-medium text-gray-700 mb-2">No jobs posted yet</h2>
                <p className="text-gray-600 mb-4">
                  Start by posting your first job to attract freelancers
                </p>
                <Link to="/employer/jobs/new">
                  <Button className="bg-brand-blue hover:bg-brand-darkBlue">
                    Post Your First Job
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Jobs */}
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <CardTitle>Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeJobs.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No active jobs</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-3 font-medium text-gray-600">Job Title</th>
                            <th className="text-center p-3 font-medium text-gray-600">Posted</th>
                            <th className="text-center p-3 font-medium text-gray-600">Applications</th>
                            <th className="text-right p-3 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeJobs.map(job => (
                            <tr key={job.id} className="border-b border-gray-200">
                              <td className="p-3">
                                <Link 
                                  to={`/jobs/${job.id}`}
                                  className="font-medium text-brand-blue hover:underline"
                                >
                                  {job.title}
                                </Link>
                              </td>
                              <td className="p-3 text-center text-gray-600">
                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                              </td>
                              <td className="p-3 text-center">
                                <Badge className="bg-blue-50 text-blue-700">
                                  {getApplicationCount(job.id)}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Link to={`/jobs/${job.id}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                  <Link to={`/employer/jobs/${job.id}/edit`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Closed Jobs */}
              {(closedJobs.length > 0 || archivedJobs.length > 0) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Closed & Archived Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-3 font-medium text-gray-600">Job Title</th>
                            <th className="text-center p-3 font-medium text-gray-600">Status</th>
                            <th className="text-center p-3 font-medium text-gray-600">Applications</th>
                            <th className="text-right p-3 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...closedJobs, ...archivedJobs].map(job => (
                            <tr key={job.id} className="border-b border-gray-200">
                              <td className="p-3">
                                <Link 
                                  to={`/jobs/${job.id}`}
                                  className="font-medium text-gray-700 hover:underline"
                                >
                                  {job.title}
                                </Link>
                              </td>
                              <td className="p-3 text-center">
                                <Badge 
                                  className={job.status === 'closed' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                <Badge className="bg-blue-50 text-blue-700">
                                  {getApplicationCount(job.id)}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Link to={`/jobs/${job.id}`}>
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmployerDashboard;
