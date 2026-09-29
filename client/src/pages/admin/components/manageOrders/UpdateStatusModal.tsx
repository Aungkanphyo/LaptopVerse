import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Truck, CheckCircle2, XCircle, Package } from "lucide-react";
import type { IAdminOrder, OrderStatus } from "@/features/orders/orderApiSlice";

interface UpdateStatusModalProps {
    order: IAdminOrder;
    isOpen: boolean;
    isUpdating: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        id: string;
        status: OrderStatus;
        courierName?: string;
        trackingNumber?: string;
        cancellationReason?: string;
    }) => void;
}

const STATUS_OPTIONS: { status: OrderStatus; icon: typeof Package; activeClass: string }[] = [
    { status: "Processing", icon: Package, activeClass: "bg-blue-600 hover:bg-blue-500 text-white" },
    { status: "Shipped", icon: Truck, activeClass: "bg-purple-600 hover:bg-purple-500 text-white" },
    { status: "Delivered", icon: CheckCircle2, activeClass: "bg-emerald-600 hover:bg-emerald-500 text-white" },
    { status: "Cancelled", icon: XCircle, activeClass: "bg-rose-600 hover:bg-rose-500 text-white" },
];

export const UpdateStatusModal = ({
    order,
    isOpen,
    isUpdating,
    onClose,
    onSubmit,
}: UpdateStatusModalProps) => {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.orderStatus);
    const [courierName, setCourierName] = useState(order.trackingInfo?.courierName || "");
    const [trackingNumber, setTrackingNumber] = useState(order.trackingInfo?.trackingNumber || "");
    const [cancellationReason, setCancellationReason] = useState(order?.cancellationReason || "");
    if (!order) return null;
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            id: order._id,
            status: selectedStatus,
            courierName: selectedStatus === "Shipped" ? courierName.trim() : undefined,
            trackingNumber: selectedStatus === "Shipped" ? trackingNumber.trim() : undefined,
            cancellationReason: selectedStatus === "Cancelled" ? cancellationReason.trim() : undefined,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-full bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="border-b border-slate-800 pb-3">
                    <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <Package className="size-5 text-blue-400" /> Update Order Status
                    </DialogTitle>
                    <p className="text-xs text-slate-400 font-mono">
                        Order #{order._id}
                    </p>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-5 pt-3">
                    {/* Status Selection Buttons */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Target Logistics Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map(({ status: st, icon: Icon, activeClass }) => {
                                const isSelected = selectedStatus === st;
                                return (
                                    <Button
                                        key={st}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedStatus(st)}
                                        className={`rounded-xl capitalize justify-start gap-2 border-slate-800 transition-all ${isSelected
                                                ? activeClass
                                                : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900"
                                            }`}
                                    >
                                        <Icon className="size-4" />
                                        <span>{st}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conditional Input: Tracking Info when status is Shipped */}
                    {selectedStatus === "Shipped" && (
                        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-in fade-in">
                            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                                <Truck className="size-4" /> Delivery Tracking Details
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="courierName" className="text-xs text-slate-400">Courier / Service Name</label>
                                <Input
                                    id="courierName"
                                    placeholder="e.g. Royal Express, Ninja Van, Gate Name..."
                                    value={courierName}
                                    onChange={(e) => setCourierName(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-xs text-white rounded-lg focus-visible:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-400">Waybill / Tracking ID</label>
                                <Input
                                    placeholder="e.g. REX-98765432"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-xs text-white rounded-lg focus-visible:ring-purple-500 font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Conditional Input: Reason when status is Cancelled */}
                    {selectedStatus === "Cancelled" && (
                        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
                            <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                                <XCircle className="size-4" /> Cancellation Reason
                            </label>
                            <Textarea
                                rows={3}
                                placeholder="e.g. Customer requested cancellation / Product returned by courier..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-xs text-white rounded-lg focus-visible:ring-rose-500"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="text-slate-400 hover:text-white rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs min-w-28 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};