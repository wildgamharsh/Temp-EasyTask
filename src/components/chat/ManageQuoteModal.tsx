import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Calendar, Clock, FileText } from "lucide-react";
import { sendProposal, cancelQuote } from "@/lib/quote-actions";
import { format } from "date-fns";

interface ManageQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    quoteData: any;
    currentPrice?: number | null;
}

export function ManageQuoteModal({ isOpen, onClose, conversationId, quoteData, currentPrice }: ManageQuoteModalProps) {
    const [price, setPrice] = useState<string>(currentPrice ? currentPrice.toString() : "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleSendProposal = async () => {
        if (!price || isNaN(parseFloat(price))) return;

        setIsSubmitting(true);
        try {
            await sendProposal(conversationId, parseFloat(price));
            onClose();
        } catch (error) {
            console.error("Failed to send proposal:", error);
            alert("Failed to send proposal. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelQuote = async () => {
        if (!confirm("Are you sure you want to cancel this quote request?")) return;

        setIsCancelling(true);
        try {
            await cancelQuote(conversationId);
            onClose();
        } catch (error) {
            console.error("Failed to cancel quote:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    if (!quoteData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <div className="p-6 pb-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold text-slate-900">Manage Quote</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Review the request and send a proposal to the customer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Service</p>
                                <p className="font-semibold text-slate-900 text-sm">{quoteData.service_name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                                    <p className="font-semibold text-slate-900 text-sm">
                                        {quoteData.event_date ? format(new Date(quoteData.event_date), 'MMM d, yyyy') : 'TBD'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Event Time</p>
                                    <p className="font-semibold text-slate-900 text-sm">
                                        {quoteData.start_time && quoteData.end_time
                                            ? `${quoteData.start_time} - ${quoteData.end_time}`
                                            : (quoteData.event_time || 'TBD')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Label htmlFor="price" className="text-sm font-bold text-slate-700">Proposed Price</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                id="price"
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="pl-10 h-12 text-lg font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            This is the final price the customer will see and pay.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCancelQuote}
                        disabled={isCancelling || isSubmitting}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                    >
                        {isCancelling ? "Cancelling..." : "Cancel Quote"}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Close
                        </Button>
                        <Button
                            onClick={handleSendProposal}
                            disabled={!price || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-lg shadow-blue-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Proposal"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
