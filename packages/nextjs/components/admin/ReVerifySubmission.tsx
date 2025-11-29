"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function ReVerifySubmission() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: reVerifySubmission, isPending } = useScaffoldWriteContract("YourContract");

  const handleReVerify = async () => {
    if (!submissionId.trim()) {
      notification.error("Submission ID is required");
      return;
    }

    try {
      await reVerifySubmission({
        functionName: "reVerifySubmission",
        args: [BigInt(submissionId)],
      });

      notification.success("Submission reset for re-verification! Now call commitVerifiers to assign new verifiers.");
      setSubmissionId("");
    } catch (error: any) {
      console.error("Re-verify failed:", error);
      notification.error(error?.message || "Re-verify failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <h3 className="text-xl font-bold text-[#800020] mb-4">🔄 Re-Verify Submission</h3>
      <p className="text-sm text-gray-600 mb-4">
        Reset an accepted/rejected submission back to pending. Must call commitVerifiers after this.
      </p>
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
        <button
          onClick={handleReVerify}
          disabled={isPending}
          className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Resetting..." : "Reset for Re-Verification"}
        </button>
      </div>
    </div>
  );
}
