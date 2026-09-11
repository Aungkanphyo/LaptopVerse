import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, Bot, User } from 'lucide-react';
import { useAskAiAdvisorMutation } from '../aiApiSlice';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export const AiAdvisorModal = () => {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: 'Hello! I am your LaptopVerse AI Advisor. Describe what you need (e.g., "Gaming laptop under $1200 with 16GB RAM"), and I will match the best choice for you!',
        },
    ]);

    const [askAi, { isLoading }] = useAskAiAdvisorMutation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [messages, open]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`; // Max height 140px ထိပဲ ကျယ်မည်
        }
    }, [prompt]);

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;

        const userMsgText = prompt.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: userMsgText,
        };

        setMessages((prev) => [...prev, userMsg]);
        setPrompt('');

        try {
            const res = await askAi({ prompt: userMsgText }).unwrap();
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: res.data.answer,
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Sorry, I failed to process your request. Please try again.',
            };
            setMessages((prev) => [...prev, errorMsg]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Default Newline ဆင်းခြင်းကို တားဆီးမည်
            handleSend();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Target Button UI */}
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:opacity-95 transition-all cursor-pointer">
                    <Sparkles className="size-3.5 fill-white/20 animate-pulse" />
                    <span>Ask AI Advisor</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-137.5 bg-[#0f172a] border-slate-800 text-white p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="border-b border-slate-800 pb-4">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
                        <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                            <Sparkles className="size-5" />
                        </div>
                        LaptopVerse AI Advisor
                    </DialogTitle>
                </DialogHeader>

                {/* Message Container */}
                <div className="h-90 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex gap-3 text-sm ${m.sender === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {m.sender === 'ai' && (
                                <div className="size-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                                    <Bot className="size-4 text-indigo-400" />
                                </div>
                            )}

                            <div
                                className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line ${m.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                                    }`}
                            >
                                {m.text}
                            </div>

                            {m.sender === 'user' && (
                                <div className="size-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                                    <User className="size-4 text-blue-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 text-sm justify-start">
                            <div className="size-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                                <Bot className="size-4 text-indigo-400" />
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-800/90 text-slate-400 border border-slate-700/60 rounded-tl-none flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin text-indigo-400" />
                                <span>Finding the best laptops for you...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="flex gap-2 pt-3 border-t border-slate-800 items-end">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask LaptopVerse AI Advisor..."
                        rows={1}
                        className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base sm:text-lg p-3 resize-none overflow-y-auto max-h-35 min-h-12 scrollbar-thin scrollbar-thumb-slate-700"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 h-12 shrink-0 rounded-xl"
                    >
                        {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};