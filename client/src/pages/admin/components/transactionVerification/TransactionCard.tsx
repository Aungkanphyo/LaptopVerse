import { useState, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Image as ImageIcon,
    Eye,
    Loader2,
    AlertCircle,
    Banknote,
    Smartphone,
    FileText,
} from "lucide-react";
import type { IAdminOrder } from "@/types/order.types";
import { formatPrice } from "@/utils/formatCurrency";

interface TransactionCardProps {
    order: IAdminOrder;
    isVerifying: boolean;
    onApprove: (orderId: string) => void;
    onRejectClick: (order: IAdminOrder) => void;
    onPreviewSlip: (slipUrl: string) => void;
    onViewDetails: (order: IAdminOrder) => void;
}

const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const PaymentStatusBadge = ({ status }: { status?: string }) => {
    switch (status) {
        case "succeeded":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="size-3.5" /> Approved
                </Badge>
            );
        case "failed":
            return (
                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1.5 w-fit">
                    <XCircle className="size-3.5" /> Rejected
                </Badge>
            );
        default:
            return (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1.5 w-fit">
                    <Clock className="size-3.5" /> Pending Verification
                </Badge>
            );
    }
};

const PaymentMethodBadge = ({ isCOD, provider }: { isCOD: boolean; provider?: string }) => {
    if (isCOD) {
        return (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 w-fit">
                <Banknote className="size-3.5" /> Cash on Delivery
            </Badge>
        );
    }

    return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1.5 w-fit">
            <Smartphone className="size-3.5" /> {provider ? `Online Transfer (${provider})` : "Online Transfer"}
        </Badge>
    );
};

export const TransactionCard = memo(
    ({
        order,
        isVerifying,
        onApprove,
        onRejectClick,
        onPreviewSlip,
        onViewDetails,
    }: TransactionCardProps) => {
        const [imgError, setImgError] = useState(false);

        const rawPaymentId = order.paymentInfo?.id || "";
        const isCOD = rawPaymentId.toLowerCase().startsWith("cod");

        // Extract provider name from paymentInfo.id (e.g. "manual:KPay:12345" -> "KPay")
        const paymentParts = rawPaymentId.split(":");
        const providerName = paymentParts.length >= 2 && paymentParts[0] === "manual" ? paymentParts[1] : undefined;

        return (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-md overflow-hidden rounded-2xl transition-all hover:border-slate-700">
                {/* Header */}
                <CardHeader className="bg-slate-950/50 border-b border-slate-800/80 py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">
                            #{order._id}
                        </span>
                        <PaymentStatusBadge status={order.paymentInfo?.status} />

                        <PaymentMethodBadge isCOD={isCOD} provider={providerName} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(order)}
                            className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 gap-1.5 rounded-lg h-7 px-2.5"
                        >
                            <FileText className="size-3.5" /> View Details
                        </Button>
                        <span className="text-xs text-slate-400">
                            {formatDate(order.createdAt)}
                        </span>
                    </div>

                </CardHeader>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Details & Total Amount */}
                    <div className="space-y-2 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="size-3.5 text-blue-400" /> Customer Details
                        </div>
                        <p className="font-bold text-base text-white truncate">
                            {order.user?.fullName || order.user?.name || "Customer"}
                        </p>
                        <p className="text-sm text-slate-400 truncate">
                            {order.user?.email || "No Email"}
                        </p>
                        <p className="text-xs text-slate-400">
                            Phone: {order.shippingInfo?.phoneNo || "N/A"}
                        </p>
                        <p className="text-sm font-bold pt-2 border-t border-slate-800/60 text-slate-300">
                            Total Amount:{" "}
                            <span className="text-blue-400 font-extrabold">
                                {formatPrice(order.totalPrice || 0)}
                            </span>
                        </p>
                    </div>

                    <div className="space-y-2 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            {isCOD ? (
                                <>
                                    <Banknote className="size-3.5 text-emerald-400" /> Payment Info
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="size-3.5 text-emerald-400" /> Payment Slip
                                </>
                            )}
                        </div>

                        {/* If Cash on Delivery Order */}
                        {isCOD ? (
                            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                    <Banknote className="size-4 shrink-0" />
                                    <span>Cash On Delivery Order</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Pay cash directly upon package arrival. No payment slip required.
                                </p>
                            </div>
                        ) : order.paymentInfo?.slipUrl && !imgError ? (
                            /* If Online Transfer with Slip Uploaded */
                            <button
                                type="button"
                                onClick={() => onPreviewSlip(order.paymentInfo!.slipUrl!)}
                                aria-label="Preview payment slip image"
                                className="group relative block text-left overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 hover:border-blue-500 transition-all w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <img
                                    src={order.paymentInfo.slipUrl}
                                    alt="Payment Slip Thumbnail"
                                    onError={() => setImgError(true)}
                                    className="h-16 w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white gap-1">
                                    <Eye className="size-3.5" /> View
                                </div>
                            </button>
                        ) : (
                            /* If Online Transfer with missing or failed slip image */
                            <div className="text-xs text-amber-400/90 italic p-3 bg-amber-950/20 rounded-xl border border-amber-500/20 flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0 text-amber-400" />
                                <span>{imgError ? "Image failed to load" : "No payment slip uploaded"}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center items-stretch md:items-end gap-3">
                        {order.paymentInfo?.status === "pending" ? (
                            <>
                                <Button
                                    onClick={() => onApprove(order._id)}
                                    disabled={isVerifying}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl transition-all shadow-md shadow-emerald-950/20"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="size-4" />
                                    )}
                                    {isCOD ? "Confirm COD Order" : "Approve Payment"}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onRejectClick(order)}
                                    disabled={isVerifying}
                                    className="border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 bg-slate-950/40 gap-2 rounded-xl transition-all"
                                >
                                    <XCircle className="size-4" />
                                    {isCOD ? "Reject Order" : "Reject Payment"}
                                </Button>
                            </>
                        ) : (
                            <div className="text-xs text-slate-400 text-center md:text-right">
                                Status verified on{" "}
                                {formatDate(order.updatedAt || order.createdAt)}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
);

TransactionCard.displayName = "TransactionCard";