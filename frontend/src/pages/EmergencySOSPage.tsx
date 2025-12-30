import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MapView from '../components/MapView';

const EmergencySOSPage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1 hover:bg-red-700 rounded-lg transition-colors"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <span className="animate-pulse">🚨</span> EMERGENCY MODE
                        </h1>
                        <p className="text-xs text-red-100">Live Ambulance Tracking Active</p>
                    </div>
                </div>
                <div>
                    <span className="px-2 py-1 bg-white/20 rounded font-mono text-sm font-bold">SOS ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 relative">
                <MapView />
            </div>
        </div>
    );
};

export default EmergencySOSPage;
