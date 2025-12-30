import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BedDouble,
    Activity,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Lock
} from 'lucide-react';
import {
    hospitalApi,
    bedApi,
    BedStatus
} from '../api';
import type { HospitalResponseDTO, BedResponseDTO } from '../api';

const PublicHospitalPage = () => {
    const { hospitalId } = useParams<{ hospitalId: string }>();
    const navigate = useNavigate();

    const [hospital, setHospital] = useState<HospitalResponseDTO | null>(null);
    const [beds, setBeds] = useState<BedResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hospitalId) {
            fetchData();
        }
    }, [hospitalId]);

    const fetchData = async () => {
        try {
            if (!hospitalId) return;
            const id = parseInt(hospitalId);

            const [hospitalData, bedsData] = await Promise.all([
                hospitalApi.getHospitalById(id),
                bedApi.getBedsByHospital(id)
            ]);

            setHospital(hospitalData);
            setBeds(bedsData);
        } catch (error) {
            console.error('Failed to fetch hospital data', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived stats
    const totalBeds = beds?.length || 0;
    const availableBeds = beds?.filter(b => b.bedStatus === BedStatus.AVAILABLE).length || 0;
    const occupiedBeds = beds?.filter(b => b.bedStatus === BedStatus.OCCUPIED).length || 0;
    const inService = totalBeds - availableBeds - occupiedBeds;

    const handleActionClick = () => {
        if (hospitalId) {
            navigate(`/login?target=${hospitalId}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Activity className="w-10 h-10 text-blue-600 mb-4" />
                    <div className="text-gray-400">Loading Hospital Info...</div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Hospital Not Found</h2>
                    <button onClick={() => navigate('/hospitals')} className="mt-4 text-blue-600 hover:underline">Return to List</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{hospital.name}</h1>
                            <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {hospital.address || hospital.location}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleActionClick}
                            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-bold shadow-lg"
                        >
                            <Lock className="w-4 h-4" />
                            <span>Staff Login</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Public Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-blue-900">Public View Only</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            You are viewing real-time bed availability. To manage beds or update status, please login as authorized staff.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <BedDouble className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase">Total Capacity</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900">{totalBeds} <span className="text-sm font-normal text-gray-400">Units</span></div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase">Available Now</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900">{availableBeds} <span className="text-sm font-normal text-gray-400">Beds</span></div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase">Occupied</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900">{occupiedBeds} <span className="text-sm font-normal text-gray-400">Patients</span></div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-100 flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase">Maintenance</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900">{inService} <span className="text-sm font-normal text-gray-400">Units</span></div>
                    </div>
                </div>

                {/* Bed Grid (Read Only) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Bed Status Overview</h2>
                    </div>

                    <div className="p-6">
                        {beds.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No beds configured for this hospital.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {beds.map((bed) => (
                                    <div
                                        key={bed.id}
                                        className={`
                                            relative p-4 rounded-xl border transition-all
                                            ${bed.bedStatus === BedStatus.AVAILABLE
                                                ? 'border-green-100 bg-green-50/30'
                                                : bed.bedStatus === BedStatus.OCCUPIED
                                                    ? 'border-red-100 bg-red-50/30'
                                                    : 'border-yellow-100 bg-yellow-50/30'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg text-gray-800">{bed.bedNumber}</span>
                                            <div className={`w-3 h-3 rounded-full ${bed.bedStatus === BedStatus.AVAILABLE ? 'bg-green-500' :
                                                    bed.bedStatus === BedStatus.OCCUPIED ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                        </div>

                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            {bed.bedType}
                                        </div>

                                        <div className={`
                                            text-xs font-bold px-2 py-1 rounded inline-block
                                            ${bed.bedStatus === BedStatus.AVAILABLE ? 'bg-green-100 text-green-700' :
                                                bed.bedStatus === BedStatus.OCCUPIED ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'}
                                        `}>
                                            {bed.bedStatus}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button onClick={handleActionClick} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Are you a staff member? Login here
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PublicHospitalPage;
