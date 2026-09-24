import { Button } from "@/components/ui/button";
import { PaymentAccountCard } from "./PaymentAccountCard";
import { PaymentSlipUpload } from "./PaymentSlipUpload";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import type { IManualPaymentAccount } from "@/types/payment.types";

interface OnlineTransferSectionProps {
    instructions?: string;
    isLoadingInstructions: boolean;
    isInstructionsError: boolean;
    accounts: IManualPaymentAccount[];
    selectedIndex: number;
    onSelectAccountIndex: (index: number) => void;
    slipFile: File | null;
    slipPreview: string | null;
    onFileSelect: (file: File) => void;
    onRemoveFile: () => void;
    onSubmitOrder: () => void;
    isPlacingOrder: boolean;
}

export const OnlineTransferSection = ({
    instructions,
    isLoadingInstructions,
    isInstructionsError,
    accounts,
    selectedIndex,
    onSelectAccountIndex,
    slipFile,
    slipPreview,
    onFileSelect,
    onRemoveFile,
    onSubmitOrder,
    isPlacingOrder,
}: OnlineTransferSectionProps) => {
    const getInstructionText = () => {
        if (isLoadingInstructions) return "Loading instructions...";
        if (isInstructionsError) return "Failed to load payment instructions.";
        return instructions || "Transfer the total amount to one of the accounts below. Then upload your payment screenshot or reference ID to place your order.";
    };
    return (
        <div className="space-y-6">
            {/* Instructions Box */}
            <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
                        <Info className="size-5" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold tracking-widest uppercase text-blue-400">
                            INSTRUCTIONS
                        </div>
                        <p className="mt-1 text-xs md:text-sm text-slate-300 leading-relaxed">
                            {getInstructionText()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Account Selector */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                        SELECT ACCOUNT
                    </span>
                    <span className="text-xs text-slate-500">Tap card to select</span>
                </div>

                {accounts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-[#070913] p-8 text-center text-slate-500">
                        No payment accounts configured yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((account, idx) => (
                            <PaymentAccountCard
                                key={`${account.provider}-${account.accountNumber}-${idx}`}
                                account={account}
                                isSelected={idx === selectedIndex}
                                onSelect={() => onSelectAccountIndex(idx)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Slip Upload */}
            <PaymentSlipUpload
                slipFile={slipFile}
                slipPreview={slipPreview}
                onFileSelect={onFileSelect}
                onRemoveFile={onRemoveFile}
            />

            {/* Submit Action */}
            <Button
                type="button"
                onClick={onSubmitOrder}
                disabled={isPlacingOrder || accounts.length === 0 || !slipFile}
                className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
                {isPlacingOrder ? (
                    <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        Placing Order...
                    </>
                ) : (
                    <span className="flex items-center gap-2">
                        Place Order <ArrowRight className="size-4" />
                    </span>
                )}
            </Button>

            <p className="text-center text-[11px] text-slate-500 leading-snug">
                By placing this order, you confirm you've transferred the exact total
                amount or provided a valid payment receipt.
            </p>
        </div>
    );
};