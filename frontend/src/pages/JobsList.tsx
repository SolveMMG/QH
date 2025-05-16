
import React, { useState, useEffect } from 'react';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import { useJobs, Skill } from '@/hooks/useJobs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const JobsList = () => {
  const { filterJobs, getAvailableSkills, availableSkills, isLoading } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 6;

  useEffect(() => {
    // Load skills on initial render if they're not already loaded
    if (availableSkills.length === 0) {
      getAvailableSkills();
    }
    
    // Load initial jobs
    loadJobs();
  }, []);

  useEffect(() => {
    // Apply filters and search whenever they change
    loadJobs();
  }, [searchTerm, selectedSkills, currentPage]);

  const loadJobs = async () => {
    const result = await filterJobs(
      selectedSkills.map(s => s.id),
      searchTerm,
      'OPEN',
      currentPage,
      jobsPerPage
    );
    
    setJobs(result.jobs);
    setTotalPages(result.pagination.pages);
    setTotalJobs(result.pagination.total);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-gray-600 mb-6">Find remote freelance opportunities that match your skills</p>
          
          <JobFilters
            onSearch={setSearchTerm}
            onSkillsChange={setSelectedSkills}
            selectedSkills={selectedSkills}
          />
          
          <div className="mt-8">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Showing {Math.min(totalJobs, (currentPage - 1) * jobsPerPage + 1)}-
                  {Math.min(totalJobs, currentPage * jobsPerPage)} of {totalJobs} jobs
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                            currentPage === number
                              ? 'text-brand-blue bg-blue-50'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobsList;
