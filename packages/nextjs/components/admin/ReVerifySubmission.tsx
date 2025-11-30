"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function ReVerifySubmission() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: reVerify, isPending } = useScaffoldWriteContract("YourContract");

  const handleReVerify = async () => {
    if (!submissionId) {
      notification.error("Submission ID is required");
      return;
    }

    try {
      await reVerify({
        functionName: "reVerifySubmission",
        args: [BigInt(submissionId)],
      });

      notification.success("Submission reset for re-verification! Remember to call commitVerifiers next.");
      setSubmissionId("");
    } catch (error: any) {
      console.error("Re-verify failed:", error);
      notification.error(error?.message || "Re-verify failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <h3 className="text-xl font-bold text-[#800020] mb-4">🔄 Re-Verify Submission</h3>
      <p className="text-gray-600 text-sm mb-4">
        Reset a finalized submission to pending status. You must call commitVerifiers after this.
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

        <button
          onClick={handleReVerify}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Resetting..." : "Reset for Re-Verification"}
        </button>
      </div>
    </div>
  );
}
