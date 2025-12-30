import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle } from 'lucide-react';
import { hospitalApi, ambulanceApi } from '../api';
import type { HospitalMatchDTO } from '../api';

// Fix default marker icons for Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ambulance icon (clean, professional)
const createAmbulanceIcon = (rotation: number = 0) => new L.DivIcon({
    className: 'ambulance-marker-clean',
    html: `<div style="
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
    transform: rotate(${rotation}deg);
    border: 3px solid white;
  ">
    <span style="font-size: 22px; filter: brightness(10);">🚑</span>
  </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});



// Smooth auto-follow camera component
function SmoothFollowCamera({
    position,
    enabled,
    zoom = 15
}: {
    position: [number, number] | null;
    enabled: boolean;
    zoom?: number;
}) {
    const map = useMap();

    useEffect(() => {
        if (position && enabled) {
            // Offset camera slightly forward for "navigation" feel
            const offset = 0.002; // ~200m forward offset
            map.setView([position[0] + offset, position[1]], zoom, {
                animate: true,
                duration: 0.8,
                easeLinearity: 0.5
            });
        }
    }, [position, enabled, zoom, map]);

    return null;
}

export default function MapView() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [matchedHospital, setMatchedHospital] = useState<HospitalMatchDTO | null>(null);
    const [routePath, setRoutePath] = useState<[number, number][]>([]);
    const [autoFollow, setAutoFollow] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Manual location request function
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setLocationError(null);
        console.log('Requesting location (High Accuracy)...');

        // Strategy: Fast (Cached/Low) -> Precise (High) -> Robust (Low/Fresh)

        const onLocationSuccess = (pos: GeolocationPosition, method: string) => {
            console.log(`Location success (${method}):`, pos.coords.latitude, pos.coords.longitude);
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            setLocationError(null);
            setIsLocating(false);
        };

        const onLocationError = (error: GeolocationPositionError, method: string) => {
            console.warn(`Location failed (${method}):`, error.message);
        };

        // 1. Try "Fastest" location (cached or low accuracy)
        navigator.geolocation.getCurrentPosition(
            (pos) => onLocationSuccess(pos, 'Fast/Cached'),
            (err1) => {
                onLocationError(err1, 'Fast/Cached');

                // 2. Try High Accuracy if fast failed
                console.log('Retrying with High Accuracy...');
                navigator.geolocation.getCurrentPosition(
                    (pos) => onLocationSuccess(pos, 'High Accuracy'),
                    (err2) => {
                        onLocationError(err2, 'High Accuracy');

                        // 3. Fallback to robust low accuracy
                        console.log('Retrying with Robust Low Accuracy...');
                        navigator.geolocation.getCurrentPosition(
                            (pos) => onLocationSuccess(pos, 'Robust Low'),
                            (err3) => {
                                onLocationError(err3, 'Robust Low');
                                let errorMessage = 'Unable to get your location. ';
                                if (err3.code === err3.PERMISSION_DENIED) {
                                    errorMessage += 'Click "Enable Location" and allow location access when prompted.';
                                } else if (err3.code === err3.TIMEOUT) {
                                    errorMessage += 'Location request timed out. Please try again.';
                                } else {
                                    errorMessage += 'Location information is unavailable.';
                                }
                                setLocationError(errorMessage);
                                setIsLocating(false);
                            },
                            { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
                        );
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: Infinity }
        );
    };

    // Auto-request location on mount
    useEffect(() => {
        requestLocation();
    }, []);



    // Find nearest hospital with route
    const handleFindNearest = async () => {
        if (!userLocation) {
            setError('Location not available');
            return;
        }

        console.log('Finding nearest hospital for:', userLocation);
        setLoading(true);
        setError(null);
        setMatchedHospital(null);

        setRoutePath([]);

        try {
            console.log('Calling ambulanceApi.findNearestHospital...');
            const result = await ambulanceApi.findNearestHospital({
                ambulanceId: `AMB-${Date.now()}`,
                latitude: userLocation[0],
                longitude: userLocation[1],
                requiredBedType: 'ICU',
            });
            console.log('Nearest hospital result:', result);

            setMatchedHospital(result);

            const hospitalDetails = await hospitalApi.getHospitalById(result.hospitalId);
            console.log('Hospital details:', hospitalDetails);

            if (hospitalDetails?.latitude && hospitalDetails?.longitude) {
                // Use real road coordinates from GraphHopper
                let path: [number, number][];
                if (result.routeCoordinates && result.routeCoordinates.length > 0) {
                    console.log('Using route coordinates from backend');
                    path = result.routeCoordinates.map(c => [c[0], c[1]] as [number, number]);
                } else {
                    console.log('Using direct line (no route coords)');
                    path = [userLocation, [hospitalDetails.latitude, hospitalDetails.longitude]];
                }

                setRoutePath(path);
            }
        } catch (err: any) {
            console.error('Error in handleFindNearest:', err);

            // Extract meaningful message from backend response if available
            const backendMsg = err.response?.data?.message || '';
            let msg = backendMsg || err.message || 'Failed to find hospital';

            // Check for specific backend availability error
            if (msg.includes('No hospital with available') || backendMsg.includes('No hospital with available')) {
                msg = 'No nearby hospitals have available ICU beds. Please log in to the Hospital Dashboard and add beds.';
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // No cleanup needed
        };
    }, []);

    // Default center: India's approximate center if no user location
    const defaultCenter: [number, number] = userLocation || [20.5937, 78.9629];

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        {/* Enable Location Button - shows when location is not available */}
                        {!userLocation && (
                            <button
                                onClick={requestLocation}
                                disabled={isLocating}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLocating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Locating...
                                    </>
                                ) : (
                                    <>
                                        <span>📍</span>
                                        Enable Location
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleFindNearest}
                            disabled={loading || !userLocation}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Finding...
                                </>
                            ) : (
                                <>
                                    <span>🚑</span>
                                    Find Nearest Hospital
                                </>
                            )}
                        </button>

                        {matchedHospital && (
                            <div className="bg-gray-50 rounded-xl px-5 py-3 border border-gray-200">
                                <span className="font-semibold text-gray-900">{matchedHospital.hospitalName}</span>
                                <span className="text-gray-500 ml-3">
                                    {matchedHospital.distanceInKm.toFixed(1)} km
                                </span>
                                {matchedHospital.etaMinutes && (
                                    <span className="text-green-600 ml-3 font-medium">
                                        ~{matchedHospital.etaMinutes} min
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoFollow(!autoFollow)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all border ${autoFollow
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}
                        >
                            🎯 Auto-follow {autoFollow ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                {/* Location Error Banner */}
                {locationError && (
                    <div className="mt-3 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-semibold">Location Access Required</strong>
                            <p className="text-sm mt-1">{locationError}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-3 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    {/* Light theme: Carto Positron */}
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <SmoothFollowCamera
                        position={userLocation}
                        enabled={autoFollow && !!userLocation}
                        zoom={15}
                    />

                    {/* User location marker - Now always visible as Ambulance */}
                    {userLocation && (
                        <Marker position={userLocation} icon={createAmbulanceIcon(0)}>
                            <Popup>
                                <div className="text-center p-1">
                                    <strong>Your Ambulance</strong>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Destination Hospital Marker (only show if we have a match/route) */}
                    {matchedHospital && routePath.length > 0 && (
                        <Marker
                            position={routePath[routePath.length - 1]}
                            icon={new L.DivIcon({
                                className: 'hospital-marker-clean',
                                html: `<div style="
                                width: 48px; height: 48px;
                                background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
                                border-radius: 50%;
                                display: flex; align-items: center; justify-content: center;
                                box-shadow: 0 4px 12px rgba(67, 160, 71, 0.4);
                                border: 3px solid white;
                              ">
                                <span style="font-size: 24px;">🏥</span>
                              </div>`,
                                iconSize: [48, 48],
                                iconAnchor: [24, 24],
                            })}
                        >
                            <Popup>
                                <div className="text-center p-2">
                                    <strong className="text-green-700">🎯 Destination</strong>
                                    <br />
                                    <span>{matchedHospital.hospitalName}</span>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Route polyline - Muted red with white outline */}
                    {routePath.length >= 2 && (
                        <>
                            {/* White outline for contrast */}
                            <Polyline
                                positions={routePath}
                                pathOptions={{
                                    color: '#FFFFFF',
                                    weight: 10,
                                    opacity: 0.9,
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                }}
                            />
                            {/* Main route line - Muted red */}
                            <Polyline
                                positions={routePath}
                                pathOptions={{
                                    color: '#D32F2F',
                                    weight: 6,
                                    opacity: 0.85,
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                }}
                            />
                        </>
                    )}
                </MapContainer>

                {/* Status overlay for Route */}
                {matchedHospital && routePath.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-5 shadow-xl border border-gray-200 min-w-[320px] z-[1000]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚑</span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Fastest Route to Hospital</div>
                                <div className="text-gray-500 text-sm">{matchedHospital.hospitalName}</div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                    {matchedHospital.distanceInKm.toFixed(1)} km
                                </div>
                                <div className="text-xs text-gray-400">Distance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-green-600">
                                    {matchedHospital.etaMinutes || '~'} min
                                </div>
                                <div className="text-xs text-gray-400">ETA</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-blue-600">
                                    {matchedHospital.availableBeds}
                                </div>
                                <div className="text-xs text-gray-400">Beds</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 z-[1000]">
                    <div className="text-xs font-semibold text-gray-500 mb-2">LEGEND</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="text-lg">🚑</span> You (Ambulance)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🏥</span> Hospital
                    </div>
                </div>
            </div>
        </div>
    );
}
