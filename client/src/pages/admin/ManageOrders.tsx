import { useState, useCallback } from "react";
import {
    useGetAllOrdersAdminQuery,
    useUpdateOrderStatusAdminMutation,
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
import { useSearchParams } from "react-router-dom";
import Pagination from "@/components/common/Pagination";
import type { IAdminOrder, OrderStatus } from "@/types/order.types";

const ManageOrders = () => {
    // URL Query Search Parameters State
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const keyword = searchParams.get("keyword") || "";
    const filterStatus = searchParams.get("status") || "all";

    // RTK Query Server-side Fetching with Parameters
    const { data, isLoading, isFetching, isError } = useGetAllOrdersAdminQuery({
        page,
        limit,
        keyword,
        status: filterStatus,
        paymentStatus: 'succeeded',
    });
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusAdminMutation();

    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<IAdminOrder | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<IAdminOrder | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchParams((prev) => {
            if (value) {
                prev.set("keyword", value);
                prev.set("status", "all");
            } else {
                prev.delete("keyword");
            }
            prev.set("page", "1"); // If search change restart from page 1
            return prev;
        });
    };

    const handleStatusFilter = (status: string) => {
        setSearchParams((prev) => {
            prev.set("status", status);
            prev.set("page", "1"); // If filter change restart from page 1
            return prev;
        });
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = e.target.value;
        setSearchParams((prev) => {
            prev.set("limit", newLimit);
            prev.set("page", "1");
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set("page", newPage.toString());
            return prev;
        });
    };

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

    const orders = data?.orders || [];
    const totalOrders = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    const startItem = totalOrders > 0 ? (page - 1) * limit + 1 : 0;
    const endItem = Math.min(page * limit, totalOrders);

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
                        value={keyword}
                        onChange={handleSearch}
                        className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 placeholder:text-slate-500 rounded-xl"
                    />
                </div>

                <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                    {/* Entries Limit Selection */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="h-9 rounded-xl border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {(["Processing", "Shipped", "Delivered", "Cancelled", "all"] as const).map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusFilter(status)}
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
            </div>

            {/* Order Cards List */}
            {isFetching ? (
                <div className="space-y-4">
                    {Array.from({ length: limit }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full bg-slate-800/60 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800 rounded-2xl">
                    <ShoppingBag className="size-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg font-semibold text-slate-200">No orders found</p>
                    <p className="text-sm text-slate-400 mt-1">There are no orders matching your selected filter.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={setSelectedOrderForStatus}
                            onViewDetails={setSelectedOrderForDetails}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Footer Section */}
            {!isLoading && totalOrders > 0 && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-medium text-slate-400">
                        Showing <span className="text-white font-bold">{startItem}</span> to{" "}
                        <span className="text-white font-bold">{endItem}</span> of{" "}
                        <span className="text-white font-bold">{totalOrders}</span> orders
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
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