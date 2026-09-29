import { useState, useMemo, useCallback } from "react";
import {
    useGetAllOrdersAdminQuery,
    useUpdateOrderStatusAdminMutation,
    type IAdminOrder,
    type OrderStatus,
} from "@/features/orders/orderApiSlice";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { OrderCard } from "./components/manageOrders/OrderCard";
import { UpdateStatusModal } from "./components/manageOrders/UpdateStatusModal";
import { OrderDetailModal } from "./components/transactionVerification/OrderDetailModal";

type FilterLogisticsStatus = "all" | OrderStatus;

const ManageOrders = () => {
    const { data, isLoading, isError } = useGetAllOrdersAdminQuery();
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusAdminMutation();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterLogisticsStatus>("Processing");

    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<IAdminOrder | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<IAdminOrder | null>(null);

    const orders = useMemo(() => data?.orders || [], [data?.orders]);

    const filteredOrders = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        return orders.filter((order) => {
            const matchesStatus =
                filterStatus === "all" ? true : order.orderStatus === filterStatus;

            if (!matchesStatus) return false;
            if (!query) return true;

            const userName = order.user?.fullName || order.user?.name || "";
            const userEmail = order.user?.email || "";
            const trackingNo = order.trackingInfo?.trackingNumber || "";

            return (
                order._id.toLowerCase().includes(query) ||
                userName.toLowerCase().includes(query) ||
                userEmail.toLowerCase().includes(query) ||
                trackingNo.toLowerCase().includes(query)
            );
        });
    }, [orders, filterStatus, searchTerm]);

    const handleUpdateStatusSubmit = useCallback(
        async (payload: {
            id: string;
            status: OrderStatus;
            courierName?: string;
            trackingNumber?: string;
            cancellationReason?: string;
        }) => {
            try {
                await updateOrderStatus(payload).unwrap();
                toast.success(`Order status updated to ${payload.status}`);
                setSelectedOrderForStatus(null);
            } catch (err: unknown) {
                const error = err as { data?: { message?: string } };
                toast.error(error?.data?.message || "Failed to update order status");
            }
        },
        [updateOrderStatus]
    );

    if (isLoading) {
        return (
            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-64 bg-slate-800/60 rounded-xl" />
                <Skeleton className="h-44 w-full bg-slate-800/60 rounded-2xl" />
                <Skeleton className="h-44 w-full bg-slate-800/60 rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center text-rose-400 flex flex-col items-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-7xl mx-auto mt-6">
                <AlertCircle className="size-10" />
                <p className="text-base font-medium">Failed to load orders data. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 text-slate-100 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Orders</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Track shipments, assign tracking numbers, and update delivery statuses.
                </p>
            </div>

            {/* Filter & Search Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Search Order ID, Name, Tracking No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 placeholder:text-slate-500 rounded-xl"
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {(["Processing", "Shipped", "Delivered", "Cancelled", "all"] as const).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus(status as FilterLogisticsStatus)}
                            className={`capitalize transition-all rounded-xl ${filterStatus === status
                                    ? "bg-purple-600 text-white hover:bg-purple-500"
                                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {status === "all" ? "All Orders" : status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Order Cards List */}
            {filteredOrders.length === 0 ? (
                <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800 rounded-2xl">
                    <ShoppingBag className="size-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg font-semibold text-slate-200">No orders found</p>
                    <p className="text-sm text-slate-400 mt-1">There are no orders matching your selected filter.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={setSelectedOrderForStatus}
                            onViewDetails={setSelectedOrderForDetails}
                        />
                    ))}
                </div>
            )}

            {/* Status Update Modal */}
            {selectedOrderForStatus && (
                <UpdateStatusModal
                    key={selectedOrderForStatus?._id}
                    order={selectedOrderForStatus}
                    isOpen={!!selectedOrderForStatus}
                    isUpdating={isUpdating}
                    onClose={() => setSelectedOrderForStatus(null)}
                    onSubmit={handleUpdateStatusSubmit}
                />
            )}

            {/* Full Order Detail Modal */}
            {selectedOrderForDetails && (
                <OrderDetailModal
                    order={selectedOrderForDetails}
                    isOpen={!!selectedOrderForDetails}
                    onClose={() => setSelectedOrderForDetails(null)}
                />
            )}
        </div>
    );
};

export default ManageOrders;