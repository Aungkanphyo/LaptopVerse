import type { ManualPaymentProvider } from "@/types/payment.types";

export interface ProviderBrandConfig {
    badge: string;
    accent: string;
    initials: string;
}

export const PROVIDER_BRAND: Record<ManualPaymentProvider, ProviderBrandConfig> = {
    KPay: {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        accent: "from-blue-600 to-blue-500",
        initials: "K",
    },
    "AYA Pay": {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        accent: "from-purple-600 to-purple-500",
        initials: "A",
    },
    "Wave Money": {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        accent: "from-amber-500 to-yellow-500",
        initials: "W",
    },
    "UAB Pay": {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        accent: "from-emerald-600 to-emerald-500",
        initials: "U",
    },
    "CB Pay": {
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        accent: "from-rose-600 to-rose-500",
        initials: "C",
    },
    Other: {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        accent: "from-slate-600 to-slate-500",
        initials: "O",
    },
};