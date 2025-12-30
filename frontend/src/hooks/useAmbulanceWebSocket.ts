import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export interface AmbulanceLocation {
    ambulanceId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
}

export interface ReservationUpdate {
    reservationId: number;
    hospitalId: number;
    bedId: number;
    ambulanceId: string;
    status: string;
}

interface UseAmbulanceWebSocketOptions {
    onLocationUpdate?: (location: AmbulanceLocation) => void;
    onReservationUpdate?: (reservation: ReservationUpdate) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export function useAmbulanceWebSocket(options: UseAmbulanceWebSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastLocation, setLastLocation] = useState<AmbulanceLocation | null>(null);
    const clientRef = useRef<Client | null>(null);

    const connect = useCallback(() => {
        if (clientRef.current?.connected) return;

        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log('[WebSocket]', str),
            onConnect: () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                options.onConnect?.();

                // Subscribe to ambulance location updates
                client.subscribe('/topic/ambulance', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        setLastLocation(data);
                        options.onLocationUpdate?.(data);
                    } catch (e) {
                        console.error('Error parsing ambulance message:', e);
                    }
                });

                // Subscribe to reservation updates
                client.subscribe('/topic/reservations', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        options.onReservationUpdate?.(data);
                    } catch (e) {
                        console.error('Error parsing reservation message:', e);
                    }
                });
            },
            onDisconnect: () => {
                console.log('❌ WebSocket disconnected');
                setIsConnected(false);
                options.onDisconnect?.();
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            },
        });

        client.activate();
        clientRef.current = client;
    }, [options]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }
    }, []);

    // Simulate location update (for testing without real GPS)
    const simulateLocationUpdate = useCallback((location: Partial<AmbulanceLocation>) => {
        const update: AmbulanceLocation = {
            ambulanceId: location.ambulanceId || 'AMB-SIM',
            latitude: location.latitude || 0,
            longitude: location.longitude || 0,
            heading: location.heading,
            speed: location.speed,
            timestamp: new Date().toISOString(),
        };
        setLastLocation(update);
        options.onLocationUpdate?.(update);
    }, [options]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        lastLocation,
        connect,
        disconnect,
        simulateLocationUpdate,
    };
}
