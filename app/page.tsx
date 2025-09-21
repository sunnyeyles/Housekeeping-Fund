"use client";

import { useState, useEffect } from "react";
import { RoomCard } from "@/components/room-card";
import { StatsSection } from "@/components/stats-section";
import { PledgeModal } from "@/components/pledge-modal";
import { CountdownTimer } from "@/components/countdown-timer";
import { getPledgesByRoom, getPledgesByPerson } from "@/lib/storage";

export default function HomePage() {
  const [roomTotals, setRoomTotals] = useState<
    Record<"bathroom" | "kitchen" | "lounge", number>
  >({
    bathroom: 0,
    kitchen: 0,
    lounge: 0,
  });
  const [personTotals, setPersonTotals] = useState<
    Array<{ name: string; total: number; email: string }>
  >([]);
  const [selectedRoom, setSelectedRoom] = useState<
    "bathroom" | "kitchen" | "lounge" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [roomData, personData] = await Promise.all([
        getPledgesByRoom(),
        getPledgesByPerson(),
      ]);
      setRoomTotals(roomData);
      setPersonTotals(personData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
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
    loadData();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header - Brutalist style */}
        <div className="text-center mb-8 md:mb-16">
          <div className="brutal-border bg-black p-4 md:p-8 mb-6 md:mb-8">
            <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 uppercase tracking-widest">
              Housekeeping Fund
            </h1>
            <p className="text-lg md:text-2xl font-bold text-white uppercase tracking-wide max-w-4xl mx-auto leading-relaxed">
              Keep the cockroaches out of the house!
            </p>
          </div>
        </div>

        <div className="mb-12">
          <CountdownTimer />
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <StatsSection roomTotals={roomTotals} personTotals={personTotals} />
        </div>

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
      </div>
    </div>
  );
}
