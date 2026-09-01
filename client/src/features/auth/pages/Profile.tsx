import React, { useState } from "react";
import { useAppSelector } from "@/hooks/redux.hooks";
import { useUpdatePasswordMutation } from "../authApiSlice";
import { useGetMyOrdersQuery } from "@/features/orders/orderApiSlice";
import { toast } from "sonner";
import { KeyRound, ShoppingBag, CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";

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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="size-3.5" /> Payment Received
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="size-3.5" /> Payment Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="size-3.5" /> Pending Verification
                    </span>
                );
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header Profile Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-full text-xs uppercase tracking-wide">
                    {user?.role || "Customer"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Change Password */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 h-fit">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3">
                        <KeyRound className="size-5 text-blue-600" />
                        <h2>Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                            {isUpdating ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Right Column: Payment & Orders Status */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3">
                        <ShoppingBag className="size-5 text-blue-600" />
                        <h2>Payment Status & Orders</h2>
                    </div>

                    {isLoadingOrders ? (
                        <p className="text-sm text-gray-500">Loading orders...</p>
                    ) : !orderData?.orders || orderData.orders.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders placed yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {orderData.orders.map((order) => (
                                <div key={order._id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                                        <div>
                                            <span className="text-xs text-gray-400">Order ID:</span>
                                            <span className="text-xs font-mono font-medium ml-1 text-gray-700">#{order._id}</span>
                                        </div>
                                        {renderPaymentBadge(order.paymentInfo?.status || "pending")}
                                    </div>

                                    {/* Transaction ID Info */}
                                    {order.paymentInfo?.id && (
                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                            <ShieldCheck className="size-4 text-gray-400" />
                                            <span>Txn Ref: </span>
                                            <span className="font-mono bg-white px-2 py-0.5 border rounded text-gray-800">
                                                {order.paymentInfo.id}
                                            </span>
                                        </div>
                                    )}

                                    {/* Order Items Preview */}
                                    <div className="space-y-2">
                                        {order.orderItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt={item.name} className="size-10 object-cover rounded" />
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-xs">{item.name}</p>
                                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {item.price.toLocaleString()} MMK
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                                        <span className="text-gray-500">Total Amount:</span>
                                        <span className="font-bold text-blue-600 text-sm">{order.totalPrice.toLocaleString()} MMK</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;