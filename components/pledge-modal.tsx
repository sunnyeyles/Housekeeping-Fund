"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPledge } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface PledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: "bathroom" | "kitchen" | "lounge" | null;
  onPledgeAdded: () => void;
}

const roomNames = {
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  lounge: "Lounge Room",
};

export function PledgeModal({
  isOpen,
  onClose,
  room,
  onPledgeAdded,
}: PledgeModalProps) {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    const pledgeAmount = Number.parseFloat(amount);
    if (isNaN(pledgeAmount) || pledgeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addPledge(
        name.trim(),
        pledgeAmount,
        room,
        email.trim()
      );

      if (success) {
        toast({
          title: "Pledge Confirmed!",
          description: `Your $${pledgeAmount.toFixed(2)} pledge to the ${
            roomNames[room]
          } has been recorded.`,
        });

        // Reset form
        setAmount("");
        setName("");
        setEmail("");

        onPledgeAdded();
        onClose();
      } else {
        throw new Error("Failed to save pledge");
      }
    } catch (error) {
      console.error("Error adding pledge:", error);
      toast({
        title: "Error",
        description: "Failed to record your pledge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount("");
      setName("");
      setEmail("");
      onClose();
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="brutal-card max-w-sm sm:max-w-lg p-0 mx-4">
        <div className="p-4 md:p-8">
          <DialogHeader className="mb-6 md:mb-8">
            <DialogTitle className="text-2xl md:text-4xl font-black text-center text-black uppercase tracking-widest">
              Pledge to {roomNames[room]}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <Label
                htmlFor="amount"
                className="text-lg md:text-xl font-black text-black uppercase tracking-wide block"
              >
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="brutal-input text-lg md:text-xl font-bold h-12 md:h-16"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <Label
                htmlFor="name"
                className="text-lg md:text-xl font-black text-black uppercase tracking-wide block"
              >
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="brutal-input text-lg md:text-xl font-bold h-12 md:h-16"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <Label
                htmlFor="email"
                className="text-lg md:text-xl font-black text-black uppercase tracking-wide block"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutal-input text-lg md:text-xl font-bold h-12 md:h-16"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="brutal-button flex-1 bg-white text-black h-12 md:h-16 text-sm md:text-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="brutal-button flex-1 bg-black text-white h-12 md:h-16 text-sm md:text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Pledge"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
