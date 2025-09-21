"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: "bathroom" | "kitchen" | "lounge";
  amount: number;
  onPledge: (room: "bathroom" | "kitchen" | "lounge") => void;
}

const roomConfig = {
  bathroom: {
    name: "Bathroom",
    image: "/bathroom.jpeg",
    buttonColor: "bg-black text-white",
  },
  kitchen: {
    name: "Kitchen",
    image: "/kitchen.jpeg",
    buttonColor: "bg-white text-black",
  },
  lounge: {
    name: "Lounge Room",
    image: "/living_room.jpeg",
    buttonColor: "bg-black text-white",
  },
};

export function RoomCard({ room, amount, onPledge }: RoomCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = roomConfig[room];

  return (
    <div
      className="brutal-card relative cursor-pointer transition-all duration-100 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative h-64 md:h-80 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${config.image})`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-200",
            "bg-black/40",
            isHovered ? "bg-black/60" : "bg-black/40"
          )}
        />

        {/* Amount display - brutalist style */}
        <div className="absolute top-3 right-3 md:top-6 md:right-6 brutal-border bg-white px-2 py-2 md:px-4 md:py-3">
          <div className="text-xl md:text-3xl font-black text-black">
            ${amount.toFixed(2)}
          </div>
          <div className="text-xs font-bold text-black uppercase tracking-widest">
            Pledged
          </div>
        </div>

        {/* Room name - brutalist typography */}
        <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6">
          <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {config.name}
          </h3>
        </div>

        {/* Pledge button - always visible, brutalist style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => onPledge(room)}
            className={cn(
              "brutal-button px-4 py-2 md:px-8 md:py-4 text-sm md:text-lg font-black uppercase tracking-widest",
              config.buttonColor,
              isHovered ? "scale-105" : "scale-100"
            )}
          >
            Pledge Now
          </button>
        </div>
      </div>
    </div>
  );
}
