"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function CommitVerifiers() {
  const [submissionId, setSubmissionId] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");

  const { writeContractAsync: commitVerifiers, isPending } = useScaffoldWriteContract("YourContract");

  const handleCommit = async () => {
    if (!submissionId.trim() || !merkleRoot.trim()) {
      notification.error("Both fields are required");
      return;
    }

    try {
      await commitVerifiers({
        functionName: "commitVerifiers",
        args: [BigInt(submissionId), merkleRoot.trim()],
      });

      notification.success("Verifiers committed successfully!");
      setSubmissionId("");
      setMerkleRoot("");
    } catch (error: any) {
      console.error("Commit failed:", error);
      notification.error(error?.message || "Commit failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <h3 className="text-xl font-bold text-[#800020] mb-4">🌳 Commit Verifiers (Start Verification Round)</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Submission ID</label>
          <input
            type="number"
            value={submissionId}
            onChange={e => setSubmissionId(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Merkle Root</label>
          <input
            type="text"
            value={merkleRoot}
            onChange={e => setMerkleRoot(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>
        <button
          onClick={handleCommit}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Committing..." : "Commit Verifiers"}
        </button>
      </div>
    </div>
  );
}
