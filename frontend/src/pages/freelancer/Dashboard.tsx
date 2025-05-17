import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJobs, Application } from '@/hooks/useJobs';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const { getUserApplications, jobs } = useJobs();
  const [applications, setApplications] = useState<Application[]>([]);
  console.log

  useEffect(() => {
    const fetchApplications = async () => {
      if (user) {
        try {
          const freelancerApplications = await getUserApplications();
          setApplications(freelancerApplications);
          console.log("Applications:", freelancerApplications);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
        }
      }
    };

    fetchApplications();
  }, [user, getUserApplications]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'freelancer') {
    return <Navigate to="/employer/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
              <p className="text-gray-600">Track your job applications</p>
            </div>
            <div>
              <Link to="/jobs">
                <Button className="bg-brand-blue hover:bg-brand-darkBlue">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-blue">{applications.length}</p>
                  <p className="text-gray-600">Total Applications</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-blue">
                    {applications.filter(app => app.job?.status?.toLowerCase() === 'open').length}
                  </p>
                  <p className="text-gray-600">Active Applications</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start applying to jobs to build your freelance career
                  </p>
                  <Link to="/jobs">
                    <Button className="bg-brand-blue hover:bg-brand-darkBlue">
                      Browse Available Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-600">Job</th>
                        <th className="text-center p-3 font-medium text-gray-600">Status</th>
                        <th className="text-center p-3 font-medium text-gray-600">Applied</th>
                        <th className="text-right p-3 font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(application => {
                        const job = application.job;
                        return (
                          <tr key={application.id} className="border-b border-gray-200">
                            <td className="p-3">
                              <Link
                                to={`/jobs/${job?.id ?? application.jobId}`}
                                className="font-medium text-brand-blue hover:underline"
                              >
                                {job?.title || 'Unknown Job'}
                              </Link>
                            </td>
                            <td className="p-3 text-center">
                              {job && (
                                <Badge
                                  className={
                                    job.status?.toLowerCase() === 'open'
                                      ? 'bg-green-100 text-green-800'
                                      : job.status?.toLowerCase() === 'closed'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-center text-gray-600">
                              {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                            </td>
                            <td className="p-3 text-right">
                              <Link to={`/jobs/${job?.id ?? application.jobId}`}>
                                <Button variant="outline" size="sm">View Job</Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
