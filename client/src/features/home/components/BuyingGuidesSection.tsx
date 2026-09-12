import { useGetPublishedGuidesQuery, type IGuide } from '@/features/guides/guideApiSlice';
import { BookOpen, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BuyingGuidesSection = () => {
    const { data, isLoading } = useGetPublishedGuidesQuery();
    const [activeGuide, setActiveGuide] = useState<IGuide | null>(null);
    const displayedGuides = data?.guides?.slice(0, 3) || [];
    return (
        <section id="buying-guides" className="py-16 bg-[#0a0d18] border-t border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-bold tracking-wider uppercase mb-3">
                    <BookOpen className="size-3" />
                    <span>LAPTOP BUYING HUB</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">Confused About Laptop Specs?</h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
                    Read our simplified articles to understand hardware components before spending your hard-earned money.
                </p>

                {/* API Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="size-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    /* Guides Grid Container */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
                        {displayedGuides.map((guide) => (
                            <div
                                key={guide._id}
                                onClick={() => setActiveGuide(guide)}
                                className="rounded-2xl bg-[#0e1322] border border-slate-800/80 overflow-hidden group hover:border-slate-700 transition-all flex flex-col cursor-pointer"
                            >
                                {guide.image?.url ? (
                                    <>
                                        <div className="h-40 bg-slate-800 overflow-hidden relative">
                                            <img
                                                src={guide.image.url}
                                                alt={guide.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <span className="absolute top-3 left-3 bg-slate-900/80 text-xs px-2.5 py-1 rounded-md text-slate-300 font-medium backdrop-blur-md uppercase">
                                                {guide.category}
                                            </span>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                            <div className="space-y-2">
                                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                    <Clock className="size-3" /> {guide.readTime}
                                                </span>
                                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {guide.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 line-clamp-2">
                                                    {guide.summary}
                                                </p>
                                            </div>
                                            <div className="pt-2 flex items-center text-blue-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                                                <span>Read Article</span>
                                                <ChevronRight className="size-4 ml-1" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 flex-1 flex flex-col justify-between min-h-65">
                                        <div className="space-y-3">
                                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                                                {guide.category}
                                            </span>
                                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                                {guide.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                                                {guide.summary}
                                            </p>
                                        </div>
                                        
                                        <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="size-3.5" /> {guide.readTime}
                                            </span>
                                            <div className="flex items-center text-blue-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                                                <span>Read Article</span>
                                                <ChevronRight className="size-4 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && (
                    <div className="mt-12 text-center">
                        <Link
                            to="/buying-guides"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                        >
                            <span>See More Guides</span>
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>
                )}
            </div>

            <Dialog open={!!activeGuide} onOpenChange={(open) => !open && setActiveGuide(null)}>
                <DialogContent className="bg-[#0e1322] border-slate-800 text-slate-100 sm:max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8">
                    <DialogHeader>
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                            {activeGuide?.category}
                        </span>
                        <DialogTitle className="text-2xl font-bold text-white mt-1">
                            {activeGuide?.title}
                        </DialogTitle>
                    </DialogHeader>
                    {activeGuide?.image?.url && (
                        <img
                            src={activeGuide.image.url}
                            alt={activeGuide.title}
                            className="w-full h-64 object-cover rounded-xl border border-slate-800 my-4"
                        />
                    )}
                    <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                        {activeGuide?.content}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default BuyingGuidesSection;