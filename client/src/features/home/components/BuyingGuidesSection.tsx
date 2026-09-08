import { BookOpen } from 'lucide-react';

const BuyingGuidesSection = () => {
    return (
        <section className="py-16 bg-[#0a0d18] border-t border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-bold tracking-wider uppercase mb-3">
                    <BookOpen className="size-3" />
                    <span>LAPTOP BUYING HUB</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white">Confused About Laptop Specs?</h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
                    Read our simplified articles to understand hardware components before spending your hard-earned money.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
                    {/* Guide Card 1 */}
                    <div className="rounded-2xl bg-[#0e1322] border border-slate-800/80 overflow-hidden group hover:border-slate-700 transition-all cursor-pointer">
                        <div className="h-40 bg-slate-800 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80" alt="Guide 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute top-3 left-3 bg-slate-900/80 text-xs px-2.5 py-1 rounded-md text-slate-300 font-medium backdrop-blur-md">Buying Guide</span>
                        </div>
                        <div className="p-5 space-y-2">
                            <span className="text-[11px] text-slate-500 font-medium">5 min read</span>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                How to Choose the Right Laptop in 2026: A Beginner Guide
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2">
                                Learn how to pick processor, RAM, and screen size without overspending.
                            </p>
                        </div>
                    </div>

                    {/* Guide Card 2 */}
                    <div className="rounded-2xl bg-[#0e1322] border border-slate-800/80 overflow-hidden group hover:border-slate-700 transition-all cursor-pointer">
                        <div className="h-40 bg-slate-800 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80" alt="Guide 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute top-3 left-3 bg-slate-900/80 text-xs px-2.5 py-1 rounded-md text-slate-300 font-medium backdrop-blur-md">Tech Explained</span>
                        </div>
                        <div className="p-5 space-y-2">
                            <span className="text-[11px] text-slate-500 font-medium">6 min read</span>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                Intel vs AMD vs Apple Silicon: Which CPU Fits You Best?
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2">
                                Compare power consumption, battery performance, and raw speed across chipmakers.
                            </p>
                        </div>
                    </div>

                    {/* Guide Card 3 */}
                    <div className="rounded-2xl bg-[#0e1322] border border-slate-800/80 overflow-hidden group hover:border-slate-700 transition-all cursor-pointer">
                        <div className="h-40 bg-slate-800 overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80" alt="Guide 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute top-3 left-3 bg-slate-900/80 text-xs px-2.5 py-1 rounded-md text-slate-300 font-medium backdrop-blur-md">Hardware Basics</span>
                        </div>
                        <div className="p-5 space-y-2">
                            <span className="text-[11px] text-slate-500 font-medium">4 min read</span>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                How Much RAM & SSD Storage Do You Really Need?
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2">
                                Avoid buying underpowered laptops or paying for specs you will never utilize.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BuyingGuidesSection;