import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, AlertTriangle, Clock, CheckCircle, Loader2, Send } from 'lucide-react';

interface TriageResult {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
    recommendation: string;
    suggestedActions: string[];
    estimatedWaitTime: string;
}

const AITriagePage = () => {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<TriageResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Quick symptom buttons
    const quickSymptoms = [
        '🫀 Chest pain',
        '🤕 Severe headache',
        '🩸 Heavy bleeding',
        '😮‍💨 Difficulty breathing',
        '🤢 Severe vomiting',
        '🔥 High fever',
        '💔 Heart palpitations',
        '🦵 Fracture/broken bone',
    ];



    const analyzeSymptomsWithAI = async (symptomText: string): Promise<TriageResult> => {
        const lowerText = symptomText.toLowerCase().trim();

        // 🚨 SAFETY FIRST: Local Priority Check (Offline & Fast)
        // We always check for life-threatening keywords LOCALLY to ensure 0 latency for critical cases
        const criticalKeywords = ['chest pain', 'heart attack', 'not breathing', 'unconscious', 'stroke', 'severe bleeding', 'choking', 'crushing', 'blue lips'];
        if (criticalKeywords.some(k => lowerText.includes(k))) {
            return {
                severity: 'critical',
                recommendation: 'IMMEDIATE EMERGENCY - Detected critical symptoms',
                suggestedActions: [
                    'Call emergency services (108) immediately',
                    'Do not drive yourself to the hospital',
                    'Keep the person calm and still',
                    'Unlock the front door for paramedics'
                ],
                estimatedWaitTime: '0 minutes (Immediate)'
            };
        }

        // 1. Handle Greetings logic
        if (lowerText.length < 3 || ['hi', 'hello', 'hey', 'test', 'yo'].includes(lowerText)) {
            return {
                severity: 'unknown',
                recommendation: 'Please describe your symptoms.',
                suggestedActions: [
                    'Tell us where it hurts',
                    'Describe the type of pain',
                    'Mention any bleeding or difficulty breathing'
                ],
                estimatedWaitTime: 'N/A'
            };
        }

        // 🤖 CALL FREE AI (Pollinations.ai - No Key Required)
        try {
            const systemPrompt = "You are a medical triage AI. Analyze symptoms and output JSON only.";
            const userPrompt = `Analyze: "${symptomText}". Respond ONLY with this JSON structure: {"severity": "critical"|"high"|"medium"|"low", "recommendation": "string", "suggestedActions": ["string"], "estimatedWaitTime": "string"}`;

            const finalPrompt = `${systemPrompt} ${userPrompt}`;

            // Using Pollinations.ai free text API (GET request)
            const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`);

            if (!response.ok) throw new Error('Network response was not ok');

            const textResponse = await response.text();

            // Clean markdown and find JSON
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in response");

            const aiResult = JSON.parse(jsonMatch[0]);

            // Validate severity
            if (!['critical', 'high', 'medium', 'low', 'unknown'].includes(aiResult.severity)) {
                aiResult.severity = 'medium'; // Safety fallback
            }

            return aiResult;

        } catch (error) {
            console.warn("AI API failed, falling back to local logic:", error);
            // Fallback continues below...
        }

        // 🔙 FALLBACK: Local Keyword Logic (If API fails or no key)
        const highKeywords = ['difficulty breathing', 'heavy bleeding', 'broken bone', 'fracture', 'severe pain', 'allergic reaction', 'burn'];
        const mediumKeywords = ['fever', 'vomiting', 'dizziness', 'headache', 'pain', 'cut'];

        if (highKeywords.some(k => lowerText.includes(k))) return {
            severity: 'high',
            recommendation: 'Urgent care needed - Visit ER within 1 hour',
            suggestedActions: ['Apply pressure to bleeding', 'Immobilize injured area', 'Go to ER'],
            estimatedWaitTime: 'Within 1 hour'
        };

        if (mediumKeywords.some(k => lowerText.includes(k))) return {
            severity: 'medium',
            recommendation: 'Medical attention recommended',
            suggestedActions: ['Rest', 'Hydrate', 'Visit doctor within 24h'],
            estimatedWaitTime: 'Within 24 hours'
        };

        return {
            severity: 'low',
            recommendation: 'Non-urgent - Schedule appointment',
            suggestedActions: ['Monitor symptoms', 'Rest', 'See doctor if worse'],
            estimatedWaitTime: '1-3 days'
        };
    };

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            setError('Please describe your symptoms');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            // Simulate slight delay for UX
            await new Promise(r => setTimeout(r, 1500));
            const triageResult = await analyzeSymptomsWithAI(symptoms);
            setResult(triageResult);
        } catch (err) {
            setError('Failed to analyze symptoms. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleQuickSymptom = (symptom: string) => {
        const cleanSymptom = symptom.replace(/^[^\w]+/, '').trim();
        setSymptoms(prev => prev ? `${prev}, ${cleanSymptom}` : cleanSymptom);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-green-500 text-white';
            case 'unknown': return 'bg-gray-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertTriangle className="w-8 h-8" />;
            case 'high': return <Clock className="w-8 h-8" />;
            case 'medium': return <Clock className="w-8 h-8" />;
            case 'low': return <CheckCircle className="w-8 h-8" />;
            case 'unknown': return <Brain className="w-8 h-8" />;
            default: return null;
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
                            <Brain className="w-6 h-6 text-purple-500" />
                            AI Triage
                        </h1>
                        <p className="text-sm text-gray-400">Smart symptom assessment</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Symptom Input */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
                    <label className="block text-lg font-medium mb-4">
                        Describe your symptoms
                    </label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="E.g., I have chest pain and difficulty breathing..."
                        className="w-full h-32 bg-gray-700 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />

                    {/* Quick Symptoms */}
                    <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickSymptoms.map(symptom => (
                                <button
                                    key={symptom}
                                    onClick={() => handleQuickSymptom(symptom)}
                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-400 text-sm">{error}</div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !symptoms.trim()}
                        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing symptoms...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5" />
                                Analyze Symptoms
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        {/* Severity Banner */}
                        <div className={`p-6 ${getSeverityColor(result.severity)}`}>
                            <div className="flex items-center gap-4">
                                {getSeverityIcon(result.severity)}
                                <div>
                                    <h2 className="text-2xl font-bold uppercase">{result.severity} Priority</h2>
                                    <p className="opacity-90">{result.estimatedWaitTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-2">Recommendation</h3>
                            <p className="text-gray-300">{result.recommendation}</p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6">
                            <h3 className="font-bold text-lg mb-3">Suggested Actions</h3>
                            <ul className="space-y-2">
                                {result.suggestedActions.map((action, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-300">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 bg-gray-700/50 flex gap-4">
                            {result.severity === 'critical' && (
                                <a
                                    href="tel:108"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    📞 Call 108 Now
                                </a>
                            )}
                            <button
                                onClick={() => navigate('/sos')}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Find Nearest Hospital
                            </button>
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>⚠️ This is an AI-assisted tool and not a substitute for professional medical advice.</p>
                    <p>In case of emergency, always call 108 or visit the nearest hospital.</p>
                </div>
            </main>
        </div>
    );
};

export default AITriagePage;
