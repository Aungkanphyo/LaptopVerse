import { ArrowRight, ShieldCheck, Truck, RotateCcw, Bot } from 'lucide-react';

const HeroSection = () => {
    return (
        <section id="ai-matchmaker" className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    Find the Perfect Laptop <br />
                    <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Tailored to Your Workflow
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Unsure which specs suit your work or gaming? Describe your needs to our AI Advisor or compare top laptops side by side.
                </p>

                {/* Hero CTA Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
                    <button className="px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 group cursor-pointer">
                        <span>Ask AI Matchmaker</span>
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#explore" className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all">
                        Browse Laptops
                    </a>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
                    <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white">100% Genuine</h4>
                            <p className="text-[11px] text-slate-400">Official Brand Warranty</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Truck className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white">Express Delivery</h4>
                            <p className="text-[11px] text-slate-400">Safe & Insured Shipping</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                            <RotateCcw className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white">Easy Returns</h4>
                            <p className="text-[11px] text-slate-400">30-Day Hassle-Free</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                            <Bot className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white">AI Tech Support</h4>
                            <p className="text-[11px] text-slate-400">Instant Specs Advice</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;