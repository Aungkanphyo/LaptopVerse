import { useState } from "react";
import {
    useGetInquiriesAdminQuery,
    useUpdateInquiryStatusAdminMutation,
    useDeleteInquiryAdminMutation,
    useReplyInquiryAdminMutation,
} from "@/features/contact/contactApiSlice";
import {
    Search,
    Trash2,
    CheckCircle2,
    Clock,
    MessageSquare,
    Eye,
    Loader2,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IInquiry, InquiryStatus } from "@/types/inquiry.types";
import Pagination from "@/components/common/Pagination";

const InquiryManagement = () => {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState<IInquiry | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [replyText, setReplyText] = useState("");

    const { data, isLoading } = useGetInquiriesAdminQuery({
        page,
        limit: 10,
        status: statusFilter,
        search: searchTerm,
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateInquiryStatusAdminMutation();
    const [replyInquiry, { isLoading: isSendingReply }] = useReplyInquiryAdminMutation();
    const [deleteInquiry] = useDeleteInquiryAdminMutation();

    const handleOpenDetail = (inquiry: IInquiry) => {
        setSelectedInquiry(inquiry);
        setAdminNotes(inquiry.adminNotes || "");
        setReplyText(inquiry.replyMessage || "");
        if (inquiry.status === "pending") {
            handleStatusChange(inquiry._id, "read");
        }
    };

    const handleStatusChange = async (id: string, status: InquiryStatus) => {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success(`Status updated to ${status}`);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to update status");
        }
    };

    const handleSendReply = async () => {
        if (!selectedInquiry) return;
        if (!replyText.trim()) {
            toast.error("Please enter a reply message before sending.");
            return;
        }

        try {
            await replyInquiry({
                id: selectedInquiry._id,
                replyMessage: replyText,
            }).unwrap();

            toast.success(`Email reply sent to ${selectedInquiry.email}!`);
            setSelectedInquiry(null);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to send email reply");
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedInquiry) return;
        try {
            await updateStatus({ id: selectedInquiry._id, adminNotes }).unwrap();
            toast.success("Admin notes saved successfully!");
            setSelectedInquiry(null);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || "Failed to save notes");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            await deleteInquiry(id).unwrap();
            toast.success("Inquiry deleted");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to delete inquiry");
        }
    };

    const getStatusBadge = (status: InquiryStatus) => {
        switch (status) {
            case "pending":
                return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="size-3" /> Pending</span>;
            case "read":
                return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Eye className="size-3" /> Read</span>;
            case "replied":
                return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="size-3" /> Replied</span>;
        }
    };

    return (
        <div className="p-6 space-y-6 text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">Customer Inquiries</h1>
                    <p className="text-xs text-slate-400 mt-1">Manage and respond to user messages submitted via Contact Us.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-[#0d1222] p-1.5 rounded-xl border border-slate-800">
                    {(["all", "pending", "read", "replied"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setStatusFilter(tab); setPage(1); }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${statusFilter === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by name, email or message..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1222] border border-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Messages Table */}
            <div className="bg-[#0d1222] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12 text-slate-400">
                        <Loader2 className="size-6 animate-spin text-blue-500 mr-2" /> Loading inquiries...
                    </div>
                ) : data?.data.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">No inquiries found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#070913] text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="p-4">Sender</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {data?.data.map((inquiry) => (
                                    <tr key={inquiry._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-white">{inquiry.name}</p>
                                            <p className="text-slate-400 text-[11px]">{inquiry.email}</p>
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-slate-300">{inquiry.message}</td>
                                        <td className="p-4">{getStatusBadge(inquiry.status)}</td>
                                        <td className="p-4 text-slate-400">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDetail(inquiry)} className="hover:bg-blue-500/10 text-blue-400">
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(inquiry._id)} className="hover:bg-rose-500/10 text-rose-400">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reusable Pagination Component */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div className="p-2 border-t border-slate-800 bg-[#070913]">
                        <Pagination
                            currentPage={page}
                            totalPages={data.pagination.totalPages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                )}
            </div>

            {/* Inquiry Detail Modal */}
            {selectedInquiry && (
                <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
                    <DialogContent className="bg-[#0d1222] border-slate-800 text-slate-100 max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="size-5 text-blue-500" /> Inquiry Details
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 text-sm mt-2">
                            <div className="p-3.5 rounded-xl bg-[#070913] border border-slate-800/80">
                                <p className="text-slate-400 text-xs font-medium">From:</p>
                                <p className="font-bold text-white text-base mt-0.5">{selectedInquiry.name} ({selectedInquiry.email})</p>
                                <p className="text-slate-500 text-xs mt-1">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                            </div>

                            <div>
                                <p className="text-slate-400 mb-1.5 font-semibold text-sm">Message:</p>
                                <div className="p-3.5 rounded-xl bg-[#070913] border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            {/* Direct Email Reply Section */}
                            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-blue-400 font-semibold text-sm flex items-center gap-1.5">
                                        <Send className="size-3.5" /> Direct Email Reply to Customer
                                    </p>
                                    {selectedInquiry.status === "replied" && (
                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                            Already Replied
                                        </span>
                                    )}
                                </div>

                                <textarea
                                    rows={4}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Write your response to send directly to ${selectedInquiry.email}...`}
                                    className="w-full p-3 rounded-xl bg-[#070913] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-500"
                                />

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={isSendingReply || !replyText.trim()}
                                        className="bg-blue-600 hover:bg-blue-500 text-sm h-9 px-4 flex items-center gap-2 font-medium"
                                    >
                                        {isSendingReply ? (
                                            <>
                                                <Loader2 className="size-3.5 animate-spin" /> Sending Email...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="size-3.5" /> Send Reply Email
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 mb-1.5 font-semibold text-sm">Status Action:</p>
                                <div className="flex gap-2">
                                    {(["pending", "read", "replied"] as InquiryStatus[]).map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => handleStatusChange(selectedInquiry._id, st)}
                                            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${selectedInquiry.status === st ? "bg-blue-600 text-white" : "bg-[#070913] border border-slate-800 text-slate-400 hover:text-white"
                                                }`}
                                        >
                                            Mark {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 mb-1.5 font-semibold text-sm">Admin Notes (Internal):</p>
                                <textarea
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this user or resolution..."
                                    className="w-full p-3 rounded-xl bg-[#070913] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setSelectedInquiry(null)} className="text-sm">Cancel</Button>
                                <Button onClick={handleSaveNotes} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-500 text-sm font-medium">
                                    {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default InquiryManagement;