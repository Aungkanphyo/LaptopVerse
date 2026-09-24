import { useState, memo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";
import type { IAdminOrder } from "@/features/orders/orderApiSlice";

interface RejectReasonModalProps {
    isOpen: boolean;
    order: IAdminOrder;
    rejectionReason: string;
    onReasonChange: (value: string) => void;
    isVerifying: boolean;
    onSubmit: () => void;
    onClose: () => void;
}

export const RejectReasonModal = memo(
    ({
        isOpen,
        order,
        rejectionReason,
        onReasonChange,
        isVerifying,
        onSubmit,
        onClose,
    }: RejectReasonModalProps) => {
        const [isReviewed, setIsReviewed] = useState(false);

        const handleReasonChange = (value: string) => {
            setIsReviewed(false);
            onReasonChange(value);
        };

        const isSubmitDisabled = isVerifying || !rejectionReason.trim() || !isReviewed;

        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && !isVerifying && onClose()}>
                <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100 rounded-2xl p-6 shadow-2xl">
                    <DialogHeader className="border-b border-slate-800 pb-3">
                        <DialogTitle className="flex items-center gap-2.5 text-rose-400 text-lg font-bold">
                            <XCircle className="size-6 shrink-0" /> Reject Payment Verification
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Please specify the reason for rejecting Order{" "}
                            <span className="font-mono font-bold text-white">#{order._id}</span>. An email notification will be sent to{" "}
                            <span className="font-semibold text-slate-200">
                                {order.user?.email || "the customer"}
                            </span>.
                        </p>

                        <div className="space-y-2">
                            <label
                                htmlFor="rejection-reason"
                                className="text-xs font-semibold text-slate-400 uppercase tracking-wider block"
                            >
                                Rejection Reason
                            </label>
                            <Textarea
                                id="rejection-reason"
                                rows={4}
                                placeholder="e.g. Invalid transaction reference number or amount mismatch..."
                                value={rejectionReason}
                                onChange={(e) => handleReasonChange(e.target.value)}
                                disabled={isVerifying}
                                className="bg-slate-950 text-slate-100 border-slate-800 focus-visible:ring-rose-500 rounded-xl resize-none"
                            />
                        </div>

                        {/* Admin Double-Check Confirmation */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="confirm-reason-check"
                                checked={isReviewed}
                                onChange={(e) => setIsReviewed(e.target.checked)}
                                disabled={!rejectionReason.trim() || isVerifying}
                                className="mt-0.5 size-4 rounded border-slate-700 bg-slate-950 accent-rose-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <label
                                htmlFor="confirm-reason-check"
                                className={`text-xs leading-relaxed select-none ${
                                    !rejectionReason.trim() || isVerifying
                                        ? "text-slate-500 cursor-not-allowed"
                                        : "text-amber-200/90 cursor-pointer"
                                }`}
                            >
                                <span className="font-semibold text-amber-400 items-center gap-1 inline-flex mr-1">
                                    <AlertTriangle className="size-3.5" /> Double Check:
                                </span>
                                I have verified the rejection reason and confirm sending this email notification to the customer.
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t border-slate-800 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isVerifying}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={onSubmit}
                            disabled={isSubmitDisabled}
                            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white min-w-32 flex items-center justify-center gap-2 rounded-xl transition-all"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Rejecting...</span>
                                </>
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
);

RejectReasonModal.displayName = "RejectReasonModal";