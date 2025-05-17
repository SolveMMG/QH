import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { useJobs } from '@/hooks/useJobs';
import { AVAILABLE_SKILLS } from '@/types/jobs';

const JobsList = () => {
  const { filterJobs, isLoading } = useJobs();

  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(6);

  useEffect(() => {
    const fetchJobs = async () => {
      const result = await filterJobs([], '', 'OPEN', 1, 100);
      setAllJobs(result.jobs || []);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let jobs = [...allJobs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term)
      );
    }

    // Skill filter
    if (selectedSkillIds.length > 0) {
      jobs = jobs.filter((job) =>
        selectedSkillIds.every((skillName) =>
          job.skills?.some((skill) => skill.name === skillName)
        )
      );
    }

    setFilteredJobs(jobs);
    setCurrentPage(1);
  }, [searchTerm, selectedSkillIds, allJobs]);

  const toggleSkill = (skillName: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName]
    );
  };

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const paginate = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-gray-600 mb-6">
            Find remote freelance opportunities that match your skills
          </p>

          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Skill Filters */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Filter by Skills</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const selected = selectedSkillIds.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors duration-200 ease-in-out ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job List */}
          <div className="mt-8">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Showing {(currentPage - 1) * jobsPerPage + 1}–
                  {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-4 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                            currentPage === page
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
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
