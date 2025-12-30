import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BedDouble,
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    LogOut,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    X
} from 'lucide-react';
import {
    hospitalApi,
    bedApi,
    BedStatus,
    BedType
} from '../api';
import type { HospitalResponseDTO, BedResponseDTO } from '../api';

const HospitalDashboardPage = () => {
    const { hospitalId } = useParams<{ hospitalId: string }>();
    const navigate = useNavigate();

    const [hospital, setHospital] = useState<HospitalResponseDTO | null>(null);
    const [beds, setBeds] = useState<BedResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState<BedResponseDTO | null>(null);

    // Form states
    const [bedNumber, setBedNumber] = useState('');
    const [bedType, setBedType] = useState<BedType>(BedType.GENERAL);

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
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bedId: number, currentStatus: BedStatus) => {
        // Cycle through statuses: AVAILABLE -> OCCUPIED -> MAINTENANCE -> AVAILABLE
        let newStatus: BedStatus;
        if (currentStatus === BedStatus.AVAILABLE) {
            newStatus = BedStatus.OCCUPIED;
        } else if (currentStatus === BedStatus.OCCUPIED) {
            newStatus = BedStatus.MAINTENANCE;
        } else {
            newStatus = BedStatus.AVAILABLE;
        }

        setUpdating(bedId);
        try {
            await bedApi.updateBedStatus(bedId, { bedStatus: newStatus });
            setBeds(prev => prev.map(bed =>
                bed.id === bedId ? { ...bed, bedStatus: newStatus } : bed
            ));
        } catch (error) {
            console.error('Failed to update bed status', error);
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleAddBed = async () => {
        if (!hospitalId || !bedNumber.trim()) {
            alert('Please enter a bed number');
            return;
        }

        try {
            const newBed = await bedApi.createBed({
                hospitalId: parseInt(hospitalId),
                bedNumber: bedNumber.trim(),
                bedType: bedType
            });
            setBeds(prev => [...prev, newBed]);
            setShowAddModal(false);
            setBedNumber('');
            setBedType(BedType.GENERAL);
        } catch (error) {
            console.error('Failed to create bed', error);
            alert('Failed to create bed');
        }
    };

    const handleEditBed = async () => {
        if (!selectedBed || !bedNumber.trim()) {
            alert('Please enter a bed number');
            return;
        }

        try {
            const updatedBed = await bedApi.updateBed(selectedBed.id, {
                bedNumber: bedNumber.trim(),
                bedType: bedType
            });
            setBeds(prev => prev.map(bed =>
                bed.id === selectedBed.id ? updatedBed : bed
            ));
            setShowEditModal(false);
            setSelectedBed(null);
            setBedNumber('');
            setBedType(BedType.GENERAL);
        } catch (error) {
            console.error('Failed to update bed', error);
            alert('Failed to update bed');
        }
    };

    const handleDeleteBed = async () => {
        if (!selectedBed) return;

        try {
            await bedApi.deleteBed(selectedBed.id);
            setBeds(prev => prev.filter(bed => bed.id !== selectedBed.id));
            setShowDeleteModal(false);
            setSelectedBed(null);
        } catch (error) {
            console.error('Failed to delete bed', error);
            alert('Failed to delete bed');
        }
    };

    const openEditModal = (bed: BedResponseDTO) => {
        setSelectedBed(bed);
        setBedNumber(bed.bedNumber);
        setBedType(bed.bedType);
        setShowEditModal(true);
    };

    const openDeleteModal = (bed: BedResponseDTO) => {
        setSelectedBed(bed);
        setShowDeleteModal(true);
    };

    // Derived stats
    const totalBeds = beds?.length || 0;
    const availableBeds = beds?.filter(b => b.bedStatus === BedStatus.AVAILABLE).length || 0;
    const occupiedBeds = beds?.filter(b => b.bedStatus === BedStatus.OCCUPIED).length || 0;
    const inService = beds?.filter(b => b.bedStatus === BedStatus.MAINTENANCE).length || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Activity className="w-10 h-10 text-blue-600 mb-4" />
                    <div className="text-gray-400">Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Hospital Not Found</h2>
                    <button onClick={() => navigate('/hospitals')} className="mt-4 text-blue-600 hover:underline">Return to List</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
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
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-gray-500 uppercase">Current Time</div>
                            <div className="text-sm font-mono font-bold text-gray-900">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                {/* Bed Management Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Bed Management</h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Bed
                            </button>
                            <button onClick={fetchData} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {beds.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No beds configured for this hospital. Click "Add Bed" to get started.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {beds.map((bed) => (
                                    <div
                                        key={bed.id}
                                        className={`
                                    relative p-4 rounded-xl border-2 transition-all
                                    ${bed.bedStatus === BedStatus.AVAILABLE
                                                ? 'border-green-100 bg-green-50/50'
                                                : bed.bedStatus === BedStatus.OCCUPIED
                                                    ? 'border-red-100 bg-red-50/50'
                                                    : 'border-yellow-100 bg-yellow-50/50'
                                            }
                                `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg text-gray-800">{bed.bedNumber}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openEditModal(bed)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    title="Edit bed"
                                                >
                                                    <Edit2 className="w-3 h-3 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(bed)}
                                                    className="p-1 hover:bg-red-100 rounded transition-colors"
                                                    title="Delete bed"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            {bed.bedType}
                                        </div>

                                        <button
                                            onClick={() => handleStatusChange(bed.id, bed.bedStatus)}
                                            disabled={updating === bed.id}
                                            className={`
                                        text-xs font-bold px-2 py-1 rounded inline-block cursor-pointer hover:opacity-80 transition-opacity
                                        ${bed.bedStatus === BedStatus.AVAILABLE ? 'bg-green-200 text-green-800' :
                                                    bed.bedStatus === BedStatus.OCCUPIED ? 'bg-red-200 text-red-800' :
                                                        'bg-yellow-200 text-yellow-800'}
                                    `}
                                        >
                                            {updating === bed.id ? (
                                                <RefreshCw className="w-3 h-3 inline animate-spin" />
                                            ) : (
                                                bed.bedStatus
                                            )}
                                        </button>

                                        <div className="mt-3 text-[10px] text-gray-400 text-right">
                                            Click status to cycle
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </main>

            {/* Add Bed Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Add New Bed</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Number</label>
                                <input
                                    type="text"
                                    value={bedNumber}
                                    onChange={(e) => setBedNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., ICU-101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Type</label>
                                <select
                                    value={bedType}
                                    onChange={(e) => setBedType(e.target.value as BedType)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={BedType.GENERAL}>General</option>
                                    <option value={BedType.ICU}>ICU</option>
                                    <option value={BedType.VENTILATOR}>Ventilator</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddBed}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Add Bed
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Bed Modal */}
            {showEditModal && selectedBed && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Edit Bed</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Number</label>
                                <input
                                    type="text"
                                    value={bedNumber}
                                    onChange={(e) => setBedNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., ICU-101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Type</label>
                                <select
                                    value={bedType}
                                    onChange={(e) => setBedType(e.target.value as BedType)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={BedType.GENERAL}>General</option>
                                    <option value={BedType.ICU}>ICU</option>
                                    <option value={BedType.VENTILATOR}>Ventilator</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleEditBed}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedBed && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Delete Bed</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete bed <strong>{selectedBed.bedNumber}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteBed}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalDashboardPage;
