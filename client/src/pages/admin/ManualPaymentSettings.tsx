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

const providerBrand: Record<ManualPaymentProvider, { label: string; badge: string; ring: string }> = {
  KPay: { label: "KPay", badge: "bg-blue-50 text-blue-700 border-blue-200", ring: "focus-visible:ring-blue-200" },
  "AYA Pay": { label: "AYA Pay", badge: "bg-violet-50 text-violet-700 border-violet-200", ring: "focus-visible:ring-violet-200" },
  "Wave Money": { label: "Wave Money", badge: "bg-yellow-50 text-yellow-800 border-yellow-200", ring: "focus-visible:ring-yellow-200" },
  "UAB Pay": { label: "UAB Pay", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "focus-visible:ring-emerald-200" },
  "CB Pay": { label: "CB Pay", badge: "bg-rose-50 text-rose-700 border-rose-200", ring: "focus-visible:ring-rose-200" },
  Other: { label: "Other", badge: "bg-slate-50 text-slate-700 border-slate-200", ring: "focus-visible:ring-slate-200" },
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
          "inline-flex size-5 items-center justify-center rounded-full bg-white/80 border",
          checked ? "border-emerald-200" : "border-rose-200"
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full",
            checked ? "bg-emerald-500" : "bg-rose-500"
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
      <div className="absolute -top-2 left-3 z-10 bg-white px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
        {label}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-3xl border-slate-200 bg-white shadow-sm focus-visible:ring-slate-200"
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
          ? // @ts-expect-error RTK Query error shape
          (err.data?.message as string | undefined)
          : undefined;
      toast.error(message || "Failed to update settings");
    }
  };

  return (
    <div className="relative">
      <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Manual Payment Settings
              </CardTitle>
              <p className="text-slate-500 text-sm mt-1">
                Premium checkout transfer options (KPay, AYA Pay, Wave Money, UAB Pay, CB Pay).
              </p>
            </div>

            <TogglePill
              checked={draft.enabled}
              onChange={(next) => setDraft((d) => ({ ...d, enabled: next }))}
              activeLabel="Payment Active"
              inactiveLabel="Payment Disabled"
              activeClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
              inactiveClassName="border-rose-200 bg-rose-50 text-rose-700"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-28">
          {/* Instructions */}
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
                <Info className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 tracking-tight">
                    Customer Instructions
                  </h3>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                    Checkout-facing
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  This text appears on the payment page. Keep it short, clear, and action-oriented.
                </p>
                <Textarea
                  value={draft.instructions}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, instructions: e.target.value }))
                  }
                  className="mt-4 min-h-28 rounded-[2rem] border-slate-200 bg-white shadow-sm focus-visible:ring-slate-200"
                  placeholder="Example: Transfer the total amount to one account below, then enter your transaction reference to place the order."
                />
              </div>
            </div>
          </div>

          {/* Accounts */}
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 tracking-tight">
                  Payment Accounts
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add multiple providers. Each account can be independently enabled/disabled.
                </p>
              </div>
              <Button
                type="button"
                onClick={addAccount}
                className="h-11 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
              >
                <Plus className="size-4 mr-2" />
                Add Account
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              {draft.accounts.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                    <BadgeCheck className="size-6" />
                  </div>
                  <div className="font-bold text-slate-900">
                    No accounts yet
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
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
                        className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-5"
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
                            <div className="text-sm text-slate-500">
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
                              activeClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
                              inactiveClassName="border-rose-200 bg-rose-50 text-rose-700"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeAccount(idx)}
                              className="h-10 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <div className="relative">
                              <div className="absolute -top-2 left-3 z-10 bg-white px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
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
                                  "h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm shadow-sm outline-none focus-visible:ring-4",
                                  brand.ring
                                )}
                              >
                                {providerOptions.map((p) => (
                                  <option key={p} value={p}>
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
                              <div className="absolute -top-2 left-3 z-10 bg-white px-2 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                                Note (optional)
                              </div>
                              <Input
                                value={account.note || ""}
                                onChange={(e) => updateAccount(idx, { note: e.target.value })}
                                placeholder="Optional: branch, transfer note, limits, hours…"
                                className="h-12 rounded-3xl border-slate-200 bg-white shadow-sm focus-visible:ring-slate-200"
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

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
                <Save className="size-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {activeCount} active account{activeCount === 1 ? "" : "s"}
                </div>
                <div className="text-xs text-slate-500">
                  Payment system is{" "}
                  <span className={cn("font-semibold", draft.enabled ? "text-emerald-700" : "text-rose-700")}>
                    {draft.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={saveHandler}
              disabled={isSaving}
              className="h-12 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 shadow-sm px-6"
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Loader2 className="size-5 animate-spin" />
              <span className="font-semibold">Loading manual payment settings…</span>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm text-rose-800">
            <div className="font-extrabold text-lg">Failed to load settings</div>
            <div className="text-sm mt-1">
              Please refresh and ensure you are logged in as an admin.
            </div>
          </div>
        ) : !data?.settings ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm text-rose-800">
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
    </div>
  );
};

export default ManualPaymentSettings;