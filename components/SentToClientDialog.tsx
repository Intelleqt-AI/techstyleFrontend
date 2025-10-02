"use client";

import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const SentToClientDialog = ({
  open,
  onOpenChange,
  onConfirm, // (message: string) => Promise<any> | any
  itemName = "",
  confirmText = "Send",
  cancelText = "Cancel",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (message: string) => Promise<any> | any;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setMessage("");
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setIsSending(true);
    try {
      await onConfirm(message);
      handleClose();
    } catch (err) {
      console.error("Send failed:", err);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const isValid = message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg z-[99]">
        <DialogHeader className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <DialogTitle>Send to Client</DialogTitle>
            {itemName && (
              <p className="text-sm text-muted-foreground mt-1">"{itemName}"</p>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Add a message to include with the document being sent to the client.
          </p>
          <Input
            type="text"
            placeholder="Enter message to client"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="w-full"
            aria-label="Message to client"
          />
        </div>

        <DialogFooter className="mt-4 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSending}
            variant="default">
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
