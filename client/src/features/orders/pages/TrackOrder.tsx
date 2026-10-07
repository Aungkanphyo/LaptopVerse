import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTrackOrderQuery } from "@/features/orders/orderApiSlice";
import { isFetchBaseQueryError } from "@/utils/errorHelpers";
import { Search, Package, XCircle, Copy, Check, Loader2, AlertCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/utils/formatCurrency";

interface SearchFormProps {
    initialOrderCode: string;
    initialPhoneNo: string;
    onSearch: (code: string, phone: string) => void;
    isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
    initialOrderCode,
    initialPhoneNo,
    onSearch,
    isLoading,
}) => {
    const [orderCode, setOrderCode] = useState(initialOrderCode);
    const [phoneNo, setPhoneNo] = useState(initialPhoneNo);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(orderCode, phoneNo);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 space-y-1">
                <label htmlFor="orderCode" className="text-xs text-slate-400 font-medium">Order Code</label>
                <Input
                    id="orderCode"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    placeholder="e.g. LV-261004-0001"
                    className="bg-[#141a2e] border-slate-700 text-white rounded-xl focus:border-blue-500 font-mono uppercase"
                />
            </div>
            <div className="md:col-span-2 space-y-1">
                <label htmlFor="phoneNo" className="text-xs text-slate-400 font-medium">Phone Number</label>
                <Input
                    id="phoneNo"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="e.g. 09798526456"
                    className="bg-[#141a2e] border-slate-700 text-white rounded-xl focus:border-blue-500"
                />
            </div>
            <div className="md:col-span-1 flex items-end">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl h-10 transition cursor-pointer"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
            </div>
        </form>
    );
};

export const TrackOrder: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const urlOrderCode = searchParams.get("orderCode") || "";
    const urlPhoneNo = searchParams.get("phoneNo") || "";

    const cleanQueryCode = urlOrderCode.trim().toUpperCase();
    const cleanQueryPhone = urlPhoneNo.trim();

    const { data, isLoading, isError, error } = useTrackOrderQuery(
        { orderCode: cleanQueryCode, phoneNo: cleanQueryPhone },
        { skip: !cleanQueryCode || !cleanQueryPhone }
    );

    const searchedOrder = data?.order;
    const [copied, setCopied] = useState<boolean>(false);

    // API Error Toast Notification Only
    useEffect(() => {
        if (isError && error) {
            let message = "Order not found with provided details";
            if (isFetchBaseQueryError(error)) {
                message = (error.data as { message?: string })?.message || message;
            }
            toast.error(message);
        }
    }, [isError, error]);

    const handleSearch = (orderCode: string, phoneNo: string) => {
        const cleanCode = orderCode.trim().toUpperCase();
        const cleanPhone = phoneNo.trim();

        if (!cleanCode || !cleanPhone) {
            toast.error("Please fill in both Order Code and Phone Number");
            return;
        }

        setSearchParams({ orderCode: cleanCode, phoneNo: cleanPhone });
    };

    const copyOrderCode = async () => {
        const displayCode = searchedOrder?.orderCode;
        if (!displayCode) return;
        try {
            await navigator.clipboard.writeText(displayCode);
            setCopied(true);
            toast.success("Order Code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy Order Code");
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case "succeeded":
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">Payment Verified</Badge>;
            case "failed":
                return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-3 py-1">Payment Rejected</Badge>;
            default:
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1">Payment Pending Verification</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-[#070913] text-slate-100 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>
                {/* Search Form */}
                <Card className="p-6 md:p-8 bg-[#0e1322] border-slate-800 rounded-3xl shadow-2xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-500" /> Track Order Status
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Enter your Order Code (e.g. LV-261004-0001) and Phone Number to check progress.
                        </p>
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                            <p className="leading-relaxed">
                                <span className="font-semibold text-amber-300">Important Note:</span> Please make sure to <span className="font-semibold text-amber-200">save or note down your Order Code and Phone Number</span>, as they are only displayed here once for tracking your order progress next time.
                            </p>
                        </div>
                    </div>

                    <SearchForm
                        key={`${urlOrderCode}_${urlPhoneNo}`}
                        initialOrderCode={urlOrderCode}
                        initialPhoneNo={urlPhoneNo}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                    />
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <Card className="p-8 bg-[#0e1322] border-slate-800 rounded-3xl flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </Card>
                )}

                {/* Tracking Details Display */}
                {!isLoading && searchedOrder && (
                    <Card className="p-6 md:p-8 bg-[#0e1322] border-slate-800 rounded-3xl shadow-2xl space-y-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Order Code:</span>
                                    <span className="font-mono text-base text-blue-400 font-extrabold tracking-wider">
                                        {searchedOrder.orderCode || searchedOrder._id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyOrderCode}
                                        className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                                        title="Copy Order Code"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Placed on: {new Date(searchedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>{getPaymentBadge(searchedOrder.paymentInfo.status)}</div>
                        </div>

                        <Separator className="bg-slate-800" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                            <div className="space-y-1">
                                <span className="text-xs text-slate-400">Order Status</span>
                                <p className="font-semibold text-slate-200">{searchedOrder.orderStatus}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-400">Payment Status</span>
                                <p className="font-semibold capitalize text-slate-200">{searchedOrder.paymentInfo.status}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-400">Total Amount</span>
                                <p className="font-semibold text-blue-400">{formatPrice(searchedOrder.totalPrice)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-slate-400">Courier Info</span>
                                <p className="font-semibold text-slate-200">
                                    {searchedOrder.trackingInfo?.courierName || "Pending Dispatch"}
                                </p>
                            </div>
                        </div>

                        {searchedOrder.paymentInfo.status === "failed" && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm flex gap-3 items-start">
                                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold">Payment Verification Failed</h4>
                                    <p className="mt-0.5 text-xs text-rose-300">
                                        Your payment slip could not be verified. Please contact our support team.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300">Ordered Items</h3>
                            <div className="divide-y divide-slate-800/60 rounded-2xl border border-slate-800 overflow-hidden bg-[#12182b]">
                                {searchedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} className="p-3 flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-slate-900" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                            <p className="text-xs text-slate-400">{formatPrice(item.price)} × {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-200">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center border-t border-slate-800/80">
                            <Link to="/">
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg shadow-blue-600/20">
                                    <ShoppingBag className="w-4 h-4" /> Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;