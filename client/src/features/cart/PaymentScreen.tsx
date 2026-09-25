import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import CheckoutSteps from "@/components/layout/CheckoutSteps";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { clearCartItems, saveManualTransferPayment } from "./cartSlice";
import { useGetPublicManualPaymentInfoQuery } from "@/features/payment/paymentApiSlice";
import { useCreateOrderMutation } from "@/features/orders/orderApiSlice";
import type { IManualPaymentAccount } from "@/types/payment.types";

import { PaymentMethodTabs, type PaymentTabType } from "./components/PaymentMethodTabs";
import { OnlineTransferSection } from "./components/OnlineTransferSection";
import { CodSection } from "./components/CodSection";
import { isFetchBaseQueryError } from "@/utils/errorHelpers";

const PaymentScreen = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const cart = useAppSelector((state) => state.cart);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data, isLoading, isError } = useGetPublicManualPaymentInfoQuery();
    const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

    const [paymentMethod, setPaymentMethod] = useState<PaymentTabType>("online");
    const [userPickedIndex, setUserPickedIndex] = useState<number | null>(null);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);

    // Early Navigation Guard
    useEffect(() => {
        if (cart.cartItems.length === 0) {
            navigate("/cart");
        } else if (!cart.shippingInfo) {
            toast.error("Please provide shipping address first.");
            navigate("/shipping");
        }
    }, [cart.cartItems.length, cart.shippingInfo, navigate]);

    const accounts = useMemo<IManualPaymentAccount[]>(
        () => data?.accounts || [],
        [data?.accounts]
    );

    const selectedIndex = useMemo(() => {
        if (accounts.length === 0) return -1;
        if (userPickedIndex !== null) {
            return Math.max(0, Math.min(userPickedIndex, accounts.length - 1));
        }
        if (cart.manualTransferProvider) {
            const fromCart = accounts.findIndex(
                (a) => a.provider === cart.manualTransferProvider
            );
            if (fromCart >= 0) return fromCart;
        }
        return 0;
    }, [accounts, userPickedIndex, cart.manualTransferProvider]);

    const selectedAccount = selectedIndex >= 0 ? accounts[selectedIndex] : undefined;

    // File Handlers with Memory Management
    const handleFileSelect = (file: File) => {
        if (slipPreview) URL.revokeObjectURL(slipPreview);
        setSlipFile(file);
        setSlipPreview(URL.createObjectURL(file));
    };

    const handleRemoveFile = () => {
        if (slipPreview) URL.revokeObjectURL(slipPreview);
        setSlipFile(null);
        setSlipPreview(null);
    };

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to place an order.");
            navigate("/login");
            return;
        }

        if (!cart.shippingInfo) return;

        if (paymentMethod === "online") {
            if (!selectedAccount) {
                toast.error("Please select a payment account.");
                return;
            }
            if (!slipFile) {
                toast.error("Please upload your payment slip.");
                return;
            }
        }

        try {
            const orderItems = cart.cartItems.map((item) => ({
                name: item.name,
                quantity: item.qty,
                price: item.price,
                image: item.images?.[0]?.url || "",
                product: item._id,
            }));

            const paymentInfo =
                paymentMethod === "online"
                    ? {
                        id: `manual:${selectedAccount?.provider}:${Date.now()}`,
                        status: "pending",
                    }
                    : {
                        id: `cod:${Date.now()}`,
                        status: "pending",
                    };

            if (paymentMethod === "online" && selectedAccount) {
                dispatch(
                    saveManualTransferPayment({
                        provider: selectedAccount.provider,
                        reference: slipFile ? slipFile.name : "Slip Uploaded",
                    })
                );
            }

            await createOrder({
                shippingInfo: {
                    address: cart.shippingInfo.address,
                    city: cart.shippingInfo.city,
                    phoneNo: cart.shippingInfo.phoneNo,
                    postalCode: cart.shippingInfo.zipCode,
                    country: cart.shippingInfo.country,
                },
                orderItems,
                paymentInfo,
                itemsPrice: cart.itemsPrice,
                totalPrice: cart.totalPrice,
                slipFile: paymentMethod === "online" ? slipFile : null,
            }).unwrap();

            dispatch(clearCartItems());
            toast.success(
                paymentMethod === "online"
                    ? "Order placed! We will confirm your payment receipt soon."
                    : "COD Order Placed Successfully!"
            );
            navigate("/");
        } catch (err: unknown) {
            let message = "Failed to place order";
            if (isFetchBaseQueryError(err)) {
                message = (err.data as { message?: string })?.message || message;
            }
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-[#070913] text-slate-100 py-10">
            <div className="container max-w-2xl mx-auto px-4">
                <CheckoutSteps currentStep={2} className="mb-8" />

                <Card className="rounded-3xl border border-slate-800/80 bg-[#0e1322] shadow-2xl overflow-hidden p-6 md:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                            Payment Method
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Choose how you would like to pay for your order.
                        </p>
                    </div>

                    <PaymentMethodTabs
                        activeTab={paymentMethod}
                        onChangeTab={setPaymentMethod}
                    />

                    {paymentMethod === "online" ? (
                        <OnlineTransferSection
                            instructions={data?.instructions}
                            isLoadingInstructions={isLoading}
                            isInstructionsError={isError}
                            accounts={accounts}
                            selectedIndex={selectedIndex}
                            onSelectAccountIndex={setUserPickedIndex}
                            slipFile={slipFile}
                            slipPreview={slipPreview}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={handleRemoveFile}
                            onSubmitOrder={handlePlaceOrder}
                            isPlacingOrder={isPlacingOrder}
                        />
                    ) : (
                        <CodSection
                            itemsPrice={cart.itemsPrice || 0}
                            totalPrice={cart.totalPrice || 0}
                            onSubmitOrder={handlePlaceOrder}
                            isPlacingOrder={isPlacingOrder}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PaymentScreen;