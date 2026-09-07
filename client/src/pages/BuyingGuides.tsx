import { useGetPublishedGuidesQuery, type IGuide } from "@/features/guides/guideApiSlice";
import { BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BuyingGuides = () => {
  const { data, isLoading } = useGetPublishedGuidesQuery();
  const [activeGuide, setActiveGuide] = useState<IGuide | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase mb-3">
          <BookOpen className="size-3.5" /> Laptop Buying Hub
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Confused About Laptop Specs?</h1>
        <p className="text-gray-500 text-sm mt-2">
          Read our simplified guides to understand hardware specifications before making your choice.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data?.guides?.map((guide) => (
            <div key={guide._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col group">
              {guide.image && (
                <div className="h-48 overflow-hidden">
                  <img src={guide.image.url} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-blue-600 font-semibold uppercase">{guide.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{guide.title}</h3>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-3">{guide.summary}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="size-3" /> {guide.readTime}</span>
                  <button onClick={() => setActiveGuide(guide)} className="flex items-center gap-1 text-blue-600 font-semibold text-xs hover:underline">
                    Read Article <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Article Modal */}
      <Dialog open={!!activeGuide} onOpenChange={() => setActiveGuide(null)}>
        <DialogContent className="bg-white sm:max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8">
          <DialogHeader>
            <span className="text-xs font-semibold text-blue-600 uppercase">{activeGuide?.category}</span>
            <DialogTitle className="text-2xl font-bold">{activeGuide?.title}</DialogTitle>
          </DialogHeader>
          {activeGuide?.image && <img src={activeGuide.image.url} alt={activeGuide.title} className="w-full h-56 object-cover rounded-xl" />}
          <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{activeGuide?.content}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyingGuides;