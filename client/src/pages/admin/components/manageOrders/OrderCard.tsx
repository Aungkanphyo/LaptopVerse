import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    User,
    MapPin,
    Calendar,
    FileText,
} from "lucide-react";
import { formatPrice } from "@/utils/formatCurrency";
import type { IAdminOrder } from "@/types/order.types";

interface OrderCardProps {
    order: IAdminOrder;
    onUpdateStatus: (order: IAdminOrder) => void;
    onViewDetails: (order: IAdminOrder) => void;
}

const renderOrderStatusBadge = (status: string) => {
    switch (status) {
        case "Delivered":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> Delivered
                </Badge>
            );
        case "Shipped":
            return (
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 flex items-center gap-1.5">
                    <Truck className="size-3.5" /> Shipped
                </Badge>
            );
        case "Cancelled":
            return (
                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1.5">
                    <XCircle className="size-3.5" /> Cancelled
                </Badge>
            );
        default:
            return (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1.5">
                    <Package className="size-3.5" /> Processing
                </Badge>
            );
    }
};

export const OrderCard = memo(({ order, onUpdateStatus, onViewDetails }: OrderCardProps) => {
    const isFinalized = order.orderStatus === "Delivered" || order.orderStatus === "Cancelled";

    return (
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-md overflow-hidden rounded-2xl transition-all hover:border-slate-700">
            <CardHeader className="bg-slate-950/50 border-b border-slate-800/80 py-3 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400">
                        #{order._id}
                    </span>
                    {renderOrderStatusBadge(order.orderStatus)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="size-3.5" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Customer Details */}
                <div className="space-y-1.5 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="size-3.5 text-blue-400" /> Customer
                    </div>
                    <p className="font-bold text-white text-sm truncate">
                        {order.user?.fullName || order.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{order.user?.email}</p>
                    <p className="text-xs text-slate-400">Ph: {order.shippingInfo?.phoneNo}</p>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-amber-400" /> Address
                    </div>
                    <p className="text-xs text-slate-300 font-medium line-clamp-2">
                        {order.shippingInfo?.address}, {order.shippingInfo?.city}
                    </p>
                    {order.trackingInfo?.courierName && (
                        <p className="text-xs text-purple-400 font-mono pt-1">
                            Courier: {order.trackingInfo.courierName} ({order.trackingInfo.trackingNumber || "No ID"})
                        </p>
                    )}
                </div>

                {/* Items & Total */}
                <div className="space-y-1.5 border-r-0 md:border-r border-slate-800 pr-0 md:pr-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="size-3.5 text-emerald-400" /> Items ({order.orderItems?.length || 0})
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                        {order.orderItems?.[0]?.name} {order.orderItems.length > 1 ? `+${order.orderItems.length - 1} more` : ""}
                    </p>
                    <p className="text-sm font-bold text-blue-400 pt-1">
                        Total: {formatPrice(order.totalPrice)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center items-stretch md:items-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(order)}
                        className="border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl gap-1.5 text-xs"
                    >
                        <FileText className="size-3.5" /> View Full Details
                    </Button>

                    {!isFinalized ? (
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onUpdateStatus(order)}
                            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl gap-1.5 text-xs shadow-md shadow-purple-950/20"
                        >
                            <Truck className="size-3.5" /> Update Status
                        </Button>
                    ) : (
                        <div className="text-[11px] text-slate-500 italic text-center md:text-right">
                            Finalized status
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

OrderCard.displayName = "OrderCard";