import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAdminManualPaymentSettingsQuery,
  useUpdateAdminManualPaymentSettingsMutation,
} from "@/features/payment/paymentApiSlice";
import type { IManualPaymentAccount, ManualPaymentProvider } from "@/types/payment.types";
import { useRef } from "react";
import { toast } from "sonner";

const providerOptions: ManualPaymentProvider[] = [
  "KPay",
  "AYA Pay",
  "Wave Money",
  "UAB Pay",
  "CB Pay",
  "Other",
];

function parseAccounts(text: string): IManualPaymentAccount[] {
  // Format (one per line):
  // Provider | Account Name | Account Number | Phone? | Note? | Active? | Sort?
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const accounts: IManualPaymentAccount[] = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split("|").map((p) => p.trim());
    const provider = (parts[0] || "Other") as ManualPaymentProvider;
    const accountName = parts[1] || "";
    const accountNumber = parts[2] || "";
    const phoneNumber = parts[3] || undefined;
    const note = parts[4] || undefined;
    const isActive = (parts[5] ? parts[5].toLowerCase() !== "false" : true) as boolean;
    const sortOrder = parts[6] ? Number(parts[6]) || 0 : i;

    accounts.push({
      provider: providerOptions.includes(provider) ? provider : "Other",
      accountName,
      accountNumber,
      phoneNumber,
      note,
      isActive,
      sortOrder,
    });
  }
  return accounts;
}

function formatAccounts(accounts: IManualPaymentAccount[]) {
  return accounts
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => {
      const phone = a.phoneNumber || "";
      const note = a.note || "";
      const active = a.isActive ? "true" : "false";
      return `${a.provider} | ${a.accountName} | ${a.accountNumber} | ${phone} | ${note} | ${active} | ${a.sortOrder}`;
    })
    .join("\n");
}

const ManualPaymentSettings = () => {
  const { data, isLoading, isError, refetch } = useGetAdminManualPaymentSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateAdminManualPaymentSettingsMutation();

  const enabledRef = useRef<HTMLInputElement | null>(null);
  const instructionsRef = useRef<HTMLTextAreaElement | null>(null);
  const accountsRef = useRef<HTMLTextAreaElement | null>(null);

  const saveHandler = async () => {
    try {
      const enabled = enabledRef.current?.checked ?? true;
      const instructions = instructionsRef.current?.value ?? "";
      const accountsText = accountsRef.current?.value ?? "";
      const accounts = parseAccounts(accountsText);

      await updateSettings({ enabled, instructions, accounts }).unwrap();
      toast.success("Manual payment settings updated.");
      refetch();
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Card className="border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Manual Payment Settings</CardTitle>
          <p className="text-gray-500 text-sm">
            Configure KPay / AYA Pay / Wave Money / UAB Pay / CB Pay account details shown to customers at checkout.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : isError ? (
            <div className="text-sm text-red-600">Failed to load settings.</div>
          ) : !data?.settings ? (
            <div className="text-sm text-red-600">Settings not found.</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <input
                  id="enabled"
                  type="checkbox"
                  defaultChecked={data.settings.enabled}
                  ref={enabledRef}
                  className="size-4"
                />
                <Label htmlFor="enabled">Enable manual transfer at checkout</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  defaultValue={data.settings.instructions}
                  ref={instructionsRef}
                  className="min-h-28"
                  placeholder="Tell customers how to transfer and what reference to provide."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accounts">Accounts (one per line)</Label>
                <Textarea
                  id="accounts"
                  defaultValue={formatAccounts(data.settings.accounts || [])}
                  ref={accountsRef}
                  className="min-h-56 font-mono text-sm"
                  placeholder="KPay | Mg Mg | 09xxxxxxx | 09xxxxxxx | note | true | 0"
                />
                <p className="text-xs text-gray-500">
                  Format: <span className="font-mono">Provider | Account Name | Account Number | Phone | Note | Active(true/false) | Sort</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveHandler} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualPaymentSettings;

