"use client";

import { useState, useEffect, useRef } from "react";
import { getOrderMessages, sendOrderMessage } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, User, Building2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  createdAt: string | Date;
  senderId: number;
  sender: {
    username: string;
    role: string;
  };
}

export default function OrderDiscussion({ 
  orderId, 
  isOpen, 
  onClose,
  currentUserRole
}: { 
  orderId: number; 
  isOpen: boolean; 
  onClose: () => void;
  currentUserRole: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages() {
    setIsLoading(true);
    const res = await getOrderMessages(orderId);
    if (res.messages) {
      setMessages(res.messages as any);
    }
    setIsLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const res = await sendOrderMessage(orderId, newMessage);
    if (res.success) {
      setNewMessage("");
      await loadMessages();
    }
    setIsSending(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
        <DialogHeader className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black font-heading tracking-tight">Order Discussion</DialogTitle>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Ref: #{String(orderId).padStart(6, '0')}</p>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 bg-zinc-50/30 dark:bg-zinc-900/10"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-200 border border-zinc-100 dark:border-zinc-800">
                <MessageSquare size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-xs">No messages yet</p>
                <p className="text-zinc-400 text-xs max-w-[200px] mx-auto">Start the conversation with the {currentUserRole === 'buyer' ? 'seller' : 'buyer'}.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = (currentUserRole === 'buyer' && msg.sender.role === 'buyer') || 
                                 (currentUserRole !== 'buyer' && msg.sender.role !== 'buyer');
              
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {msg.sender.username}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-300">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div 
                    className={cn(
                      "px-6 py-4 rounded-[2rem] text-sm font-medium shadow-sm",
                      isOwnMessage 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-800 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <form onSubmit={handleSend} className="relative flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message the ${currentUserRole === 'buyer' ? 'seller' : 'buyer'}...`}
              className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-600 pr-16"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="absolute right-2 top-2 h-10 w-10 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
          <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-4">
            Direct B2B Discussion · Secure Negotiation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
