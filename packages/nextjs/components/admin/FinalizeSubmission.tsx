"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function FinalizeSubmission() {
  const [submissionId, setSubmissionId] = useState("");
  const [salt, setSalt] = useState("");
  const [verifiers, setVerifiers] = useState<string[]>(Array(8).fill(""));

  const { writeContractAsync: finalizeSubmission, isPending } = useScaffoldWriteContract("YourContract");

  const handleVerifierChange = (index: number, value: string) => {
    const newVerifiers = [...verifiers];
    newVerifiers[index] = value;
    setVerifiers(newVerifiers);
  };

  const handleFinalize = async () => {
    if (!submissionId || !salt) {
      notification.error("Submission ID and salt are required");
      return;
    }

    const validVerifiers = verifiers.filter(v => v.trim() !== "");
    if (validVerifiers.length !== 8) {
      notification.error("You must provide exactly 8 verifier addresses");
      return;
    }

    try {
      await finalizeSubmission({
        functionName: "revealFinalSubmissionDecision",
        args: [BigInt(submissionId), salt, verifiers as [string, string, string, string, string, string, string, string]],
      });

      notification.success("Submission finalized successfully!");
      setSubmissionId("");
      setSalt("");
      setVerifiers(Array(8).fill(""));
    } catch (error: any) {
      console.error("Finalize failed:", error);
      notification.error(error?.message || "Finalize failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <h3 className="text-xl font-bold text-[#800020] mb-4">2️⃣ Finalize Submission</h3>
      <p className="text-gray-600 text-sm mb-4">
        Reveal the salt to verify merkle proofs and finalize the decision. Requires at least 5 consensus votes.
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
          <label className="block text-gray-700 font-semibold mb-2">Salt</label>
          <input
            type="text"
            value={salt}
            onChange={e => setSalt(e.target.value)}
            placeholder="Secret used to generate merkle leaves"
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Assigned Verifiers (8 required)</label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {verifiers.map((verifier, index) => (
              <input
                key={index}
                type="text"
                value={verifier}
                onChange={e => handleVerifierChange(index, e.target.value)}
                placeholder={`Verifier ${index + 1} address (0x...)`}
                className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-xs"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleFinalize}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Finalizing..." : "Finalize Submission"}
        </button>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-300 rounded-lg p-3">
        <p className="text-blue-800 text-xs">
          <strong>Note:</strong> Assigned verifiers who didn't vote will be penalized. Valid votes need correct 3-element merkle proofs.
        </p>
      </div>
    </div>
  );
}
