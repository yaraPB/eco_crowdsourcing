"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function BanContributor() {
  const [address, setAddress] = useState("");

  const { writeContractAsync: banContributor, isPending } = useScaffoldWriteContract("YourContract");

  const handleBan = async () => {
    if (!address.trim()) {
      notification.error("Address is required");
      return;
    }

    try {
      await banContributor({
        functionName: "banContributor",
        args: [address.trim()],
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
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Contributor Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-red-500 focus:outline-none font-mono text-sm"
          />
        </div>
        <button
          onClick={handleBan}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Banning..." : "Ban Contributor"}
        </button>
      </div>
    </div>
  );
}
