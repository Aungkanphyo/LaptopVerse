import { useState } from "react";
import {
    useGetAllOrdersAdminQuery,
    useVerifyPaymentMutation,
    type IAdminOrder
} from "@/features/orders/orderApiSlice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    CreditCard,
    User,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TransactionVerification = () => {
    const { data, isLoading, isError } = useGetAllOrdersAdminQuery();
    const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "succeeded" | "failed">("pending");

    // Modal state for Rejection
    const [selectedOrderForReject, setSelectedOrderForReject] = useState<IAdminOrder | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const orders = data?.orders || [];

    // Helper Function that removes prefixes from Payment Reference and extracts only the Number
    const getCleanTxnRef = (refId?: string) => {
        if (!refId) return "N/A";
        return refId.includes(":") ? refId.split(":").pop() : refId;
    };

    // Filter Logic
    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            filterStatus === "all" ? true : order.paymentInfo?.status === filterStatus;

        const txnRef = order.paymentInfo?.id || "";
        const userName = order.user?.fullName || order.user?.name || "";
        const userEmail = order.user?.email || "";

        const matchesSearch =
            txnRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const handleApprove = async (orderId: string) => {
        try {
            await verifyPayment({ id: orderId, paymentStatus: "succeeded" }).unwrap();
            toast.success("Payment verified and approved successfully!");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to approve payment");
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedOrderForReject) return;
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            await verifyPayment({
                id: selectedOrderForReject._id,
                paymentStatus: "failed",
                rejectionReason: rejectionReason.trim(),
            }).unwrap();

            toast.success("Payment rejected and notification sent to user.");
            setSelectedOrderForReject(null);
            setRejectionReason("");
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Failed to reject payment");
        }
    };

    const renderPaymentBadge = (status?: string) => {
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

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-64 bg-slate-800/60" />
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
        <div className="space-y-8 p-6 text-slate-100">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Transaction Verifications</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Review and verify manual payment receipts submitted by customers.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Search Txn Ref, Name, Email, Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 placeholder:text-slate-500"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {(["pending", "all", "succeeded", "failed"] as const).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={`capitalize transition-all rounded-xl ${
                                filterStatus === status 
                                    ? "bg-blue-600 text-white hover:bg-blue-500" 
                                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                        >
                            {status === "pending" ? "Pending Approval" : status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Order Cards List */}
            {filteredOrders.length === 0 ? (
                <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800 rounded-2xl">
                    <CreditCard className="size-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg font-semibold text-slate-200">No transactions found</p>
                    <p className="text-sm text-slate-400 mt-1">There are no orders matching your selected filters.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <Card key={order._id} className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-md overflow-hidden rounded-2xl">
                            <CardHeader className="bg-slate-950/50 border-b border-slate-800/80 py-3 px-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-slate-400">
                                        #{order._id}
                                    </span>
                                    {renderPaymentBadge(order.paymentInfo?.status)}
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(order.createdAt).toLocaleString()}
                                </span>
                            </CardHeader>

                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Customer Info */}
                                <div className="space-y-2 border-r/0 md:border-r border-slate-800 pr-0 md:pr-4">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="size-3.5 text-blue-400" /> Customer Details
                                    </div>
                                    <p className="font-bold text-base text-white">
                                        {order.user?.fullName || order.user?.name || "Customer"}
                                    </p>
                                    <p className="text-sm text-slate-400">{order.user?.email || "No Email"}</p>
                                    <p className="text-xs text-slate-400">
                                        Phone: {order.shippingInfo?.phoneNo || "N/A"}
                                    </p>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-2 border-r/0 md:border-r border-slate-800 pr-0 md:pr-4">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <CreditCard className="size-3.5 text-cyan-400" /> Payment Reference
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm break-all font-semibold text-cyan-400">
                                        {getCleanTxnRef(order.paymentInfo?.id)}
                                    </div>
                                    <p className="text-sm font-bold mt-2 text-slate-300">
                                        Total Amount:{" "}
                                        <span className="text-blue-400 font-extrabold">
                                            {Number(order.totalPrice || 0).toLocaleString()} MMK
                                        </span>
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col justify-center items-stretch md:items-end gap-3">
                                    {order.paymentInfo?.status === "pending" ? (
                                        <>
                                            <Button
                                                onClick={() => handleApprove(order._id)}
                                                disabled={isVerifying}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl transition-all shadow-md shadow-emerald-950/20"
                                            >
                                                <CheckCircle2 className="size-4" /> Approve Payment
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedOrderForReject(order)}
                                                disabled={isVerifying}
                                                className="border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 bg-slate-950/40 gap-2 rounded-xl transition-all"
                                            >
                                                <XCircle className="size-4" /> Reject Payment
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-xs text-slate-400 text-center md:text-right">
                                            Status verified on {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedOrderForReject && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-6 space-y-5">
                        <div className="flex items-center gap-2.5 text-rose-400 border-b border-slate-800 pb-3">
                            <XCircle className="size-6 shrink-0" />
                            <h2 className="text-lg font-bold text-white">Reject Payment Verification</h2>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Please specify the reason for rejecting Order{" "}
                                <span className="font-mono font-bold text-white">#{selectedOrderForReject._id}</span>. An email notification will be sent to{" "}
                                <span className="font-semibold text-slate-200">
                                    {selectedOrderForReject.user?.email || "the customer"}
                                </span>.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Rejection Reason
                                </label>
                                <Textarea
                                    rows={4}
                                    placeholder="e.g. Invalid transaction reference number or amount mismatch..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="bg-slate-950 text-slate-100 border-slate-800 focus-visible:ring-rose-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedOrderForReject(null);
                                    setRejectionReason("");
                                }}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleRejectSubmit}
                                disabled={isVerifying}
                                className="bg-rose-600 hover:bg-rose-500 text-white min-w-32 flex items-center justify-center gap-2 rounded-xl"
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionVerification;