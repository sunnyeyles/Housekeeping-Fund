"use client";

import { useState, useEffect } from "react";
import { RoomCard } from "@/components/room-card";
import { PledgeModal } from "@/components/pledge-modal";
import { StatsSection } from "@/components/stats-section";
import { loadPledges } from "@/lib/storage";

interface HomePageClientProps {
  roomTotals: Record<"bathroom" | "kitchen" | "lounge", number>;
  personTotals: Array<{ name: string; total: number; email: string }>;
}

export function HomePageClient({
  roomTotals: initialRoomTotals,
  personTotals: initialPersonTotals,
}: HomePageClientProps) {
  const [roomTotals, setRoomTotals] = useState(initialRoomTotals);
  const [personTotals, setPersonTotals] = useState(initialPersonTotals);
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

        // Process person totals
        const personTotalsMap = new Map<
          string,
          { total: number; email: string }
        >();
        data.pledges.forEach(
          (pledge: { name: string; amount: number; email: string }) => {
            const key = pledge.name.toLowerCase();
            const existing = personTotalsMap.get(key);
            if (existing) {
              existing.total += pledge.amount;
              existing.email = pledge.email;
            } else {
              personTotalsMap.set(key, {
                total: pledge.amount,
                email: pledge.email,
              });
            }
          }
        );

        const personTotalsData = Array.from(personTotalsMap.entries())
          .map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total: data.total,
            email: data.email,
          }))
          .sort((a, b) => b.total - a.total);

        setRoomTotals(roomTotalsData);
        setPersonTotals(personTotalsData);
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

        // Process person totals
        const personTotalsMap = new Map<
          string,
          { total: number; email: string }
        >();
        data.pledges.forEach(
          (pledge: { name: string; amount: number; email: string }) => {
            const key = pledge.name.toLowerCase();
            const existing = personTotalsMap.get(key);
            if (existing) {
              existing.total += pledge.amount;
              existing.email = pledge.email;
            } else {
              personTotalsMap.set(key, {
                total: pledge.amount,
                email: pledge.email,
              });
            }
          }
        );

        const personTotalsData = Array.from(personTotalsMap.entries())
          .map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total: data.total,
            email: data.email,
          }))
          .sort((a, b) => b.total - a.total);

        setRoomTotals(roomTotalsData);
        setPersonTotals(personTotalsData);
      } catch (error) {
        console.error("Error loading pledges data:", error);
      }
    };

    loadData();
  };

  return (
    <>
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
    </>
  );
}
