import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    Package, 
    User, 
    MapPin, 
    CreditCard, 
    Phone, 
    Mail,
    Banknote, 
    Smartphone,
    ExternalLink
} from "lucide-react";
import { formatPrice } from "@/utils/formatCurrency";
import type { IAdminOrder } from "@/features/orders/orderApiSlice";

interface OrderDetailModalProps {
    order: IAdminOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onPreviewSlip?: (slipUrl: string) => void;
}

export const OrderDetailModal = ({
    order,
    isOpen,
    onClose,
    onPreviewSlip,
}: OrderDetailModalProps) => {
    if (!order) return null;

    const rawPaymentId = order.paymentInfo?.id || "";
    const isCOD = rawPaymentId.toLowerCase().startsWith("cod");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
                {/* Modal Header */}
                <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Package className="size-5 text-blue-400" /> Order Details
                        </DialogTitle>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                            ID: #{order._id}
                        </p>
                    </div>
                    <Badge
                        className={
                            order.orderStatus === "Delivered"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : order.orderStatus === "Cancelled"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }
                    >
                        {order.orderStatus}
                    </Badge>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* Customer & Delivery Address Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Info */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="size-3.5 text-blue-400" /> Customer Information
                            </h4>
                            <div className="text-sm space-y-1">
                                <p className="font-bold text-white">
                                    {order.user?.fullName || order.user?.name || "Customer"}
                                </p>
                                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                                    <Mail className="size-3.5" /> {order.user?.email || "N/A"}
                                </p>
                                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                                    <Phone className="size-3.5" /> {order.shippingInfo?.phoneNo || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-amber-400" /> Shipping Address
                            </h4>
                            <div className="text-xs text-slate-300 space-y-1">
                                <p className="font-medium text-white">{order.shippingInfo?.address}</p>
                                <p className="text-slate-400">
                                    {order.shippingInfo?.city}, {order.shippingInfo?.postalCode}
                                </p>
                                <p className="text-slate-400">{order.shippingInfo?.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="size-3.5 text-emerald-400" /> Ordered Items ({order.orderItems?.length || 0})
                        </h4>

                        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                            <div className="divide-y divide-slate-800/80">
                                {order.orderItems?.map((item, index) => (
                                    <div
                                        key={item.product || index}
                                        className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="size-12 object-cover rounded-lg border border-slate-800 bg-slate-900 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-white truncate max-w-xs sm:max-w-md">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Unit Price: {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-semibold text-slate-400 block">
                                                Qty: {item.quantity}
                                            </span>
                                            <span className="text-sm font-bold text-blue-400">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment & Price Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Payment Info */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="size-3.5 text-cyan-400" /> Payment Details
                            </h4>
                            <div className="text-xs space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Method:</span>
                                    {isCOD ? (
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                            <Banknote className="size-3.5" /> Cash on Delivery
                                        </span>
                                    ) : (
                                        <span className="text-blue-400 font-bold flex items-center gap-1">
                                            <Smartphone className="size-3.5" /> Online Transfer
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Payment Status:</span>
                                    <span className="capitalize font-semibold text-white">
                                        {order.paymentInfo?.status || "pending"}
                                    </span>
                                </div>
                                {order.paymentInfo?.slipUrl && onPreviewSlip && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPreviewSlip(order.paymentInfo!.slipUrl!)}
                                        className="mt-2 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 gap-1.5 rounded-lg"
                                    >
                                        <ExternalLink className="size-3.5" /> View Payment Slip
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Order Summary
                            </h4>
                            <div className="text-xs space-y-2 pt-1">
                                <div className="flex justify-between text-slate-400">
                                    <span>Items Subtotal</span>
                                    <span className="font-mono text-slate-200">
                                        {formatPrice(order.itemsPrice || order.totalPrice)}
                                    </span>
                                </div>
                                <Separator className="bg-slate-800 my-1" />
                                <div className="flex justify-between text-sm font-bold text-white pt-1">
                                    <span>Grand Total</span>
                                    <span className="font-mono text-blue-400 text-base">
                                        {formatPrice(order.totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};