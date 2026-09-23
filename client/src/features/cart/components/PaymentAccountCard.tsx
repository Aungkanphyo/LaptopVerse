import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROVIDER_BRAND } from "../constants/payment.constants";
import { copyToClipboard } from "../utils/paymentHelpers";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import type { IManualPaymentAccount, ManualPaymentProvider } from "@/types/payment.types";

interface PaymentAccountCardProps {
    account: IManualPaymentAccount;
    isSelected: boolean;
    onSelect: () => void;
}

export const PaymentAccountCard = ({
    account,
    isSelected,
    onSelect,
}: PaymentAccountCardProps) => {
    const brand =
        PROVIDER_BRAND[(account.provider as ManualPaymentProvider) ?? "Other"] ??
        PROVIDER_BRAND.Other;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const ok = await copyToClipboard(account.accountNumber);
        if (ok) {
            toast.success("Account number copied");
        } else {
            toast.error("Copy failed");
        }
    };

    return (
        <div
            onClick={onSelect}
            className={cn(
                "rounded-2xl border p-4 transition-all cursor-pointer flex items-center justify-between gap-4",
                isSelected
                    ? "border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/50"
                    : "border-slate-800/90 bg-[#070913] hover:border-slate-700"
            )}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div
                    className={cn(
                        "shrink-0 size-11 rounded-full text-white font-black flex items-center justify-center bg-linear-to-br shadow-sm text-base",
                        brand.accent
                    )}
                >
                    {brand.initials}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide",
                                brand.badge
                            )}
                        >
                            {account.provider}
                        </span>
                        {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400">
                                <Check className="size-3.5" />
                                Selected
                            </span>
                        )}
                    </div>
                    <div className="mt-1 font-bold text-white text-sm md:text-base truncate">
                        {account.accountName}
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                        {account.accountNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                        {account.note || "LaptopVerse Business Account"}
                    </div>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-700 bg-[#0e1322] text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
                onClick={handleCopy}
            >
                <Copy className="size-3.5 mr-1.5" />
                Copy
            </Button>
        </div>
    );
};