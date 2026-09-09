import { useState } from "react";
import {
    useGetAllGuidesAdminQuery,
    useDeleteGuideMutation,
    type IGuide,
    useGetGuideByIdAdminQuery,
} from "@/features/guides/guideApiSlice";
import { Plus, Edit2, Trash2, BookOpen, Clock, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import GuideFormModal from "./components/GuideFormModal";

const GuideManagement = () => {
    const [statusFilter, setStatusFilter] = useState<"all" | "drafts" | "published">("all");
    const [page, setPage] = useState<number>(1);
    const limit = 10;

    // get data according to filter and page
    const { data, isLoading, refetch } = useGetAllGuidesAdminQuery({
        status: statusFilter,
        page,
        limit,
    });
    const [deleteGuide, { isLoading: isDeleting }] = useDeleteGuideMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<IGuide | null>(null);

    const [viewGuideId, setViewGuideId] = useState<string | null>(null);
    const { data: detailData, isLoading: isDetailLoading } = useGetGuideByIdAdminQuery(
        viewGuideId || "",
        { skip: !viewGuideId }
    );
    const selectedDetailGuide = detailData?.guide;

    const handleFilterChange = (status: "all" | "drafts" | "published") => {
        setStatusFilter(status);
        setPage(1);
    }

    const handleOpenCreateModal = () => {
        setSelectedGuide(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (guide: IGuide) => {
        setSelectedGuide(guide);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGuide(null);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deleteGuide(id).unwrap();
                toast.success("Guide deleted successfully");
                refetch();
            } catch (err: unknown) {
                const error = err as { data?: { message?: string } };
                toast.error(error?.data?.message || "Failed to delete guide");
            }
        }
    };
    const totalPages = data?.pagination?.pages || 1;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
            {/* IMPROVEMENT: Dark theme Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="size-6 text-blue-500" />
                        Buying Guides Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Create, update, and manage laptop purchasing articles for your customers.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-950/20"
                >
                    <Plus className="size-4" /> Add New Guide
                </button>
            </div>

            {/* IMPROVEMENT: Filter Tab UI */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Filter by Status:</p>
                <div className="inline-flex p-1 bg-slate-900 rounded-2xl border border-slate-800 gap-1">
                    <button
                        onClick={() => handleFilterChange("all")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === "all"
                                ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        All Guides
                    </button>
                    <button
                        onClick={() => handleFilterChange("drafts")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === "drafts"
                                ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Drafts
                    </button>
                    <button
                        onClick={() => handleFilterChange("published")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === "published"
                                ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Published
                    </button>
                </div>
            </div>

            {/* Guide Table Section */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                </div>
            ) : data?.guides && data.guides.length > 0 ? (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 font-semibold">
                                    <th className="py-4 px-6">Guide Info</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Read Time</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                {data.guides.map((guide) => (
                                    <tr key={guide._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {guide.image ? (
                                                    <img
                                                        src={guide.image.url}
                                                        alt={guide.title}
                                                        className="size-12 rounded-lg object-cover border border-slate-800 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="size-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                                        <BookOpen className="size-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-white line-clamp-1">
                                                        {guide.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                        {guide.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                                                {guide.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-3.5 text-slate-500" />
                                                {guide.readTime}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {guide.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <Eye className="size-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <EyeOff className="size-3" /> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewGuideId(guide._id)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="View Guide Detail"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEditModal(guide)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Edit Guide"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(guide._id, guide.title)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Delete Guide"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-950/40 border-t border-slate-800">
                        <p className="text-xs text-slate-400">
                            Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{" "}
                            <span className="font-semibold text-slate-200">
                                {Math.min(page * limit, data?.pagination?.total || 0)}
                            </span>{" "}
                            of <span className="font-semibold text-slate-200">{data?.pagination?.total || 0}</span> guides
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="text-xs font-semibold text-slate-300 px-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                    <BookOpen className="size-12 mx-auto text-slate-600 mb-3" />
                    <h3 className="text-base font-semibold text-slate-200">No Buying Guides Found</h3>
                    <p className="text-sm text-slate-400 mt-1">Start creating articles to help customers select laptops.</p>
                </div>
            )}

            <GuideFormModal
                key={selectedGuide?._id || (isModalOpen ? "create-open" : "modal-closed")}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedGuide={selectedGuide}
                onSuccess={refetch}
            />

            {/* IMPROVEMENT: Dark Theme Detail Modal Dialog */}
            <Dialog open={!!viewGuideId} onOpenChange={(open) => !open && setViewGuideId(null)}>
                <DialogContent className="bg-slate-900 text-slate-100 border-slate-800 sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
                            <BookOpen className="size-5 text-blue-500" /> Guide Detail
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            View full details and content of the selected buying guide.
                        </DialogDescription>
                    </DialogHeader>

                    {isDetailLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="size-8 animate-spin text-blue-500" />
                        </div>
                    ) : selectedDetailGuide ? (
                        <div className="space-y-5 pt-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/50">
                                    {selectedDetailGuide.category}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="size-3.5 text-slate-500" />
                                    {selectedDetailGuide.readTime}
                                </span>
                                {selectedDetailGuide.isPublished ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <Eye className="size-3" /> Published
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <EyeOff className="size-3" /> Draft
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white leading-snug">
                                {selectedDetailGuide.title}
                            </h2>

                            {selectedDetailGuide.image && (
                                <img
                                    src={selectedDetailGuide.image.url}
                                    alt={selectedDetailGuide.title}
                                    className="w-full max-h-72 object-cover rounded-xl border border-slate-800"
                                />
                            )}

                            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50">
                                <p className="text-xs font-bold text-blue-400 mb-1">Summary</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{selectedDetailGuide.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-200 mb-2">Article Content</h3>
                                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                    {selectedDetailGuide.content || "No content provided."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-slate-400 py-10">Guide details not found.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideManagement;