import CheckoutSteps from "@/components/layout/CheckoutSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { saveManualTransferPayment } from "./cartSlice";
import { useGetPublicManualPaymentInfoQuery } from "@/features/payment/paymentApiSlice";
import { useCreateOrderMutation } from "@/features/orders/orderApiSlice";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetPublicManualPaymentInfoQuery();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  const [provider, setProvider] = useState(cart.manualTransferProvider || "");
  const [reference, setReference] = useState(cart.manualTransferReference || "");

  const accountsText = (data?.accounts || [])
    .map((a) => {
      const phone = a.phoneNumber ? ` | Phone: ${a.phoneNumber}` : "";
      const note = a.note ? ` | Note: ${a.note}` : "";
      return `${a.provider}: ${a.accountName} - ${a.accountNumber}${phone}${note}`;
    })
    .join("\n");

  const placeOrderHandler = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order.");
      navigate("/login");
      return;
    }
    if (!cart.shippingInfo) {
      toast.error("Please provide shipping address first.");
      navigate("/shipping");
      return;
    }
    if (!provider.trim() || !reference.trim()) {
      toast.error("Please enter provider and transfer reference.");
      return;
    }

    dispatch(saveManualTransferPayment({ provider: provider.trim(), reference: reference.trim() }));

    try {
      const orderItems = cart.cartItems.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        image: item.images?.[0]?.url || "",
        product: item._id,
      }));

      await createOrder({
        shippingInfo: {
          address: cart.shippingInfo.address,
          city: cart.shippingInfo.city,
          phoneNo: cart.shippingInfo.phoneNo,
          postalCode: cart.shippingInfo.zipCode,
          country: cart.shippingInfo.country,
        },
        orderItems,
        paymentInfo: {
          id: `manual:${provider.trim()}:${reference.trim()}`,
          status: "pending",
        },
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      toast.success("Order placed. We’ll confirm your transfer soon.");
      navigate("/");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "data" in err
          ? // @ts-expect-error RTK Query error shape
            (err.data?.message as string | undefined)
          : undefined;
      toast.error(message || "Failed to place order");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <CheckoutSteps step1 step2 step3 />

      <Card className="border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Payment (Manual Transfer)</CardTitle>
          <p className="text-gray-500 text-sm">
            Pay by transferring within Myanmar using KPay / AYA Pay / Wave Money / UAB Pay / CB Pay.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Instructions</Label>
            <div className="rounded-lg border bg-white p-3 text-sm text-gray-700">
              {isLoading ? "Loading…" : isError ? "Failed to load payment info." : data?.instructions}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Information</Label>
            <Textarea value={accountsText} readOnly className="min-h-40" placeholder="No payment accounts configured yet." />
            {data && data.enabled === false && (
              <p className="text-sm text-red-600">Manual transfer is currently disabled by admin.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider (e.g. KPay)</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="KPay"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Transfer Reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction ID / last 6 digits"
                required
              />
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={placeOrderHandler}
            disabled={isPlacingOrder || data?.enabled === false}
          >
            {isPlacingOrder ? "Placing Order…" : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentScreen;

