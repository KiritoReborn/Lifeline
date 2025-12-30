import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hospitalApi, ambulanceApi } from '../api';

// Custom ambulance icon with rotation support
const createAmbulanceIcon = (rotation: number = 0) => new L.DivIcon({
    className: 'ambulance-marker-pro',
    html: `<div style="
    width: 48px; height: 48px;
    background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(229, 57, 53, 0.5);
    transform: rotate(${rotation}deg);
    border: 3px solid white;
    transition: transform 0.3s ease;
  ">
    <span style="font-size: 24px; filter: brightness(10);">🚑</span>
  </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

// Hospital destination icon
const hospitalIcon = new L.DivIcon({
    className: 'hospital-marker-pro',
    html: `<div style="
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #43A047 0%, #2E7D32 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(67, 160, 71, 0.5);
    border: 3px solid white;
  ">
    <span style="font-size: 26px;">🏥</span>
  </div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
});

// Smooth animated marker with interpolation
function SmoothAmbulanceMarker({
    position,
    children
}: {
    position: [number, number];
    children?: React.ReactNode;
}) {
    const [currentPos, setCurrentPos] = useState(position);
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef<number | null>(null);
    const prevPosRef = useRef(position);

    useEffect(() => {
        const start = prevPosRef.current;
        const end = position;

        // Calculate heading
        const deltaLat = end[0] - start[0];
        const deltaLng = end[1] - start[1];
        if (Math.abs(deltaLat) > 0.00001 || Math.abs(deltaLng) > 0.00001) {
            const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
            setRotation(angle);
        }

        prevPosRef.current = end;
        const startTime = performance.now();
        const duration = 450; // Synced with 500ms update interval

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Linear interpolation for consistent speed
            const lat = start[0] + (end[0] - start[0]) * progress;
            const lng = start[1] + (end[1] - start[1]) * progress;

            setCurrentPos([lat, lng]);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [position]);

    return (
        <Marker position={currentPos} icon={createAmbulanceIcon(rotation)}>
            {children}
        </Marker>
    );
}

// Smooth camera follow with forward offset
function SmoothCamera({ position, enabled }: { position: [number, number] | null; enabled: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (position && enabled) {
            // Slight forward offset for navigation feel
            const offset = 0.003;
            map.setView([position[0] + offset, position[1]], 15, {
                animate: true,
                duration: 0.6
            });
        }
    }, [position, enabled, map]);

    return null;
}

