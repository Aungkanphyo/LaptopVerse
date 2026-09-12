import { useGetPublishedGuidesQuery, type IGuide } from "@/features/guides/guideApiSlice";
import { BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BuyingGuides = () => {
    const { data, isLoading } = useGetPublishedGuidesQuery();
    const [activeGuide, setActiveGuide] = useState<IGuide | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0d18] text-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                        <BookOpen className="size-3.5" /> Laptop Buying Hub
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Confused About Laptop Specs?</h1>
                    <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                        Read our simplified guides to understand hardware specifications before making your choice.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="size-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data?.guides?.map((guide) => (
                            <div 
                                key={guide._id} 
                                className="bg-[#0f172a]/90 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-slate-700/80 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col group"
                            >
                                {guide.image && (
                                    <div className="h-48 overflow-hidden bg-slate-900 border-b border-slate-800/80 relative">
                                        <img 
                                            src={guide.image.url} 
                                            alt={guide.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{guide.category}</span>
                                        <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                            {guide.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-2.5 line-clamp-3 leading-relaxed">{guide.summary}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                            <Clock className="size-3.5 text-slate-500" /> {guide.readTime}
                                        </span>
                                        <button 
                                            onClick={() => setActiveGuide(guide)} 
                                            className="flex items-center gap-1 text-blue-400 font-semibold text-xs hover:text-blue-300 transition-colors group/btn"
                                        >
                                            Read Article <ChevronRight className="size-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Full Article Modal */}
                <Dialog open={!!activeGuide} onOpenChange={() => setActiveGuide(null)}>
                    <DialogContent className="bg-[#0f172a] border border-slate-800 text-slate-100 sm:max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8 rounded-2xl shadow-2xl">
                        <DialogHeader>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{activeGuide?.category}</span>
                            <DialogTitle className="text-2xl font-bold text-white mt-1">{activeGuide?.title}</DialogTitle>
                        </DialogHeader>
                        {activeGuide?.image && (
                            <div className="overflow-hidden rounded-xl border border-slate-800 my-2">
                                <img src={activeGuide.image.url} alt={activeGuide.title} className="w-full h-64 object-cover" />
                            </div>
                        )}
                        <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed mt-2">
                            {activeGuide?.content}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default BuyingGuides;