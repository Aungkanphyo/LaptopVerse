import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAdminManualPaymentSettingsQuery,
  useUpdateAdminManualPaymentSettingsMutation,
} from "@/features/payment/paymentApiSlice";
import type { IManualPaymentAccount, IManualPaymentSettings, ManualPaymentProvider } from "@/types/payment.types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";

const providerOptions: ManualPaymentProvider[] = [
  "KPay",
  "AYA Pay",
  "Wave Money",
  "UAB Pay",
  "CB Pay",
  "Other",
];

// IMPROVEMENT: Updated provider badge themes for dark contrast
const providerBrand: Record<ManualPaymentProvider, { label: string; badge: string; ring: string }> = {
  KPay: { label: "KPay", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", ring: "focus-visible:ring-blue-500/30" },
  "AYA Pay": { label: "AYA Pay", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20", ring: "focus-visible:ring-violet-500/30" },
  "Wave Money": { label: "Wave Money", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", ring: "focus-visible:ring-yellow-500/30" },
  "UAB Pay": { label: "UAB Pay", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", ring: "focus-visible:ring-emerald-500/30" },
  "CB Pay": { label: "CB Pay", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", ring: "focus-visible:ring-rose-500/30" },
  Other: { label: "Other", badge: "bg-slate-800 text-slate-300 border-slate-700", ring: "focus-visible:ring-slate-700" },
};

function TogglePill({
  checked,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Disabled",
  activeClassName,
  inactiveClassName,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeClassName: string;
  inactiveClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-full border px-3 shadow-sm transition-all select-none",
        checked ? activeClassName : inactiveClassName
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full border",
          checked ? "border-emerald-500/30 bg-emerald-950/80" : "border-rose-500/30 bg-rose-950/80"
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full",
            checked ? "bg-emerald-400" : "bg-rose-400"
          )}
        />
      </span>
      <span className="text-xs font-semibold tracking-widest uppercase">
        {checked ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}

function FloatingField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      <div className="absolute -top-2 left-3 z-10 bg-slate-900 px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
        {label}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-slate-700"
      />
    </div>
  );
}

function toDraft(settings: IManualPaymentSettings) {
  const accounts =
    (settings.accounts || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((a, idx) => ({
        ...a,
        provider: providerOptions.includes(a.provider as ManualPaymentProvider)
          ? (a.provider as ManualPaymentProvider)
          : ("Other" as const),
        sortOrder: Number.isFinite(a.sortOrder) ? a.sortOrder : idx,
        isActive: a.isActive ?? true,
        note: a.note ?? "",
        phoneNumber: a.phoneNumber ?? "",
      })) || [];

  return {
    enabled: settings.enabled,
    instructions: settings.instructions,
    accounts,
  };
}

function normalizeAccounts(accounts: Array<IManualPaymentAccount & { phoneNumber?: string; note?: string }>) {
  return accounts.map((a, idx) => ({
    provider: a.provider,
    accountName: a.accountName.trim(),
    accountNumber: a.accountNumber.trim(),
    phoneNumber: a.phoneNumber?.trim() ? a.phoneNumber.trim() : undefined,
    note: a.note?.trim() ? a.note.trim() : undefined,
    isActive: Boolean(a.isActive),
    sortOrder: idx,
  }));
}

const ManualPaymentSettingsForm = ({
  settings,
  onSaved,
}: {
  settings: IManualPaymentSettings;
  onSaved: () => void;
}) => {
  const [updateSettings, { isLoading: isSaving }] =
    useUpdateAdminManualPaymentSettingsMutation();

  const [draft, setDraft] = useState(() => toDraft(settings));

  const activeCount = useMemo(
    () => draft.accounts.filter((a) => a.isActive).length,
    [draft.accounts]
  );

  const addAccount = () => {
    setDraft((d) => ({
      ...d,
      accounts: [
        ...d.accounts,
        {
          provider: "KPay",
          accountName: "",
          accountNumber: "",
          phoneNumber: "",
          note: "",
          isActive: true,
          sortOrder: d.accounts.length,
        },
      ],
    }));
  };

  const removeAccount = (idx: number) => {
    setDraft((d) => ({
      ...d,
      accounts: d.accounts.filter((_, i) => i !== idx).map((a, i) => ({ ...a, sortOrder: i })),
    }));
  };

  const updateAccount = (idx: number, patch: Partial<IManualPaymentAccount & { phoneNumber?: string; note?: string }>) => {
    setDraft((d) => ({
      ...d,
      accounts: d.accounts.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));
  };

  const saveHandler = async () => {
    try {
      const accounts = normalizeAccounts(draft.accounts);
      await updateSettings({
        enabled: draft.enabled,
        instructions: draft.instructions.trim(),
        accounts,
      }).unwrap();
      toast.success("Manual payment settings updated.");
      onSaved();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || "Failed to update settings");
    }
  };

  return (
    <div className="relative text-slate-100">
      {/* IMPROVEMENT: Glassmorphism Card in Dark Theme */}
      <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800/60">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Manual Payment Settings
              </CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                Premium checkout transfer options (KPay, AYA Pay, Wave Money, UAB Pay, CB Pay).
              </p>
            </div>

            <TogglePill
              checked={draft.enabled}
              onChange={(next) => setDraft((d) => ({ ...d, enabled: next }))}
              activeLabel="Payment Active"
              inactiveLabel="Payment Disabled"
              activeClassName="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              inactiveClassName="border-rose-500/30 bg-rose-500/10 text-rose-400"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6 pb-28">
          {/* Instructions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400">
                <Info className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white tracking-tight">
                    Customer Instructions
                  </h3>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                    Checkout-facing
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  This text appears on the payment page. Keep it short, clear, and action-oriented.
                </p>
                <Textarea
                  value={draft.instructions}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, instructions: e.target.value }))
                  }
                  className="mt-4 min-h-28 rounded-2xl border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-slate-700"
                  placeholder="Example: Transfer the total amount to one account below, then enter your transaction reference to place the order."
                />
              </div>
            </div>
          </div>

          {/* Accounts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-extrabold text-white tracking-tight">
                  Payment Accounts
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Add multiple providers. Each account can be independently enabled/disabled.
                </p>
              </div>
              <Button
                type="button"
                onClick={addAccount}
                className="h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-950/20"
              >
                <Plus className="size-4 mr-2" />
                Add Account
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              {draft.accounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center">
                  <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 shadow-sm">
                    <BadgeCheck className="size-6" />
                  </div>
                  <div className="font-bold text-white">
                    No accounts yet
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Add at least one account so customers can transfer using Myanmar payment providers.
                  </div>
                </div>
              ) : (
                draft.accounts
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((account, idx) => {
                    const brand =
                      providerBrand[account.provider as ManualPaymentProvider] ??
                      providerBrand.Other;

                    return (
                      <div
                        key={`${idx}-${account.sortOrder}`}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide",
                                brand.badge
                              )}
                            >
                              {brand.label}
                            </span>
                            <div className="text-sm text-slate-400">
                              Account #{idx + 1}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TogglePill
                              checked={account.isActive}
                              onChange={(next) =>
                                updateAccount(idx, { isActive: next })
                              }
                              activeLabel="Active"
                              inactiveLabel="Disabled"
                              activeClassName="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              inactiveClassName="border-rose-500/30 bg-rose-500/10 text-rose-400"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeAccount(idx)}
                              className="h-10 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <div className="relative">
                              <div className="absolute -top-2 left-3 z-10 bg-slate-900 px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                                Provider
                              </div>
                              <select
                                value={account.provider}
                                onChange={(e) =>
                                  updateAccount(idx, {
                                    provider: e.target.value as ManualPaymentProvider,
                                  })
                                }
                                className={cn(
                                  "h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 px-4 text-sm shadow-sm outline-none focus-visible:ring-2",
                                  brand.ring
                                )}
                              >
                                {providerOptions.map((p) => (
                                  <option key={p} value={p} className="bg-slate-900 text-slate-100">
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="md:col-span-4">
                            <FloatingField
                              label="Holder Name"
                              value={account.accountName}
                              onChange={(v) => updateAccount(idx, { accountName: v })}
                              placeholder="e.g. Mg Mg"
                            />
                          </div>

                          <div className="md:col-span-5">
                            <FloatingField
                              label="Account Number"
                              value={account.accountNumber}
                              onChange={(v) => updateAccount(idx, { accountNumber: v })}
                              placeholder="e.g. 09xxxxxxxxx"
                            />
                          </div>

                          <div className="md:col-span-12">
                            <div className="group relative">
                              <div className="absolute -top-2 left-3 z-10 bg-slate-900 px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                                Note (optional)
                              </div>
                              <Input
                                value={account.note || ""}
                                onChange={(e) => updateAccount(idx, { note: e.target.value })}
                                placeholder="Optional: branch, transfer note, limits, hours…"
                                className="h-12 rounded-2xl border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IMPROVEMENT: Sticky Action Bar in Dark Theme */}
      <div className="sticky bottom-4 z-40 mt-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 shadow-sm">
                <Save className="size-5" />
              </div>
              <div>
                <div className="font-bold text-white">
                  {activeCount} active account{activeCount === 1 ? "" : "s"}
                </div>
                <div className="text-xs text-slate-400">
                  Payment system is{" "}
                  <span className={cn("font-semibold", draft.enabled ? "text-emerald-400" : "text-rose-400")}>
                    {draft.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={saveHandler}
              disabled={isSaving}
              className="h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-950/20 px-6"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualPaymentSettings = () => {
  const { data, isLoading, isError, refetch } =
    useGetAdminManualPaymentSettingsQuery();

  return (
    <div className="max-w-5xl mx-auto p-6 text-slate-100">
      {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="size-5 animate-spin text-blue-500" />
              <span className="font-semibold">Loading manual payment settings…</span>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 shadow-sm text-rose-300">
            <div className="font-extrabold text-lg">Failed to load settings</div>
            <div className="text-sm mt-1">
              Please refresh and ensure you are logged in as an admin.
            </div>
          </div>
        ) : !data?.settings ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 shadow-sm text-rose-300">
            <div className="font-extrabold text-lg">Settings not found</div>
            <div className="text-sm mt-1">Try again in a moment.</div>
          </div>
        ) : (
          <ManualPaymentSettingsForm
            key={data.settings.updatedAt}
            settings={data.settings}
            onSaved={() => refetch()}
          />
        )}
    </div>
  );
};

export default ManualPaymentSettings;