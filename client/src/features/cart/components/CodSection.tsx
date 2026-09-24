import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatCurrency";
import {
    ArrowRight,
    CheckCircle2,
    Loader2,
    PackageCheck,
    Phone,
    ShieldCheck,
} from "lucide-react";

interface CodSectionProps {
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    onSubmitOrder: () => void;
    isPlacingOrder: boolean;
}

export const CodSection = ({
    itemsPrice,
    shippingPrice,
    totalPrice,
    onSubmitOrder,
    isPlacingOrder,
}: CodSectionProps) => {
    return (
        <div className="space-y-6">
            {/* COD Instructions Banner */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#070913] p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                    <div className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <PackageCheck className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">
                            Pay with Cash on Delivery
                        </h3>
                        <p className="text-xs text-slate-400">
                            Pay cash directly to the courier when your package arrives.
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                            No advance payment needed. Please prepare exact cash total.
                        </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Phone className="size-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>
                            Our delivery team will contact your phone number before
                            dispatching the order.
                        </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                        <ShieldCheck className="size-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Please inspect package condition upon delivery.</span>
                    </div>
                </div>
            </div>

            {/* Price Summary Box */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#070913] p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-slate-200">
                        {formatPrice(itemsPrice)}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Delivery Fee</span>
                    <span className="font-mono text-slate-200">
                        {formatPrice(shippingPrice)}
                    </span>
                </div>
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                        Total Payable Cash
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-lg">
                        {formatPrice(totalPrice)}
                    </span>
                </div>
            </div>

            {/* Submit Action */}
            <Button
                type="button"
                onClick={onSubmitOrder}
                disabled={isPlacingOrder || totalPrice <= 0}
                className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
                {isPlacingOrder ? (
                    <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        Placing Order...
                    </>
                ) : (
                    <span className="flex items-center gap-2">
                        Confirm COD Order <ArrowRight className="size-4" />
                    </span>
                )}
            </Button>

            <p className="text-center text-[11px] text-slate-500 leading-snug">
                By confirming, you agree to pay cash upon order arrival at your shipping
                address.
            </p>
        </div>
    );
};