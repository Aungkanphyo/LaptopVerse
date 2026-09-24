import { useState, memo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Image as ImageIcon, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";

interface SlipImageModalProps {
    imageUrl: string;
    isOpen?: boolean;
    onClose: () => void;
}

export const SlipImageModal = memo(
    ({ imageUrl, isOpen = true, onClose }: SlipImageModalProps) => {
        const [isLoading, setIsLoading] = useState(true);
        const [isError, setIsError] = useState(false);

        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 rounded-2xl p-5 text-white shadow-2xl">
                    <DialogHeader className="pb-3 border-b border-slate-800">
                        <DialogTitle className="font-bold text-white text-base flex items-center gap-2">
                            <ImageIcon className="size-5 text-emerald-400" /> Payment Slip Image
                        </DialogTitle>
                    </DialogHeader>

                    {/* Image Container with Loading & Error States */}
                    <div className="mt-4 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 min-h-64 max-h-[70vh] overflow-auto border border-slate-800 relative">
                        {isLoading && !isError && (
                            <div className="flex flex-col items-center gap-2 text-slate-400 my-12">
                                <Loader2 className="size-8 animate-spin text-blue-500" />
                                <span className="text-xs">Loading payment slip...</span>
                            </div>
                        )}

                        {isError ? (
                            <div className="flex flex-col items-center gap-2 text-rose-400 my-12 text-center">
                                <AlertTriangle className="size-10" />
                                <p className="text-sm font-semibold">Failed to load slip image</p>
                                <p className="text-xs text-slate-500">The image URL might be expired or invalid.</p>
                            </div>
                        ) : (
                            <img
                                src={imageUrl}
                                alt="Payment Slip Full View"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false);
                                    setIsError(true);
                                }}
                                className={`max-h-[65vh] w-auto object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                                    isLoading ? "opacity-0 absolute" : "opacity-100"
                                }`}
                            />
                        )}
                    </div>

                    {/* Footer Section */}
                    {!isError && (
                        <div className="mt-4 flex justify-end">
                            <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 py-2 px-3 rounded-xl bg-blue-950/40 border border-blue-800/50 transition-colors"
                            >
                                <ExternalLink className="size-3.5" /> Open Full Image
                            </a>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    }
);

SlipImageModal.displayName = "SlipImageModal";