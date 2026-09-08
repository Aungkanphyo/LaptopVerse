const AboutSection = () => {
    return (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0e1322] border border-slate-800/80 space-y-6">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">About LaptopVerse</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Your Trusted Tech Advisor & Retail Partner</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                    Founded with the mission to simplify laptop buying, LaptopVerse curates high-grade machines tailored for software engineers, digital creators, gamers, and modern remote workers. We eliminate hardware confusion by matching your specific workload with the perfect specifications.
                </p>

                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/80 max-w-lg">
                    <div>
                        <h4 className="text-lg font-black text-white">10,000+</h4>
                        <p className="text-[11px] text-slate-500">Happy Customers</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white">100%</h4>
                        <p className="text-[11px] text-slate-500">Official Warranty</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white">24/7</h4>
                        <p className="text-[11px] text-slate-500">Technical Consultation</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;