"use client";

import Image from "next/image";

export function AiOrb() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mb-6">
      <div className="relative w-24 h-24">
        <Image 
            src="/images/logo.png" 
            alt="Bolt Logo" 
            fill 
            className="object-contain"
        />
      </div>
    </div>
  );
}
