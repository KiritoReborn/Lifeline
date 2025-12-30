// Offline Storage Service using IndexedDB
// This provides REAL offline-first functionality

const DB_NAME = 'LifelineOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_sos';

export interface OfflineSOS {
    id: string;
    latitude: number;
    longitude: number;
    emergencyType: string;
    message: string;
    timestamp: number;
    synced: boolean;
    retryCount: number;
}

class OfflineStorageService {
    private db: IDBDatabase | null = null;
    private isOnline: boolean = navigator.onLine;
    private syncInProgress: boolean = false;
    private listeners: ((status: { pending: number; synced: number }) => void)[] = [];

    constructor() {
        this.init();
        this.setupNetworkListeners();
    }

    private async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineStorage] Database initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    private setupNetworkListeners(): void {
        window.addEventListener('online', () => {
            console.log('[OfflineStorage] Network online - triggering sync');
            this.isOnline = true;
            this.syncPendingSOS();
        });

        window.addEventListener('offline', () => {
            console.log('[OfflineStorage] Network offline');
            this.isOnline = false;
        });
    }

    // Add listener for status updates
    onStatusChange(callback: (status: { pending: number; synced: number }) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(): void {
        this.getStats().then(stats => {
            this.listeners.forEach(l => l(stats));
        });
    }

    // Save SOS locally (works offline!)
    async saveSOS(sos: Omit<OfflineSOS, 'id' | 'synced' | 'retryCount'>): Promise<OfflineSOS> {
        await this.ensureDB();

        const sosRecord: OfflineSOS = {
            ...sos,
            id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            synced: false,
            retryCount: 0,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(sosRecord);

            request.onsuccess = () => {
                console.log('[OfflineStorage] SOS saved locally:', sosRecord.id);
                this.notifyListeners();

                // Try to sync immediately if online
                if (this.isOnline) {
                    this.syncPendingSOS();
                }

                resolve(sosRecord);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Get all pending (unsynced) SOS
    async getPendingSOS(): Promise<OfflineSOS[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Filter in JavaScript since boolean indexing is problematic
                const pending = request.result.filter((sos: OfflineSOS) => !sos.synced);
                resolve(pending);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get all SOS (for display)
    async getAllSOS(): Promise<OfflineSOS[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(sorted);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Mark SOS as synced
    async markSynced(id: string): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const record = getRequest.result;
                if (record) {
                    record.synced = true;
                    store.put(record);
                    this.notifyListeners();
                }
                resolve();
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Sync pending SOS to server
    async syncPendingSOS(force: boolean = false): Promise<{ synced: number; failed: number }> {
        if (this.syncInProgress) {
            return { synced: 0, failed: 0 };
        }

        // Skip online check if force is true
        if (!force && !this.isOnline) {
            console.log('[OfflineStorage] Skipping sync - offline');
            return { synced: 0, failed: 0 };
        }

        this.syncInProgress = true;
        console.log('[OfflineStorage] Starting sync...');

        const pending = await this.getPendingSOS();
        let synced = 0;
        let failed = 0;

        for (const sos of pending) {
            try {
                const response = await fetch('http://localhost:8080/api/sos/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: sos.latitude,
                        longitude: sos.longitude,
                        emergencyType: sos.emergencyType,
                        message: sos.message,
                        clientTimestamp: sos.timestamp,
                        offlineId: sos.id,
                    }),
                });

                if (response.ok) {
                    await this.markSynced(sos.id);
                    synced++;
                    console.log('[OfflineStorage] Synced:', sos.id);
                } else {
                    failed++;
                    console.error('[OfflineStorage] Sync failed for:', sos.id, response.status);
                }
            } catch (error) {
                failed++;
                console.error('[OfflineStorage] Sync error for:', sos.id, error);
            }
        }

        this.syncInProgress = false;
        console.log(`[OfflineStorage] Sync complete: ${synced} synced, ${failed} failed`);

        return { synced, failed };
    }

    // Get stats
    async getStats(): Promise<{ pending: number; synced: number }> {
        const all = await this.getAllSOS();
        const pending = all.filter(s => !s.synced).length;
        const synced = all.filter(s => s.synced).length;
        return { pending, synced };
    }

    // Check if online
    getOnlineStatus(): boolean {
        return this.isOnline;
    }

    private async ensureDB(): Promise<void> {
        if (!this.db) {
            await this.init();
        }
    }
}

// Singleton instance
export const offlineStorage = new OfflineStorageService();
