import { useState } from "react";
import {
    useGetContactSettingsQuery,
    useUpdateContactSettingsAdminMutation,
    type IContactSettings,
} from "@/features/contact/contactApiSlice";
import { Mail, Phone, MapPin, Clock, Save, Loader2, PhoneCall } from "lucide-react";
import { toast } from "sonner";

// Separating the Form section into a separate Sub-component
const ContactForm = ({ initialData }: { initialData?: IContactSettings }) => {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateContactSettingsAdminMutation();

    const [formData, setFormData] = useState<IContactSettings>({
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        workingHours: initialData?.workingHours || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSettings(formData).unwrap();
            toast.success("Contact details updated successfully");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to update contact settings");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Mail className="size-4 text-blue-400" /> Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="e.g. support@laptopverse.tech"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Phone className="size-4 text-indigo-400" /> Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. +95 9 123 456 789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Store Address */}
                <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <MapPin className="size-4 text-cyan-400" /> Store Physical Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. 100 Tech Plaza, Silicon Hub, Yangon"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Working Hours */}
                <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Clock className="size-4 text-amber-400" /> Working Hours
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Mon - Sat: 9:00 AM - 6:00 PM"
                        value={formData.workingHours}
                        onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-950/20"
                >
                    {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
};

// Main Page Component
const ContactSettingsPage = () => {
    const { data, isLoading } = useGetContactSettingsQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="size-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
            <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <PhoneCall className="size-6 text-blue-500" />
                    Contact Information Settings
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Manage your store contact details shown on the public Contact Us section.
                </p>
            </div>

            <ContactForm initialData={data?.settings} />
        </div>
    );
};

export default ContactSettingsPage;