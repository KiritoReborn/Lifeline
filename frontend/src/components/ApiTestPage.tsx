import { useState } from 'react';
import { hospitalApi, bedApi, ambulanceApi, BedType, BedStatus } from '../api';
import type { HospitalCreateDTO, AmbulanceRequestDTO, BedCreateDTO, BedStatusUpdateDTO } from '../api';

export default function ApiTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const handleApiCall = async (apiCall: () => Promise<any>, description: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall();
      setResults({ description, data, timestamp: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults({ description, error: err instanceof Error ? err.message : 'Unknown error', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">API Endpoint Tester</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Hospital Endpoints */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">🏥 Hospital APIs</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleApiCall(() => hospitalApi.getHospitalStats(), 'Get Hospital Stats')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Get Stats
            </button>
            <button
              onClick={() => handleApiCall(() => hospitalApi.getAllHospitals({ page: 0, size: 5 }), 'Get All Hospitals (first 5)')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Get All (5)
            </button>
            <button
              onClick={() => handleApiCall(() => hospitalApi.getHospitalById(1), 'Get Hospital by ID (1)')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Get by ID
            </button>
            <button
              onClick={() => handleApiCall(() => hospitalApi.searchHospitals({ keyword: 'Hospital', page: 0, size: 5 }), 'Search Hospitals')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Search
            </button>
            <button
              onClick={() => {
                const newHospital: HospitalCreateDTO = {
                  name: `Test Hospital ${Date.now()}`,
                  latitude: 12.9716,
                  longitude: 77.5946,
                  state: 'Karnataka',
                  district: 'Bangalore',
                  totalNumBeds: 10,
                };
                handleApiCall(() => hospitalApi.createHospital(newHospital), 'Create Hospital');
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              Create Hospital
            </button>
          </div>
        </div>

        {/* Bed Endpoints */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">🛏️ Bed APIs</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleApiCall(() => bedApi.getAvailableBeds(1, BedType.ICU), 'Get Available Beds (Hospital 1, ICU)')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={loading}
            >
              Get Available
            </button>
            <button
              onClick={() => handleApiCall(() => bedApi.getAvailableBedCount(1, BedType.ICU), 'Get Available Count (Hospital 1, ICU)')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={loading}
            >
              Get Count
            </button>
            <button
              onClick={() => {
                const newBed: BedCreateDTO = {
                  hospitalId: 1,
                  bedNumber: `BED-${Date.now()}`,
                  bedType: BedType.ICU,
                };
                handleApiCall(() => bedApi.createBed(newBed), 'Create Bed');
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              Create Bed
            </button>
            <button
              onClick={() => {
                const update: BedStatusUpdateDTO = {
                  bedStatus: BedStatus.OCCUPIED,
                };
                handleApiCall(() => bedApi.updateBedStatus(1, update), 'Update Bed Status (Bed 1)');
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={loading}
            >
              Update Status
            </button>
          </div>
        </div>

        {/* Ambulance Endpoints */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">🚑 Ambulance APIs</h2>
          <div className="space-y-2">
            {locationStatus && (
              <p className="text-sm text-gray-400 mb-2">{locationStatus}</p>
            )}
            <button
              onClick={() => {
                if (!navigator.geolocation) {
                  setError('Geolocation is not supported by your browser');
                  return;
                }
                setLocationStatus('📍 Getting your location...');
                setLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationStatus(`📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    const request: AmbulanceRequestDTO = {
                      ambulanceId: 'AMB-TEST-001',
                      latitude,
                      longitude,
                      requiredBedType: 'ICU',
                    };
                    handleApiCall(() => ambulanceApi.findNearestHospital(request), `Find Nearest Hospital (from ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                  },
                  (err) => {
                    setLoading(false);
                    setLocationStatus('');
                    setError(`Location error: ${err.message}`);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              🚑 Find Nearest (Uses Your Location)
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {loading && (
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400 mb-4">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {results && !loading && (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">{results.description}</h3>
            <span className="text-sm text-gray-400">{results.timestamp}</span>
          </div>
          {results.error ? (
            <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-400">
              <p className="font-semibold">Error: {results.error}</p>
            </div>
          ) : (
            <pre className="bg-gray-800 rounded p-4 overflow-auto text-sm text-gray-300">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
