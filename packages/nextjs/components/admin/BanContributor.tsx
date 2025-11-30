"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function BanContributor() {
  const [address, setAddress] = useState("");

  const { writeContractAsync: ban, isPending } = useScaffoldWriteContract("YourContract");

  const handleBan = async () => {
    if (!address) {
      notification.error("Address is required");
      return;
    }

    try {
      await ban({
        functionName: "banContributor",
        args: [address as `0x${string}`],
      });

      notification.success("Contributor banned successfully!");
      setAddress("");
    } catch (error: any) {
      console.error("Ban failed:", error);
      notification.error(error?.message || "Ban failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-400">
      <h3 className="text-xl font-bold text-red-700 mb-4">🚫 Ban Contributor</h3>
      <p className="text-gray-600 text-sm mb-4">
        Ban a contributor (sets score to -3 and deactivates account)
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Contributor Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-red-400 focus:outline-none font-mono text-sm"
          />
        </div>

        <button
          onClick={handleBan}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Banning..." : "Ban Contributor"}
        </button>
      </div>
    </div>
  );
}
