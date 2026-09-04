import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    useCreateGuideMutation,
    useUpdateGuideMutation,
    type IGuide,
} from "@/features/guides/guideApiSlice";

interface IGuideForm {
    title: string;
    category: string;
    readTime: string;
    image: string;
    summary: string;
    content: string;
    isPublished: boolean;
}

interface GuideFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGuide: IGuide | null;
    onSuccess?: () => void;
}

const GuideFormModal = ({
    isOpen,
    onClose,
    selectedGuide,
    onSuccess,
}: GuideFormModalProps) => {
    const [createGuide, { isLoading: isCreating }] = useCreateGuideMutation();
    const [updateGuide, { isLoading: isUpdating }] = useUpdateGuideMutation();

    const [formData, setFormData] = useState<IGuideForm>(() => ({
        title: selectedGuide?.title || "",
        category: selectedGuide?.category || "Buying Guide",
        readTime: selectedGuide?.readTime || "5 min read",
        image: selectedGuide?.image || "",
        summary: selectedGuide?.summary || "",
        content: selectedGuide?.content || "",
        isPublished: selectedGuide?.isPublished ?? true,
    }));

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedGuide) {
                await updateGuide({ id: selectedGuide._id, data: formData }).unwrap();
                toast.success("Guide updated successfully");
            } else {
                await createGuide(formData).unwrap();
                toast.success("Guide created successfully");
            }
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 my-8">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {selectedGuide ? "Edit Buying Guide" : "Create Buying Guide"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Best Gaming Laptops to Buy in 2026"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Gaming, Business, General"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Read Time</label>
                            <input
                                type="text"
                                placeholder="e.g. 5 min read"
                                value={formData.readTime}
                                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Image URL</label>
                        <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Short Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={2}
                            required
                            placeholder="A brief overview of this guide..."
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Article Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={6}
                            required
                            placeholder="Write full article details here..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="size-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPublished" className="text-xs font-semibold text-gray-700 cursor-pointer">
                            Publish article immediately
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex items-center gap-2"
                        >
                            {(isCreating || isUpdating) && <Loader2 className="size-4 animate-spin" />}
                            {selectedGuide ? "Update Guide" : "Create Guide"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GuideFormModal;