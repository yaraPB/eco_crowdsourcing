"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function FinalizeSubmission() {
  const [submissionId, setSubmissionId] = useState("");
  const [salt, setSalt] = useState("");
  const [verifier1, setVerifier1] = useState("");
  const [verifier2, setVerifier2] = useState("");
  const [verifier3, setVerifier3] = useState("");

  const { writeContractAsync: finalizeSubmission, isPending } = useScaffoldWriteContract("YourContract");

  const handleFinalize = async () => {
    if (!submissionId.trim() || !salt.trim() || !verifier1.trim() || !verifier2.trim() || !verifier3.trim()) {
      notification.error("All fields are required");
      return;
    }

    try {
      const assignedVerifiers = [verifier1.trim(), verifier2.trim(), verifier3.trim()];

      await finalizeSubmission({
        functionName: "revealFinalSubmissionDecision",
        args: [BigInt(submissionId), salt.trim(), assignedVerifiers],
      });

      notification.success("Submission finalized successfully!");
      setSubmissionId("");
      setSalt("");
      setVerifier1("");
      setVerifier2("");
      setVerifier3("");
    } catch (error: any) {
      console.error("Finalization failed:", error);
      notification.error(error?.message || "Finalization failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <h3 className="text-xl font-bold text-[#800020] mb-4">🔐 Finalize Submission (Reveal Salt)</h3>
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
          <label className="block text-gray-700 font-semibold mb-2">Salt (Secret)</label>
          <input
            type="text"
            value={salt}
            onChange={e => setSalt(e.target.value)}
            placeholder="secret_salt_123"
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Assigned Verifier 1 Address</label>
          <input
            type="text"
            value={verifier1}
            onChange={e => setVerifier1(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Assigned Verifier 2 Address</label>
          <input
            type="text"
            value={verifier2}
            onChange={e => setVerifier2(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Assigned Verifier 3 Address</label>
          <input
            type="text"
            value={verifier3}
            onChange={e => setVerifier3(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>
        <button
          onClick={handleFinalize}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Finalizing..." : "Finalize Submission"}
        </button>
      </div>
    </div>
  );
}
