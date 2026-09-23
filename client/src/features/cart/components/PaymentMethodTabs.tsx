import { cn } from "@/lib/utils";
import { Smartphone, Banknote } from "lucide-react";

export type PaymentTabType = "online" | "cod";

interface PaymentMethodTabsProps {
    activeTab: PaymentTabType;
    onChangeTab: (tab: PaymentTabType) => void;
}

export const PaymentMethodTabs = ({
    activeTab,
    onChangeTab,
}: PaymentMethodTabsProps) => {
    return (
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#070913] border border-slate-800/80 mb-6">
            <button
                type="button"
                onClick={() => onChangeTab("online")}
                className={cn(
                    "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                    activeTab === "online"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                )}
            >
                <Smartphone className="size-4" />
                <span>Online Transfer</span>
            </button>

            <button
                type="button"
                onClick={() => onChangeTab("cod")}
                className={cn(
                    "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                    activeTab === "cod"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                )}
            >
                <Banknote className="size-4" />
                <span>Cash on Delivery</span>
            </button>
        </div>
    );
};