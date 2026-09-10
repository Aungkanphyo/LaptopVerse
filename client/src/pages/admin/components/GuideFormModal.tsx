import { useState } from "react";
import { X, Loader2, ImageIcon, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    useCreateGuideMutation,
    useGetGuideByIdAdminQuery,
    useUpdateGuideMutation,
    type IGuide,
} from "@/features/guides/guideApiSlice";

interface GuideFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGuide: IGuide | null;
    onSuccess?: () => void;
}

interface GuideFormContentProps {
    initialGuide: IGuide | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const GuideFormContent = ({
    initialGuide,
    onClose,
    onSuccess,
}: GuideFormContentProps) => {
    const [createGuide, { isLoading: isCreating }] = useCreateGuideMutation();
    const [updateGuide, { isLoading: isUpdating }] = useUpdateGuideMutation();

    // Direct initial state setup from initialGuide props
    const [formData, setFormData] = useState({
        title: initialGuide?.title || "",
        category: initialGuide?.category || "Buying Guide",
        readTime: initialGuide?.readTime || "5 min read",
        summary: initialGuide?.summary || "",
        content: initialGuide?.content || "",
        isPublished: initialGuide?.isPublished ?? true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(
        initialGuide?.image?.url || ""
    );
    const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setIsImageRemoved(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("category", formData.category);
        data.append("readTime", formData.readTime);
        data.append("summary", formData.summary);
        data.append("content", formData.content);
        data.append("isPublished", String(formData.isPublished));

        if (imageFile) {
            data.append("image", imageFile);
        }
        if (isImageRemoved) {
            data.append("removeImage", "true");
        }

        try {
            if (initialGuide) {
                await updateGuide({ id: initialGuide._id, formData: data }).unwrap();
                toast.success("Guide updated successfully");
            } else {
                await createGuide(data).unwrap();
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Title <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    placeholder="e.g. Best Gaming Laptops to Buy in 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Category <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Gaming, Business, General"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Read Time
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 5 min read"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cover Image (Upload File)
                </label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="relative size-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800/40 overflow-hidden shrink-0 group">
                        {imagePreview ? (
                            <>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="size-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                    title="Remove Image"
                                >
                                    <Trash2 className="size-5 text-rose-400 hover:text-rose-300" />
                                </button>
                            </>
                        ) : (
                            <ImageIcon className="size-8 text-slate-500" />
                        )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                        <Upload className="size-4 text-slate-400" />
                        Choose New Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Short Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                    rows={2}
                    required
                    placeholder="A brief overview of this guide..."
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Article Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                    rows={6}
                    required
                    placeholder="Write full article details here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
                <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="size-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label
                    htmlFor="isPublished"
                    className="text-xs font-semibold text-slate-300 cursor-pointer select-none"
                >
                    Publish article immediately
                </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-slate-300 text-sm font-semibold hover:bg-slate-800 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {(isCreating || isUpdating) && (
                        <Loader2 className="size-4 animate-spin" />
                    )}
                    {initialGuide ? "Update Guide" : "Create Guide"}
                </button>
            </div>
        </form>
    );
};

const GuideFormModal = ({
    isOpen,
    onClose,
    selectedGuide,
    onSuccess,
}: GuideFormModalProps) => {
    const guideId = selectedGuide?._id;
    const { data: fetchedDetail, isLoading: isFetchingDetail } =
        useGetGuideByIdAdminQuery(guideId || "", {
            skip: !isOpen || !guideId,
        });

    if (!isOpen) return null;

    // Generates a unique key so React automatically resets form state when guide changes or fetches completes
    const formKey = selectedGuide
        ? fetchedDetail?.guide?._id || "loading"
        : "create-new";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 my-8 text-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">
                        {selectedGuide ? "Edit Buying Guide" : "Create Buying Guide"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {isFetchingDetail ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                        <Loader2 className="size-8 animate-spin text-blue-500" />
                        <p className="text-xs font-medium">Loading guide details...</p>
                    </div>
                ) : (
                    <GuideFormContent
                        key={formKey}
                        initialGuide={fetchedDetail?.guide || null}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default GuideFormModal;