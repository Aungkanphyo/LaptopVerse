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
} from "lucide-react";
import type { IAdminOrder } from "@/features/orders/orderApiSlice";

interface TransactionCardProps {
    order: IAdminOrder;
    isVerifying: boolean;
    onApprove: (orderId: string) => void;
    onRejectClick: (order: IAdminOrder) => void;
    onPreviewSlip: (slipUrl: string) => void;
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

export const TransactionCard = memo(
    ({
        order,
        isVerifying,
        onApprove,
        onRejectClick,
        onPreviewSlip,
    }: TransactionCardProps) => {
        const [imgError, setImgError] = useState(false);

        return (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-md overflow-hidden rounded-2xl transition-all hover:border-slate-700">
                <CardHeader className="bg-slate-950/50 border-b border-slate-800/80 py-3 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-400">
                            #{order._id}
                        </span>
                        <PaymentStatusBadge status={order.paymentInfo?.status} />
                    </div>
                    <span className="text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                    </span>
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
                                {Number(order.totalPrice || 0).toLocaleString()} MMK
                            </span>
                        </p>
                    </div>

                    {/* Payment Slip Image Thumbnail */}
                    <div className="space-y-2 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="size-3.5 text-emerald-400" /> Payment Slip
                        </div>

                        {order.paymentInfo?.slipUrl && !imgError ? (
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
                            <div className="text-xs text-slate-500 italic p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0 text-slate-600" />
                                <span>{imgError ? "Image failed to load" : "No slip image uploaded"}</span>
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
                                    Approve Payment
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onRejectClick(order)}
                                    disabled={isVerifying}
                                    className="border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 bg-slate-950/40 gap-2 rounded-xl transition-all"
                                >
                                    <XCircle className="size-4" /> Reject Payment
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