export default function AmbulanceTrackingMap() {
    const [ambulancePos, setAmbulancePos] = useState<[number, number] | null>(null);
    const [hospitalPos, setHospitalPos] = useState<[number, number] | null>(null);
    const [hospitalName, setHospitalName] = useState<string>('');
    const [routePath, setRoutePath] = useState<[number, number][]>([]);
    const [isTracking, setIsTracking] = useState(false);
    const [autoCenter, setAutoCenter] = useState(true);
    const [distanceKm, setDistanceKm] = useState(0);
    const [etaMinutes, setEtaMinutes] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [progress, setProgress] = useState(0);
    const simulationRef = useRef<number | null>(null);
    const pathIndexRef = useRef(0);
    const totalPointsRef = useRef(0);

    // Calculate distance and ETA
    useEffect(() => {
        if (ambulancePos && hospitalPos) {
            const R = 6371;
            const dLat = (hospitalPos[0] - ambulancePos[0]) * Math.PI / 180;
            const dLon = (hospitalPos[1] - ambulancePos[1]) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(ambulancePos[0] * Math.PI / 180) *
                Math.cos(hospitalPos[0] * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;
            setDistanceKm(dist);

            const avgSpeed = speed > 0 ? speed : 45;
            setEtaMinutes(Math.round((dist / avgSpeed) * 60));
        }
    }, [ambulancePos, hospitalPos, speed]);

    // Update progress
    useEffect(() => {
        if (totalPointsRef.current > 0) {
            setProgress((pathIndexRef.current / totalPointsRef.current) * 100);
        }
    }, [ambulancePos]);

    // Start tracking
    const startTracking = async () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            setAmbulancePos([userLat, userLng]);

            try {
                const result = await ambulanceApi.findNearestHospital({
                    ambulanceId: `AMB-${Date.now()}`,
                    latitude: userLat,
                    longitude: userLng,
                    requiredBedType: 'ICU',
                });

                const hospital = await hospitalApi.getHospitalById(result.hospitalId);
                if (hospital.latitude && hospital.longitude) {
                    setHospitalPos([hospital.latitude, hospital.longitude]);
                    setHospitalName(hospital.name);

                    if (result.etaMinutes) setEtaMinutes(result.etaMinutes);
                }

                setIsTracking(true);

                // Use real road coordinates - subsample if too many points
                let path: [number, number][];
                if (result.routeCoordinates && result.routeCoordinates.length > 0) {
                    const rawPath = result.routeCoordinates.map(c => [c[0], c[1]] as [number, number]);
                    // Subsample to ~100 points max for smooth animation
                    const maxPoints = 120;
                    if (rawPath.length > maxPoints) {
                        const step = Math.ceil(rawPath.length / maxPoints);
                        path = rawPath.filter((_, i) => i % step === 0);
                        // Always include last point
                        if (path[path.length - 1] !== rawPath[rawPath.length - 1]) {
                            path.push(rawPath[rawPath.length - 1]);
                        }
                    } else {
                        path = rawPath;
                    }
                } else {
                    path = [[userLat, userLng], [hospital.latitude!, hospital.longitude!]];
                }

                setRoutePath(path);
                totalPointsRef.current = path.length;
                pathIndexRef.current = 0;

                // Simulate movement - faster interval for smoother feel
                const simulateMovement = () => {
                    if (pathIndexRef.current < path.length) {
                        setAmbulancePos(path[pathIndexRef.current]);
                        setSpeed(40 + Math.random() * 25);
                        pathIndexRef.current++;
                        simulationRef.current = window.setTimeout(simulateMovement, 500);
                    } else {
                        setIsTracking(false);
                    }
                };
                simulateMovement();

            } catch (err) {
                console.error('Error starting tracking:', err);
                alert('Failed to find hospital. Make sure backend is running and has ICU beds available.');
            }
        });
    };

    const stopTracking = () => {
        if (simulationRef.current) clearTimeout(simulationRef.current);
        setIsTracking(false);
    };

    useEffect(() => {
        return () => {
            if (simulationRef.current) clearTimeout(simulationRef.current);
        };
    }, []);

    const defaultCenter: [number, number] = ambulancePos || [12.9716, 77.5946];

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Top Navigation Bar - Clean Design */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={isTracking ? stopTracking : startTracking}
                            className={`px-6 py-3 font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md ${isTracking
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                                }`}
                        >
                            {isTracking ? '⏹️ Stop Tracking' : '🚑 Start Live Tracking'}
                        </button>

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isTracking ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></span>
                            {isTracking ? 'Live' : 'Idle'}
                        </div>
                    </div>

                    <button
                        onClick={() => setAutoCenter(!autoCenter)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all border ${autoCenter
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                    >
                        🎯 Auto-follow {autoCenter ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    {/* Light theme: Carto Positron */}
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <SmoothCamera position={ambulancePos} enabled={autoCenter && isTracking} />

                    {/* Route polyline - Muted red with white outline */}
                    {routePath.length >= 2 && (
                        <>
                            <Polyline
                                positions={routePath}
                                pathOptions={{ color: '#FFFFFF', weight: 10, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                            />
                            <Polyline
                                positions={routePath}
                                pathOptions={{ color: '#D32F2F', weight: 6, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
                            />
                        </>
                    )}

                    {/* Animated ambulance */}
                    {ambulancePos && (
                        <SmoothAmbulanceMarker position={ambulancePos}>
                            <Popup><strong>🚑 Ambulance</strong></Popup>
                        </SmoothAmbulanceMarker>
                    )}

                    {/* Hospital destination */}
                    {hospitalPos && (
                        <Marker position={hospitalPos} icon={hospitalIcon}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-green-700">🎯 Destination</strong>
                                    <br />{hospitalName}
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Live Status Panel - Uber-style */}
                {isTracking && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-5 shadow-xl border border-gray-200 min-w-[360px] z-[1000]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚑</span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Ambulance En Route</div>
                                <div className="text-gray-500 text-sm">{hospitalName}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xl font-bold text-gray-900">{distanceKm.toFixed(1)}</div>
                                <div className="text-xs text-gray-400">km away</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xl font-bold text-green-600">{etaMinutes}</div>
                                <div className="text-xs text-gray-400">min ETA</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xl font-bold text-blue-600">{speed.toFixed(0)}</div>
                                <div className="text-xs text-gray-400">km/h</div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 z-[1000]">
                    <div className="text-xs font-semibold text-gray-500 mb-2">LEGEND</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span>🚑</span> Ambulance
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🏥</span> Hospital
                    </div>
                </div>
            </div>
        </div>
    );
}
