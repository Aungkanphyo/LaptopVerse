import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterStatusType = "all" | "pending" | "succeeded" | "failed";

interface TransactionFilterHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: FilterStatusType;
    onFilterChange: (status: FilterStatusType) => void;
}

const STATUS_OPTIONS: { id: FilterStatusType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending Approval" },
    { id: "succeeded", label: "Succeeded" },
    { id: "failed", label: "Failed" },
];

export const TransactionFilterHeader = memo(
    ({
        searchTerm,
        onSearchChange,
        filterStatus,
        onFilterChange,
    }: TransactionFilterHeaderProps) => {
        return (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                {/* Search Input with Clear Button */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input
                        type="text"
                        aria-label="Search transactions"
                        placeholder="Search Txn Ref, Name, Email, Order ID..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-8 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 placeholder:text-slate-500 rounded-xl"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search query"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div
                    role="tablist"
                    aria-label="Transaction Filter Options"
                    className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0"
                >
                    {STATUS_OPTIONS.map(({ id, label }) => {
                        const isActive = filterStatus === id;

                        return (
                            <Button
                                key={id}
                                role="tab"
                                aria-selected={isActive}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterChange(id)}
                                className={cn(
                                    "rounded-xl transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-900/40"
                                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }
);

TransactionFilterHeader.displayName = "TransactionFilterHeader";