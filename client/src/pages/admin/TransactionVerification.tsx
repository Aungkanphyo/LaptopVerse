import { useState, useMemo, useCallback } from "react";
import {
    useGetAllOrdersAdminQuery,
    useVerifyPaymentMutation,
    type IAdminOrder,
} from "@/features/orders/orderApiSlice";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
    TransactionFilterHeader,
    type FilterStatusType,
} from "./components/transactionVerification/TransactionFilterHeader";
import { TransactionCard } from "./components/transactionVerification/TransactionCard";
import { RejectReasonModal } from "./components/transactionVerification/RejectReasonModal";
import { SlipImageModal } from "./components/transactionVerification/SlipImageModal";

// Helper for extracting API error messages
const getErrorMessage = (error: unknown): string => {
    const err = error as { data?: { message?: string } };
    return err?.data?.message || "Something went wrong. Please try again.";
};

const TransactionVerification = () => {
    const { data, isLoading, isError } = useGetAllOrdersAdminQuery();
    const [verifyPayment] = useVerifyPaymentMutation();

    // Specific Order Processing Tracker
    const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

    // State Management
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatusType>("pending");

    const [selectedOrderForReject, setSelectedOrderForReject] = useState<IAdminOrder | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

    const orders = useMemo(() => data?.orders || [], [data?.orders]);

    // Memoized Filtering Logic
    const filteredOrders = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        return orders.filter((order) => {
            const matchesStatus =
                filterStatus === "all" ? true : order.paymentInfo?.status === filterStatus;

            if (!matchesStatus) return false;
            if (!query) return true;

            const txnRef = order.paymentInfo?.id || "";
            const userName = order.user?.fullName || order.user?.name || "";
            const userEmail = order.user?.email || "";
            const orderId = order._id || "";

            return (
                txnRef.toLowerCase().includes(query) ||
                userName.toLowerCase().includes(query) ||
                userEmail.toLowerCase().includes(query) ||
                orderId.toLowerCase().includes(query)
            );
        });
    }, [orders, filterStatus, searchTerm]);

    // Action Handlers
    const handleApprove = useCallback(
        async (orderId: string) => {
            try {
                setVerifyingOrderId(orderId);
                await verifyPayment({ id: orderId, paymentStatus: "succeeded" }).unwrap();
                toast.success("Payment verified and approved successfully!");
            } catch (err: unknown) {
                toast.error(getErrorMessage(err));
            } finally {
                setVerifyingOrderId(null);
            }
        },
        [verifyPayment]
    );

    const handleRejectSubmit = useCallback(async () => {
        if (!selectedOrderForReject) return;

        const cleanReason = rejectionReason.trim();
        if (!cleanReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setVerifyingOrderId(selectedOrderForReject._id);
            await verifyPayment({
                id: selectedOrderForReject._id,
                paymentStatus: "failed",
                rejectionReason: cleanReason,
            }).unwrap();

            toast.success("Payment rejected and notification sent to user.");
            setSelectedOrderForReject(null);
            setRejectionReason("");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        } finally {
            setVerifyingOrderId(null);
        }
    }, [selectedOrderForReject, rejectionReason, verifyPayment]);

    const handleCloseRejectModal = useCallback(() => {
        if (verifyingOrderId) return; // Prevent closing while API call is pending
        setSelectedOrderForReject(null);
        setRejectionReason("");
    }, [verifyingOrderId]);

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-64 bg-slate-800/60 rounded-xl" />
                <Skeleton className="h-48 w-full bg-slate-800/60 rounded-2xl" />
                <Skeleton className="h-48 w-full bg-slate-800/60 rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center text-rose-400 flex flex-col items-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                <AlertCircle className="size-10" />
                <p className="text-base font-medium">Failed to load transaction data. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 text-slate-100 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Transaction Verifications</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Review and verify manual payment receipts submitted by customers.
                </p>
            </div>

            <TransactionFilterHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {filteredOrders.length === 0 ? (
                <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800 rounded-2xl">
                    <CreditCard className="size-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg font-semibold text-slate-200">No transactions found</p>
                    <p className="text-sm text-slate-400 mt-1">There are no orders matching your selected filters.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <TransactionCard
                            key={order._id}
                            order={order}
                            isVerifying={verifyingOrderId === order._id}
                            onApprove={handleApprove}
                            onRejectClick={setSelectedOrderForReject}
                            onPreviewSlip={setPreviewSlipUrl}
                        />
                    ))}
                </div>
            )}

            {selectedOrderForReject && (
                <RejectReasonModal
                    isOpen={!!selectedOrderForReject}
                    order={selectedOrderForReject}
                    rejectionReason={rejectionReason}
                    onReasonChange={setRejectionReason}
                    isVerifying={verifyingOrderId === selectedOrderForReject._id}
                    onSubmit={handleRejectSubmit}
                    onClose={handleCloseRejectModal}
                />
            )}

            {previewSlipUrl && (
                <SlipImageModal
                    imageUrl={previewSlipUrl}
                    isOpen={!!previewSlipUrl}
                    onClose={() => setPreviewSlipUrl(null)}
                />
            )}
        </div>
    );
};

export default TransactionVerification;