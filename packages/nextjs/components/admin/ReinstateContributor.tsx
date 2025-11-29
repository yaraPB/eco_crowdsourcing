"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function ReinstateContributor() {
  const [address, setAddress] = useState("");

  const { writeContractAsync: reinstateContributor, isPending } = useScaffoldWriteContract("YourContract");

  const handleReinstate = async () => {
    if (!address.trim()) {
      notification.error("Address is required");
      return;
    }

    try {
      await reinstateContributor({
        functionName: "reinstateContributor",
        args: [address.trim()],
      });

      notification.success("Contributor reinstated successfully!");
      setAddress("");
    } catch (error: any) {
      console.error("Reinstate failed:", error);
      notification.error(error?.message || "Reinstate failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-400">
      <h3 className="text-xl font-bold text-green-700 mb-4">✅ Reinstate Contributor</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Contributor Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
          />
        </div>
        <button
          onClick={handleReinstate}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Reinstating..." : "Reinstate Contributor"}
        </button>
      </div>
    </div>
  );
}
