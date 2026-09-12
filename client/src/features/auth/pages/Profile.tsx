import React, { useState } from "react";
import { useAppSelector } from "@/hooks/redux.hooks";
import { useUpdatePasswordMutation } from "../authApiSlice";
import { useGetMyOrdersQuery } from "@/features/orders/orderApiSlice";
import { toast } from "sonner";
import { KeyRound, ShoppingBag, CheckCircle2, Clock, XCircle, ShieldCheck, Loader2 } from "lucide-react";

const Profile = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [updatePassword, { isLoading: isUpdating }] = useUpdatePasswordMutation();
    const { data: orderData, isLoading: isLoadingOrders } = useGetMyOrdersQuery();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        try {
            const res = await updatePassword({ oldPassword, newPassword }).unwrap();
            toast.success(res.message || "Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to update password");
        }
    };

    const renderPaymentBadge = (status: string) => {
        switch (status) {
            case "succeeded":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3.5" /> Payment Received
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="size-3.5" /> Payment Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="size-3.5" /> Pending Verification
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0d18] text-slate-100 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-[#0f172a]/90 p-6 rounded-2xl border border-slate-800/80 shadow-xl flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.fullName}</h1>
                        <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold rounded-full text-xs uppercase tracking-wider">
                        {user?.role || "Customer"}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Change Password */}
                    <div className="bg-[#0f172a]/90 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-5 h-fit">
                        <div className="flex items-center gap-2.5 text-white font-semibold border-b border-slate-800/80 pb-4">
                            <KeyRound className="size-5 text-blue-400" />
                            <h2 className="text-lg">Change Password</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Payment & Orders Status */}
                    <div className="lg:col-span-2 bg-[#0f172a]/90 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-5">
                        <div className="flex items-center gap-2.5 text-white font-semibold border-b border-slate-800/80 pb-4">
                            <ShoppingBag className="size-5 text-blue-400" />
                            <h2 className="text-lg">Payment Status & Orders</h2>
                        </div>

                        {isLoadingOrders ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
                                <Loader2 className="size-5 animate-spin text-blue-500" />
                                <span>Loading orders...</span>
                            </div>
                        ) : !orderData?.orders || orderData.orders.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                No orders placed yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orderData.orders.map((order) => (
                                    <div key={order._id} className="border border-slate-800/80 rounded-xl p-4.5 bg-slate-900/50 space-y-3.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                            <div>
                                                <span className="text-xs text-slate-400">Order ID:</span>
                                                <span className="text-xs font-mono font-semibold ml-1.5 text-slate-200">#{order._id}</span>
                                            </div>
                                            {renderPaymentBadge(order.paymentInfo?.status || "pending")}
                                        </div>

                                        {/* Transaction ID Info */}
                                        {order.paymentInfo?.id && (
                                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                                <ShieldCheck className="size-4 text-slate-500" />
                                                <span>Txn Ref:</span>
                                                <span className="font-mono bg-slate-800 px-2 py-0.5 border border-slate-700/80 rounded text-slate-200">
                                                    {order.paymentInfo.id}
                                                </span>
                                            </div>
                                        )}

                                        {/* Order Items Preview */}
                                        <div className="space-y-2.5">
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <img src={item.image} alt={item.name} className="size-10 object-cover rounded-lg border border-slate-800" />
                                                        <div>
                                                            <p className="font-semibold text-slate-200 text-xs">{item.name}</p>
                                                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-300">
                                                        {item.price.toLocaleString()} MMK
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
                                            <span className="text-slate-400">Total Amount:</span>
                                            <span className="font-bold text-blue-400 text-base">{order.totalPrice.toLocaleString()} MMK</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;