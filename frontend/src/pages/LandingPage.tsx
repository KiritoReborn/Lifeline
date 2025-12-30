import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, Siren, ShieldCheck, Radio, Mic, Brain } from 'lucide-react';
import heroImage from '../assets/landing-page-hero.png';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Lifeline</h1>
                            <p className="text-xs text-gray-500 font-medium">Emergency Response Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Profile/Language placeholders if needed */}
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide uppercase mb-6">
                            ● System Operational
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                            Stay Safe, Citizen.<br />
                            <span className="text-blue-600">Help is available.</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                            Connect with local emergency services instantly. Our network is designed to work even when every second counts.
                        </p>
                    </div>
                    <div className="lg:w-1/2">
                        {/* New Hero Image */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <img src={heroImage} alt="Emergency Response" className="w-full h-auto object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Emergency Services</h2>
                            <p className="text-gray-500 mt-1">Quick access to essential resources.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Hospital List Card */}
                        <div
                            onClick={() => navigate('/hospitals')}
                            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col justify-between h-[280px]"
                        >
                            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors mb-4">
                                <Building2 className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hospital List</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    View hospitals, check capacity, and find facilities near you.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                                View Directory →
                            </div>
                        </div>

                        {/* Hospital Login Card */}
                        <div
                            onClick={() => navigate('/login')}
                            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col justify-between h-[280px]"
                        >
                            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors mb-4">
                                <LogIn className="w-7 h-7 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hospital Login</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Staff access to manage beds and update status.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                                Access Portal →
                            </div>
                        </div>

                        {/* Offline Mesh Card */}
                        <div className="relative group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-[280px]">
                            <div className="absolute -bottom-12 -right-12">
                                <div className="bg-purple-500 w-40 h-40 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors mb-4">
                                    <Radio className="w-7 h-7 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Offline Mesh</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Works without internet. Syncs when online.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/mesh')}
                                    className="mt-4 w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm"
                                >
                                    <Radio className="w-4 h-4" />
                                    <span>OPEN MESH</span>
                                </button>
                            </div>
                        </div>

                        {/* Voice SOS Card */}
                        <div className="relative group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-[280px]">
                            <div className="absolute -bottom-12 -right-12">
                                <div className="bg-orange-500 w-40 h-40 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors mb-4">
                                    <Mic className="w-7 h-7 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Voice SOS</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Hands-free emergency activation. Just say "Help".
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/voice-sos')}
                                    className="mt-4 w-full py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm"
                                >
                                    <Mic className="w-4 h-4" />
                                    <span>OPEN VOICE SOS</span>
                                </button>
                            </div>
                        </div>

                        {/* AI Triage Card */}
                        <div className="relative group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-[280px]">
                            <div className="absolute -bottom-12 -right-12">
                                <div className="bg-teal-500 w-40 h-40 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div className="bg-teal-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 transition-colors mb-4">
                                    <Brain className="w-7 h-7 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">AI Triage</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Check symptoms and get instant emergency guidance.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/triage')}
                                    className="mt-4 w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm"
                                >
                                    <Brain className="w-4 h-4" />
                                    <span>CHECK SYMPTOMS</span>
                                </button>
                            </div>
                        </div>

                        {/* Emergency SOS Card */}
                        <div className="relative group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-[280px]">
                            <div className="absolute -bottom-12 -right-12">
                                <div className="bg-red-500 w-40 h-40 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors mb-4">
                                    <Siren className="w-7 h-7 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Emergency SOS</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Instant route to nearest hospital.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/sos')}
                                    className="mt-4 w-full py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm"
                                >
                                    <Siren className="w-4 h-4 animate-pulse" />
                                    <span>ACTIVATE SOS</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Lifeline Emergency Response System. Government Access Only.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
