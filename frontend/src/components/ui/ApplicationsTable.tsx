
import React from 'react';
import { Application } from '@/hooks/useJobs';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsTableProps {
  applications: Application[];
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ applications }) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Freelancer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{application.freelancerName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-gray-500">{application.freelancerEmail}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-500 line-clamp-2">{application.message}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-gray-500">
                  {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsTable;
