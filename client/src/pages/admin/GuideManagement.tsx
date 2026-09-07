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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="size-6 text-blue-600" />
                        Buying Guides Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Create, update, and manage laptop purchasing articles for your customers.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus className="size-4" /> Add New Guide
                </button>
            </div>
            {/* Status filter tab ui */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Filter by Status:</p>
                <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200/60 gap-1">
                    <button
                        onClick={() => handleFilterChange("all")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "all"
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200/80"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        All Guides
                    </button>
                    <button
                        onClick={() => handleFilterChange("drafts")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "drafts"
                            ? "bg-white text-blue-600 shadow-sm border border-gray-200/80"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Drafts
                    </button>
                    <button
                        onClick={() => handleFilterChange("published")}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "published"
                            ? "bg-white text-blue-600 shadow-sm border border-gray-200/80"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Published
                    </button>
                </div>
            </div>

            {/* Guide Content Table / List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
            ) : data?.guides && data.guides.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                                    <th className="py-4 px-6">Guide Info</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Read Time</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {data.guides.map((guide) => (
                                    <tr key={guide._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {guide.image ? (
                                                    <img
                                                        src={guide.image.url}
                                                        alt={guide.title}
                                                        className="size-12 rounded-lg object-cover border border-gray-100 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                                        <BookOpen className="size-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900 line-clamp-1">
                                                        {guide.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                        {guide.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                {guide.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-3.5 text-gray-400" />
                                                {guide.readTime}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {guide.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <Eye className="size-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                                    <EyeOff className="size-3" /> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewGuideId(guide._id)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Guide Detail"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEditModal(guide)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Guide"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(guide._id, guide.title)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    {/* pagination control ui */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}</span> to{" "}
                            <span className="font-semibold text-gray-900">
                                {Math.min(page * limit, data?.pagination?.total || 0)}
                            </span>{" "}
                            of <span className="font-semibold text-gray-900">{data?.pagination?.total || 0}</span> guides
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="text-xs font-semibold text-gray-700 px-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <BookOpen className="size-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-900">No Buying Guides Found</h3>
                    <p className="text-sm text-gray-500 mt-1">Start creating articles to help customers select laptops.</p>
                </div>
            )}

            <GuideFormModal
                key={selectedGuide?._id || (isModalOpen ? "create-open" : "modal-closed")}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedGuide={selectedGuide}
                onSuccess={refetch}
            />
            {/* dialog pop-up component */}
            <Dialog open={!!viewGuideId} onOpenChange={(open) => !open && setViewGuideId(null)}>
                <DialogContent className="bg-white sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <BookOpen className="size-5 text-blue-600" /> Guide Detail
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            View full details and content of the selected buying guide.
                        </DialogDescription>
                    </DialogHeader>

                    {isDetailLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="size-8 animate-spin text-blue-600" />
                        </div>
                    ) : selectedDetailGuide ? (
                        <div className="space-y-5 pt-2">
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                                    {selectedDetailGuide.category}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="size-3.5 text-gray-400" />
                                    {selectedDetailGuide.readTime}
                                </span>
                                {selectedDetailGuide.isPublished ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        <Eye className="size-3" /> Published
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                        <EyeOff className="size-3" /> Draft
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-gray-900 leading-snug">
                                {selectedDetailGuide.title}
                            </h2>

                            {/* Image */}
                            {selectedDetailGuide.image && (
                                <img
                                    src={selectedDetailGuide.image.url}
                                    alt={selectedDetailGuide.title}
                                    className="w-full max-h-72 object-cover rounded-xl border border-gray-100"
                                />
                            )}

                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                                <p className="text-xs font-bold text-blue-900 mb-1">Summary</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{selectedDetailGuide.summary}</p>
                            </div>

                            {/* Full Content */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Article Content</h3>
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    {selectedDetailGuide.content || "No content provided."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-10">Guide details not found.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideManagement;