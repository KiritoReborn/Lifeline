import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, AlertTriangle, CheckCircle, ArrowLeft, Volume2 } from 'lucide-react';
import { offlineStorage } from '../services/offlineStorage';

const VoiceSOSPage = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'sent'>('idle');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Get location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setLocation({ lat: 12.9716, lng: 77.5946 })
        );
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition not supported. Use Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Voice recognition started');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const currentTranscript = finalTranscript || interimTranscript;
            setTranscript(currentTranscript);

            // Check for emergency keywords
            const text = currentTranscript.toLowerCase();
            if (text.includes('help') || text.includes('emergency') || text.includes('sos') ||
                text.includes('accident') || text.includes('ambulance') || text.includes('danger')) {
                handleEmergencyDetected(currentTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow permission.');
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                // Ignore no-speech errors, just keep open if supposed to be listening
            } else {
                setError(`Voice error: ${event.error}`);
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            // Use a ref to check if we should be listening to avoid closure staleness if needed,
            // but simpler to just handle manual restarts in toggle
            console.log('Voice recognition ended');
            // We rely on state to know if we blindly restart, but careful of infinite loops
            // For now, let's just update UI to show stopped if it stops unexpectedly
            setIsListening((prev) => {
                if (prev) {
                    // Try to restart if it stopped but we think we are listening (unless processing)
                    // Note: This can be dangerous if permission is denied, triggering loop.
                    // Safer to just stop.
                    return false;
                }
                return false;
            });
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []); // Run ONCE

    const handleEmergencyDetected = async (spokenText: string) => {
        // Prevent multiple triggers
        if (status === 'processing' || status === 'sent') return;

        setStatus('processing');
        recognitionRef.current?.stop();
        setIsListening(false);

        // Speak confirmation
        speak('Emergency detected. Sending SOS now.');

        try {
            await offlineStorage.saveSOS({
                latitude: location?.lat || 12.9716,
                longitude: location?.lng || 77.5946,
                emergencyType: 'VOICE_SOS',
                message: `🎤 Voice SOS: "${spokenText}"`,
                timestamp: Date.now(),
            });

            setStatus('sent');
            speak('SOS sent successfully. Help is on the way.');
        } catch (err) {
            setError('Failed to send SOS');
            speak('Failed to send SOS. Please try again.');
        }
    };

    const speak = (text: string) => {
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not initialized');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setStatus('idle');
        } else {
            setTranscript('');
            setStatus('listening');
            setError(null);
            try {
                recognitionRef.current.start();
                setIsListening(true);
                speak('Listening. Say help.');
            } catch (err) {
                console.error('Failed to start recognition:', err);
            }
        }
    };

    const handleManualSOS = async () => {
        setStatus('processing');
        try {
            await offlineStorage.saveSOS({
                latitude: location?.lat || 12.9716,
                longitude: location?.lng || 77.5946,
                emergencyType: 'MANUAL_SOS',
                message: '🆘 Manual SOS triggered',
                timestamp: Date.now(),
            });
            setStatus('sent');
            speak('SOS sent successfully.');
        } catch (err) {
            setError('Failed to send SOS');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Mic className="w-6 h-6 text-red-500" />
                            Voice SOS
                        </h1>
                        <p className="text-sm text-gray-400">Hands-free emergency assistance</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-8 text-center">
                        {error}
                    </div>
                )}

                {/* Main Microphone Button */}
                <div className="flex flex-col items-center mb-12">
                    <button
                        onClick={toggleListening}
                        disabled={status === 'processing' || status === 'sent'}
                        className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                            ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                            : 'bg-gray-700 hover:bg-gray-600'
                            } ${status === 'sent' ? 'bg-green-600' : ''}`}
                    >
                        {status === 'sent' ? (
                            <CheckCircle className="w-24 h-24 text-white" />
                        ) : isListening ? (
                            <Mic className="w-24 h-24 text-white animate-pulse" />
                        ) : (
                            <MicOff className="w-24 h-24 text-gray-400" />
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        {status === 'idle' && (
                            <p className="text-gray-400">Tap to start listening</p>
                        )}
                        {status === 'listening' && (
                            <p className="text-red-400 animate-pulse text-lg">🎤 Listening... Say "Help" or "Emergency"</p>
                        )}
                        {status === 'processing' && (
                            <p className="text-yellow-400">⏳ Sending SOS...</p>
                        )}
                        {status === 'sent' && (
                            <p className="text-green-400 text-lg">✅ SOS Sent! Help is on the way.</p>
                        )}
                    </div>
                </div>

                {/* Transcript */}
                {transcript && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Volume2 className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-gray-300">You said:</span>
                        </div>
                        <p className="text-lg text-white">"{transcript}"</p>
                    </div>
                )}

                {/* Keywords Help */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
                    <h2 className="font-bold mb-4">🗣️ Trigger Words</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Help', 'Emergency', 'SOS', 'Accident', 'Ambulance', 'Danger'].map(word => (
                            <span key={word} className="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-sm">
                                "{word}"
                            </span>
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-4">
                        Say any of these words and SOS will be sent automatically.
                    </p>
                </div>

                {/* Manual SOS Button */}
                <button
                    onClick={handleManualSOS}
                    disabled={status === 'processing' || status === 'sent'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Manual SOS (No Voice)
                </button>

                {status === 'sent' && (
                    <button
                        onClick={() => { setStatus('idle'); setTranscript(''); }}
                        className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl"
                    >
                        Reset
                    </button>
                )}
            </main>
        </div>
    );
};

export default VoiceSOSPage;
