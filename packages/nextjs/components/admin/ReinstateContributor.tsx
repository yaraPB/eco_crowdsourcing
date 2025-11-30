"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function ReinstateContributor() {
  const [address, setAddress] = useState("");

  const { writeContractAsync: reinstate, isPending } = useScaffoldWriteContract("YourContract");

  const handleReinstate = async () => {
    if (!address) {
      notification.error("Address is required");
      return;
    }

    try {
      await reinstate({
        functionName: "reinstateContributor",
        args: [address as `0x${string}`],
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
      <p className="text-gray-600 text-sm mb-4">
        Reinstate a banned contributor (resets score to 0 and reactivates account)
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Contributor Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-green-400 focus:outline-none font-mono text-sm"
          />
        </div>

        <button
          onClick={handleReinstate}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Reinstating..." : "Reinstate Contributor"}
        </button>
      </div>
    </div>
  );
}
