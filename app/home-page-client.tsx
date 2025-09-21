"use client";

import { useState, useEffect } from "react";
import { RoomCard } from "@/components/room-card";
import { PledgeModal } from "@/components/pledge-modal";
import { loadPledges } from "@/lib/storage";

interface HomePageClientProps {
  roomTotals: Record<"bathroom" | "kitchen" | "lounge", number>;
}

export function HomePageClient({
  roomTotals: initialRoomTotals,
}: HomePageClientProps) {
  const [roomTotals, setRoomTotals] = useState(initialRoomTotals);
  const [selectedRoom, setSelectedRoom] = useState<
    "bathroom" | "kitchen" | "lounge" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadPledges();

        // Process room totals
        const roomTotalsData = data.pledges.reduce(
          (
            acc: Record<"bathroom" | "kitchen" | "lounge", number>,
            pledge: { room: "bathroom" | "kitchen" | "lounge"; amount: number }
          ) => {
            acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount;
            return acc;
          },
          { bathroom: 0, kitchen: 0, lounge: 0 }
        );

        setRoomTotals(roomTotalsData);
      } catch (error) {
        console.error("Error loading pledges data:", error);
      }
    };

    loadData();
  }, []);

  const handlePledge = (room: "bathroom" | "kitchen" | "lounge") => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handlePledgeAdded = () => {
    // Reload data instead of refreshing the entire page
    const loadData = async () => {
      try {
        const data = await loadPledges();

        // Process room totals
        const roomTotalsData = data.pledges.reduce(
          (
            acc: Record<"bathroom" | "kitchen" | "lounge", number>,
            pledge: { room: "bathroom" | "kitchen" | "lounge"; amount: number }
          ) => {
            acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount;
            return acc;
          },
          { bathroom: 0, kitchen: 0, lounge: 0 }
        );

        setRoomTotals(roomTotalsData);
      } catch (error) {
        console.error("Error loading pledges data:", error);
      }
    };

    loadData();
  };

  return (
    <>
      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
        <RoomCard
          room="bathroom"
          amount={roomTotals.bathroom}
          onPledge={handlePledge}
        />
        <RoomCard
          room="kitchen"
          amount={roomTotals.kitchen}
          onPledge={handlePledge}
        />
        <RoomCard
          room="lounge"
          amount={roomTotals.lounge}
          onPledge={handlePledge}
        />
      </div>

      <PledgeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        room={selectedRoom}
        onPledgeAdded={handlePledgeAdded}
      />
    </>
  );
}
