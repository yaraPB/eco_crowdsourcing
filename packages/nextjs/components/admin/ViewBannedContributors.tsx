"use client";

import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function ViewBannedContributors() {
  const [showBanned, setShowBanned] = useState(false);

  const { data: bannedList, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getBannedContributors",
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-400">
      <h3 className="text-xl font-bold text-amber-700 mb-4">📋 View Banned Contributors</h3>
      <button
        onClick={() => setShowBanned(!showBanned)}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
      >
        {showBanned ? "Hide Banned List" : "Show Banned List"}
      </button>

      {showBanned && (
        <div className="mt-4">
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : bannedList && bannedList.length > 0 ? (
            <div className="space-y-2">
              <p className="font-semibold text-gray-700 mb-2">Banned Contributors ({bannedList.length}):</p>
              {bannedList.map((addr: string, idx: number) => (
                <div key={idx} className="bg-red-50 border border-red-300 rounded-lg p-3">
                  <p className="font-mono text-sm text-red-700">{addr}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No banned contributors.</p>
          )}
        </div>
      )}
    </div>
  );
}
