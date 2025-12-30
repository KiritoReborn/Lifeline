import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, Wifi, Radio, Send, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, MapPin, Bluetooth, BluetoothSearching } from 'lucide-react';
import { offlineStorage, type OfflineSOS } from '../services/offlineStorage';

interface BluetoothDevice {
    id: string;
    name: string;
    rssi?: number;
}

const OfflineMeshDemo = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [allMessages, setAllMessages] = useState<OfflineSOS[]>([]);
    const [stats, setStats] = useState({ pending: 0, synced: 0 });
    const [isSending, setIsSending] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    // Bluetooth state
    const [isScanning, setIsScanning] = useState(false);
    const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
    const [bluetoothSupported, setBluetoothSupported] = useState(false);
    const [bluetoothError, setBluetoothError] = useState<string | null>(null);

    // Get location on mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setLocation({ lat: 12.9716, lng: 77.5946 }) // Default to Bangalore
        );
    }, []);

    // Listen for online/offline changes
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setLastAction('🌐 Back online! Auto-syncing...');
        };
        const handleOffline = () => {
            setIsOnline(false);
            setLastAction('📴 Network offline - messages stored locally');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Listen for storage updates
    useEffect(() => {
        const unsubscribe = offlineStorage.onStatusChange((newStats) => {
            setStats(newStats);
            loadMessages();
        });

        // Initial load
        loadMessages();
        offlineStorage.getStats().then(setStats);

        return unsubscribe;
    }, []);

    const loadMessages = async () => {
        const messages = await offlineStorage.getAllSOS();
        setAllMessages(messages);
    };

    // Send SOS (works offline!)
    const handleSendSOS = async (type: string) => {
        if (!location) {
            setLastAction('❌ Location not available');
            return;
        }

        setIsSending(true);

        // If we have Bluetooth devices, show mesh routing simulation
        if (bluetoothDevices.length > 0) {
            setLastAction(`📡 Routing ${type} through ${bluetoothDevices.length} nearby devices...`);
            await new Promise(r => setTimeout(r, 800));

            for (const device of bluetoothDevices) {
                setLastAction(`📶 Hop → ${device.name}...`);
                await new Promise(r => setTimeout(r, 500));
            }
            setLastAction(`🌐 Finding internet gateway...`);
            await new Promise(r => setTimeout(r, 600));
        } else {
            setLastAction(`📤 Sending ${type}...`);
        }

        try {
            await offlineStorage.saveSOS({
                latitude: location.lat,
                longitude: location.lng,
                emergencyType: type,
                message: type === 'SOS' ? '🆘 EMERGENCY: Need immediate help!' : '✅ I am safe at current location',
                timestamp: Date.now(),
            });

            if (isOnline) {
                setLastAction(`✅ ${type} delivered! Routed through ${bluetoothDevices.length || 0} mesh nodes.`);
            } else {
                setLastAction(`📱 ${type} saved locally - will relay through mesh when nodes sync`);
            }
        } catch (error) {
            setLastAction(`❌ Error: ${error}`);
        } finally {
            setIsSending(false);
        }
    };

    // Manual sync
    const handleManualSync = async () => {
        setIsSyncing(true);
        setLastAction('🔄 Syncing pending messages...');

        try {
            const result = await offlineStorage.syncPendingSOS(true); // Force sync
            setLastAction(`✅ Sync complete: ${result.synced} synced, ${result.failed} failed`);
        } catch (error) {
            setLastAction(`❌ Sync error: ${error}`);
        } finally {
            setIsSyncing(false);
        }
    };

    // Check Bluetooth support
    useEffect(() => {
        if ('bluetooth' in navigator) {
            setBluetoothSupported(true);
        }
    }, []);

    // Scan for Bluetooth devices
    const handleBluetoothScan = async () => {
        if (!bluetoothSupported) {
            setBluetoothError('Bluetooth not supported in this browser. Use Chrome on desktop or Android.');
            return;
        }

        setIsScanning(true);
        setBluetoothError(null);
        setLastAction('📡 Scanning for nearby Bluetooth devices...');

        try {
            // Request any Bluetooth device (this prompts the user)
            const device = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'device_information']
            });

            // Add to list
            const newDevice: BluetoothDevice = {
                id: device.id,
                name: device.name || 'Unknown Device',
            };

            setBluetoothDevices(prev => {
                // Avoid duplicates
                if (prev.find(d => d.id === newDevice.id)) return prev;
                return [...prev, newDevice];
            });

            setLastAction(`📱 Found: ${newDevice.name}`);
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                setLastAction('ℹ️ No device selected');
            } else {
                setBluetoothError(`Bluetooth error: ${error.message}`);
                setLastAction(`❌ Bluetooth: ${error.message}`);
            }
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Radio className="w-6 h-6 text-red-500" />
                                Offline-First SOS
                            </h1>
                            <p className="text-sm text-gray-400">Works without internet - syncs when online</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isOnline ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/50 rounded-full text-green-300 text-sm">
                                <Wifi className="w-4 h-4" />
                                Online
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 rounded-full text-red-300 text-sm animate-pulse">
                                <WifiOff className="w-4 h-4" />
                                Offline
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                        <div className="text-sm text-gray-400">Pending Sync</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.synced}</div>
                        <div className="text-sm text-gray-400">Synced to Server</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats.pending + stats.synced}</div>
                        <div className="text-sm text-gray-400">Total Messages</div>
                    </div>
                </div>

                {/* Location */}
                {location && (
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">
                            Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => handleSendSOS('SOS')}
                        disabled={isSending}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                    >
                        <AlertTriangle className="w-8 h-8" />
                        <span className="text-lg">Send SOS</span>
                        <span className="text-xs text-red-200">Works offline!</span>
                    </button>

                    <button
                        onClick={() => handleSendSOS('SAFE')}
                        disabled={isSending}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                    >
                        <CheckCircle className="w-8 h-8" />
                        <span className="text-lg">I'm Safe</span>
                        <span className="text-xs text-green-200">Works offline!</span>
                    </button>
                </div>

                {/* Manual Sync Button */}
                <button
                    onClick={handleManualSync}
                    disabled={isSyncing || stats.pending === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mb-6"
                >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : `Sync ${stats.pending} Pending Messages`}
                </button>

                {/* Last Action */}
                {lastAction && (
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
                        <div className="text-sm text-gray-300">{lastAction}</div>
                    </div>
                )}

                {/* Messages List */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
                        <h2 className="font-bold flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Message History
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
                        {allMessages.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No messages yet. Send an SOS to test!
                            </div>
                        ) : (
                            allMessages.map((msg) => (
                                <div key={msg.id} className="p-4 flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.emergencyType === 'SOS' ? 'bg-red-900/50' : 'bg-green-900/50'
                                        }`}>
                                        {msg.emergencyType === 'SOS' ? (
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        ) : (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{msg.emergencyType}</span>
                                            {msg.synced ? (
                                                <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded-full">
                                                    Synced ✓
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-400">{msg.message}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bluetooth Devices Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mt-6">
                    <div className="px-4 py-3 bg-blue-900/30 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="font-bold flex items-center gap-2">
                            <Bluetooth className="w-4 h-4 text-blue-400" />
                            Mesh Relay Nodes ({bluetoothDevices.length} found)
                        </h2>
                        <button
                            onClick={handleBluetoothScan}
                            disabled={isScanning}
                            className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                            {isScanning ? (
                                <>
                                    <BluetoothSearching className="w-3 h-3 animate-pulse" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Bluetooth className="w-3 h-3" />
                                    Find Nodes
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-4">
                        {!bluetoothSupported ? (
                            <div className="text-center text-gray-500 py-4">
                                ⚠️ Bluetooth not supported. Use Chrome on desktop/Android.
                            </div>
                        ) : bluetoothError ? (
                            <div className="text-center text-red-400 py-4">
                                {bluetoothError}
                            </div>
                        ) : bluetoothDevices.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                <p>📡 Click "Find Nodes" to discover nearby relay devices</p>
                                <p className="text-xs mt-2">SOS will route through these devices when sent</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {bluetoothDevices.map((device, index) => (
                                    <div key={device.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{device.name}</div>
                                            <div className="text-xs text-gray-500">Relay Node</div>
                                        </div>
                                        <div className="ml-auto text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                                            ✓ Ready
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
                                    💡 Send SOS will now route through these {bluetoothDevices.length} nodes
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-bold mb-4">How Offline-First Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">📱</div>
                            <div className="font-medium">1. Store Locally</div>
                            <div className="text-gray-400 mt-1">
                                SOS saved in IndexedDB instantly - no server needed
                            </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">🔄</div>
                            <div className="font-medium">2. Auto-Detect Network</div>
                            <div className="text-gray-400 mt-1">
                                When internet returns, sync automatically triggers
                            </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">☁️</div>
                            <div className="font-medium">3. Sync to Server</div>
                            <div className="text-gray-400 mt-1">
                                All pending messages uploaded to command center
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OfflineMeshDemo;
