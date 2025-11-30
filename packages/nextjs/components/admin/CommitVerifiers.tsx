"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function CommitVerifiers() {
  const [submissionId, setSubmissionId] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");

  const { writeContractAsync: commitVerifiers, isPending } = useScaffoldWriteContract("YourContract");

  const handleCommit = async () => {
    if (!submissionId || !merkleRoot) {
      notification.error("All fields are required");
      return;
    }

    try {
      await commitVerifiers({
        functionName: "commitVerifiers",
        args: [BigInt(submissionId), merkleRoot as `0x${string}`],
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
      <h3 className="text-xl font-bold text-[#800020] mb-4">1️⃣ Commit Verifiers</h3>
      <p className="text-gray-600 text-sm mb-4">
        Assign 8 verifiers to a pending submission. Provide the merkle root containing the 8 assigned verifier addresses.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Submission ID</label>
          <input
            type="number"
            value={submissionId}
            onChange={e => setSubmissionId(e.target.value)}
            placeholder="e.g., 1"
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Merkle Root (8 verifiers)</label>
          <input
            type="text"
            value={merkleRoot}
            onChange={e => setMerkleRoot(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Merkle root of 8 verifier addresses (tree depth 3)
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Committing..." : "Commit Verifiers"}
        </button>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-300 rounded-lg p-3">
        <p className="text-blue-800 text-xs">
          <strong>Note:</strong> This starts a 2-month verification window. Verifiers will need 3-element merkle proofs to vote.
        </p>
      </div>
    </div>
  );
}
