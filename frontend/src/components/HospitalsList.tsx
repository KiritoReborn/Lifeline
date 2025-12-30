import { useState, useEffect } from 'react';
import { hospitalApi } from '../api';
import type { HospitalResponseDTO, Page } from '../api';

interface HospitalsListProps {
  onAddHospital?: () => void;
}

export default function HospitalsList({ onAddHospital }: HospitalsListProps) {
  const [hospitals, setHospitals] = useState<Page<HospitalResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hospitalApi.getAllHospitals({
        page: currentPage,
        size: pageSize,
        sortBy: 'name',
        sortDir: 'ASC',
      });
      setHospitals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchHospitals();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await hospitalApi.searchHospitals({
        keyword: searchQuery,
        page: 0,
        size: pageSize,
        sortBy: 'name',
        sortDir: 'ASC',
      });
      setHospitals(data);
      setCurrentPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search hospitals');
      console.error('Error searching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityStatus = (hospital: HospitalResponseDTO) => {
    const totalBeds = hospital.totalNumBeds || 0;
    // For now, we'll simulate availability since we don't have real-time bed data
    // In a real app, you'd fetch this from the bed API
    const availableBeds = Math.floor(totalBeds * 0.3); // Simulated
    
    if (availableBeds === 0) {
      return { status: 'Full', color: 'red', text: `Full (0 Free)` };
    } else if (availableBeds < 5) {
      return { status: 'Critical', color: 'red', text: `Critical (${availableBeds} Free)` };
    } else if (availableBeds < 10) {
      return { status: 'Medium', color: 'orange', text: `Medium (${availableBeds} Free)` };
    } else {
      return { status: 'High', color: 'green', text: `High (${availableBeds} Free)` };
    }
  };

  const formatLocation = (hospital: HospitalResponseDTO) => {
    const parts = [];
    if (hospital.address) parts.push(hospital.address);
    if (hospital.district) parts.push(hospital.district);
    if (hospital.state) parts.push(hospital.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not available';
  };

  const formatContact = (hospital: HospitalResponseDTO) => {
    return hospital.phoneNumber || hospital.emergencyNum || hospital.telephone || 'N/A';
  };

  if (loading && !hospitals && !error) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Hospitals</h1>
          <button
            onClick={onAddHospital}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Hospital
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-400">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Hospitals</h1>
          <button
            onClick={onAddHospital}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Hospital
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400">
          <p className="font-semibold mb-2">Error: {error}</p>
          <p className="text-sm text-red-300 mb-4">
            Make sure your backend server is running on <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:8080</code>
          </p>
          <div className="flex gap-2">
            <button
              onClick={fetchHospitals}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                // Show mock data for UI testing
                setError(null);
                setHospitals({
                  content: [
                    {
                      id: 1,
                      name: 'City General Hospital',
                      address: '1200 Downtown Metro Blvd',
                      district: 'Downtown',
                      state: 'Metro',
                      totalNumBeds: 45,
                      phoneNumber: '(555) 181-2020',
                    },
                    {
                      id: 2,
                      name: "St. Mary's Medical Center",
                      address: '450 Northside Drive',
                      district: 'Uptown',
                      state: 'Metro',
                      totalNumBeds: 30,
                      phoneNumber: '(555) 290-3008',
                    },
                  ],
                  totalElements: 2,
                  totalPages: 1,
                  size: 20,
                  number: 0,
                  first: true,
                  last: true,
                  numberOfElements: 2,
                  empty: false,
                });
                setLoading(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Show Mock Data (for testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Hospitals</h1>
        <button
          onClick={onAddHospital}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Hospital
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by hospital name, ID or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  HOSPITAL NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ICU CAPACITY
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  AVAILABILITY
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  CONTACT
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {hospitals && hospitals.content.length > 0 ? (
                hospitals.content.map((hospital) => {
                const availability = getAvailabilityStatus(hospital);
                return (
                  <tr key={hospital.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{hospital.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {formatLocation(hospital)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {hospital.totalNumBeds || 0} Total
                        {availability.status !== 'Full' && ` (${availability.text.split('(')[1]?.replace(')', '') || 'N/A'})`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          availability.color === 'green'
                            ? 'bg-green-900/30 text-green-400'
                            : availability.color === 'orange'
                            ? 'bg-orange-900/30 text-orange-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {availability.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatContact(hospital)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No hospitals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hospitals && hospitals.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {hospitals.number * hospitals.size + 1} to{' '}
              {Math.min((hospitals.number + 1) * hospitals.size, hospitals.totalElements)} of{' '}
              {hospitals.totalElements} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={hospitals.first}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hospitals.first
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, hospitals.totalPages) }, (_, i) => {
                const pageNum = hospitals.number < 3 ? i : hospitals.number - 2 + i;
                if (pageNum >= hospitals.totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pageNum === hospitals.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(hospitals.totalPages - 1, p + 1))}
                disabled={hospitals.last}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hospitals.last
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
