import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CheckoutSteps from "@/components/layout/CheckoutSteps";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { clearCartItems, saveManualTransferPayment } from "./cartSlice";
import { useGetPublicManualPaymentInfoQuery } from "@/features/payment/paymentApiSlice";
import { useCreateOrderMutation } from "@/features/orders/orderApiSlice";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IManualPaymentAccount, ManualPaymentProvider } from "@/types/payment.types";
import { ArrowLeft, Check, Copy, Info, Loader2, Lock } from "lucide-react";

const providerBrand: Record<
  ManualPaymentProvider,
  { badge: string; accent: string; initials: string }
> = {
  KPay: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "from-blue-600 to-blue-500",
    initials: "K",
  },
  "AYA Pay": {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-violet-600 to-violet-500",
    initials: "A",
  },
  "Wave Money": {
    badge: "bg-yellow-50 text-yellow-800 border-yellow-200",
    accent: "from-yellow-500 to-amber-500",
    initials: "W",
  },
  "UAB Pay": {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "from-emerald-600 to-emerald-500",
    initials: "U",
  },
  "CB Pay": {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    accent: "from-rose-600 to-rose-500",
    initials: "C",
  },
  Other: {
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    accent: "from-slate-600 to-slate-500",
    initials: "O",
  },
};

async function copyToClipboard(text: string) {
  // Clipboard API can fail in sandboxed/iframe environments.
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetPublicManualPaymentInfoQuery();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  /**
   * `null` = user has not tapped a card yet; we derive a default once accounts load
   * (e.g. match prior selection from cart, else first account).
   */
  const [userPickedIndex, setUserPickedIndex] = useState<number | null>(null);
  const [reference, setReference] = useState(cart.manualTransferReference || "");
  const [mockLoading, setMockLoading] = useState(false);

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
    if (!selectedAccount) {
      toast.error("Please select an account to transfer to.");
      return;
    }
    if (!reference.trim()) {
      toast.error("Please enter your transaction ID.");
      return;
    }

    dispatch(
      saveManualTransferPayment({
        provider: selectedAccount.provider,
        reference: reference.trim(),
      })
    );

    try {
      setMockLoading(true);
      await new Promise((r) => setTimeout(r, 650));

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
          id: `manual:${selectedAccount.provider}:${reference.trim()}`,
          status: "pending",
        },
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      dispatch(clearCartItems());
      toast.success("Order placed. We’ll confirm your transfer soon.");
      navigate("/");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "data" in err
          ? // @ts-expect-error RTK Query error shape
          (err.data?.message as string | undefined)
          : undefined;
      toast.error(message || "Failed to place order");
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold tracking-widest uppercase text-emerald-700">
            <Lock className="size-4" />
            Secure
          </div>
        </div>

        {/* Steps */}
        <CheckoutSteps currentStep={2} className="mb-8" />

        {/* Main */}
        <Card className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Manual Transfer
            </CardTitle>
            <p className="text-sm text-slate-500">
              Choose an account, transfer the total, then enter your transaction ID to place the order.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* Instructions */}
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-2xl bg-white border border-blue-100 text-blue-700 shadow-sm">
                  <Info className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-blue-700">
                    Instructions
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {isLoading
                      ? "Loading…"
                      : isError
                        ? "Failed to load payment instructions."
                        : data?.instructions}
                  </div>
                  {data?.enabled === false && (
                    <div className="mt-3 text-sm font-semibold text-rose-700">
                      Manual transfer is currently disabled by admin.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account list */}
            <div>
              <div className="flex items-end justify-between gap-3 mb-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-slate-500">
                    Select an account
                  </div>
                  <div className="text-sm text-slate-700">
                    Tap to select. You can copy the account number.
                  </div>
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  No payment accounts configured yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {accounts.map((a, idx) => {
                    const brand =
                      providerBrand[(a.provider as ManualPaymentProvider) ?? "Other"] ??
                      providerBrand.Other;
                    const selected = idx === selectedIndex;

                    return (
                      <button
                        key={`${a.provider}-${a.accountNumber}-${idx}`}
                        type="button"
                        onClick={() => setUserPickedIndex(idx)}
                        className={cn(
                          "text-left rounded-[2rem] border bg-white p-5 shadow-sm transition-all",
                          selected
                            ? "border-[#2563EB] ring-4 ring-blue-100"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div
                              className={cn(
                                "shrink-0 size-12 rounded-2xl text-white shadow-sm bg-gradient-to-br flex items-center justify-center font-black",
                                brand.accent
                              )}
                            >
                              {brand.initials}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide",
                                    brand.badge
                                  )}
                                >
                                  {a.provider}
                                </span>
                                {selected && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB]">
                                    <Check className="size-4" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 font-black text-slate-900 truncate">
                                {a.accountName}
                              </div>
                              <div className="mt-1 text-sm text-slate-600 font-mono tracking-tight">
                                {a.accountNumber}
                              </div>
                              {(a.phoneNumber || a.note) && (
                                <div className="mt-2 text-xs text-slate-500">
                                  {a.phoneNumber ? <span>Phone: {a.phoneNumber}</span> : null}
                                  {a.phoneNumber && a.note ? <span> · </span> : null}
                                  {a.note ? <span>{a.note}</span> : null}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-full border border-slate-200 bg-white hover:bg-slate-50"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const ok = await copyToClipboard(a.accountNumber);
                                if (ok) toast.success("Account number copied");
                                else toast.error("Copy failed");
                              }}
                            >
                              <Copy className="size-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reference input */}
            <div className="relative">
              <div className="absolute -top-2 left-5 bg-white px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                Transaction ID
              </div>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter transaction / reference number"
                className="h-14 rounded-[2rem] border-slate-200 bg-white shadow-sm focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:border-[#2563EB]"
              />
            </div>

            {/* Primary action */}
            <Button
              className="w-full h-14 rounded-[2rem] text-base md:text-lg font-black bg-[#2563EB] hover:bg-blue-700 shadow-xl"
              onClick={placeOrderHandler}
              disabled={
                mockLoading || isPlacingOrder || data?.enabled === false || accounts.length === 0
              }
            >
              {mockLoading || isPlacingOrder ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Placing Order…
                </>
              ) : (
                <span className="text-white">Place Order</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          By placing this order, you confirm you’ve transferred the exact total amount to the selected account.
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;

