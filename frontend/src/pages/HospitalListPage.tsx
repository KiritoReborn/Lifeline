import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Plus } from 'lucide-react';
import { hospitalApi, bedApi } from '../api';
import type { HospitalResponseDTO, Page } from '../api';

interface HospitalWithBedCount extends HospitalResponseDTO {
    actualBedCount?: number;
}

const HospitalListPage = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState<HospitalWithBedCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHospitals();
    }, [page, searchTerm]);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            let response: Page<HospitalResponseDTO>;
            if (searchTerm) {
                response = await hospitalApi.searchHospitals({ keyword: searchTerm, page, size: 10 });
            } else {
                response = await hospitalApi.getAllHospitals({ page, size: 10 });
            }

            // Fetch bed counts for each hospital
            const hospitalsWithCounts = await Promise.all(
                response.content.map(async (hospital) => {
                    try {
                        const beds = await bedApi.getBedsByHospital(hospital.id);
                        return { ...hospital, actualBedCount: beds.length };
                    } catch (error) {
                        // If fetching beds fails, use the CSV data as fallback
                        return { ...hospital, actualBedCount: hospital.totalNumBeds || 0 };
                    }
                })
            );

            setHospitals(hospitalsWithCounts);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch hospitals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHospitalClick = (hospitalId: number) => {
        // Navigate to public view
        navigate(`/hospital/${hospitalId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                                <Plus className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-bold text-xl text-blue-600 tracking-tight">LIFELINE</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Notifications or Admin profile could go here, omitting for simplicity */}
                            <div className="flex items-center space-x-2">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-gray-900">Admin Console</div>
                                    <div className="text-xs text-gray-500">View Only</div>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                    JD
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
                        <p className="text-gray-500 mt-1">Manage hospital facilities and monitor bed capacity across the network.</p>
                    </div>
                    <button
                        onClick={() => alert('Feature coming soon')}
                        className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Hospital
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by hospital name, ID, or location..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Hospital List */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-12 sm:col-span-5">Hospital Name</div>
                        <div className="col-span-12 sm:col-span-3">Location</div>
                        <div className="col-span-6 sm:col-span-2">Capacity</div>
                        <div className="col-span-6 sm:col-span-2 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400">Loading hospitals...</div>
                        ) : hospitals.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No hospitals found.</div>
                        ) : (
                            hospitals.map((hospital) => (
                                <div
                                    key={hospital.id}
                                    onClick={() => handleHospitalClick(hospital.id)}
                                    className="group grid grid-cols-12 gap-4 px-6 py-6 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    {/* Name & ID */}
                                    <div className="col-span-12 sm:col-span-5 flex items-start space-x-4">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {hospital.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">ID: #{hospital.id.toString().padStart(6, '0')}</div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="col-span-12 sm:col-span-3 text-sm text-gray-600 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                        <span className="truncate">{hospital.location || hospital.address || 'Unknown Location'}</span>
                                    </div>

                                    {/* Capacity - Now showing actual bed count */}
                                    <div className="col-span-6 sm:col-span-2">
                                        <div className="text-sm font-bold text-gray-900">
                                            {hospital.actualBedCount !== undefined ? hospital.actualBedCount : 0} Beds
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {hospital.actualBedCount !== undefined && hospital.actualBedCount > 0
                                                ? 'In System'
                                                : 'No Beds'}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-6 sm:col-span-2 flex justify-end">
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages || 1}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default HospitalListPage;
