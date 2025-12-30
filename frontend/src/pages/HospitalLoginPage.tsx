import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { hospitalApi } from '../api';

const HospitalLoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [hospitalId, setHospitalId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const target = searchParams.get('target');
        if (target) {
            setHospitalId(target);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalId.trim()) {
            setError('Please enter a Hospital ID');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // successful retrieval means the ID exists
            const id = parseInt(hospitalId);
            if (isNaN(id)) {
                throw new Error("Invalid ID format");
            }

            await hospitalApi.getHospitalById(id);

            // Navigate to dashboard
            navigate(`/dashboard/${id}`);
        } catch (err) {
            console.error(err);
            setError('Invalid Hospital ID. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Hospital Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Secure access for bed management
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">
                                Hospital ID
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="hospitalId"
                                    name="hospitalId"
                                    type="text"
                                    required
                                    className={`appearance-none block w-full px-3 py-3 border ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'} rounded-xl shadow-sm focus:outline-none sm:text-sm transition-all`}
                                    placeholder="e.g. 101"
                                    value={hospitalId}
                                    onChange={(e) => setHospitalId(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div className="mt-2 flex items-center text-sm text-red-600 animate-fadeIn">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Access Dashboard
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Government Authorized Personnel Only
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HospitalLoginPage;
