"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function DeleteSubmission() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: deleteSubmission, isPending } = useScaffoldWriteContract("YourContract");

  const handleDelete = async () => {
    if (!submissionId) {
      notification.error("Submission ID is required");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete submission #${submissionId}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteSubmission({
        functionName: "deleteSubmission",
        args: [BigInt(submissionId)],
      });

      notification.success("Submission deleted successfully!");
      setSubmissionId("");
    } catch (error: any) {
      console.error("Delete failed:", error);
      notification.error(error?.message || "Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-400">
      <h3 className="text-xl font-bold text-orange-700 mb-4">🗑️ Delete Submission</h3>
      <p className="text-gray-600 text-sm mb-4">
        Permanently delete a submission from the contract
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Submission ID</label>
          <input
            type="number"
            value={submissionId}
            onChange={e => setSubmissionId(e.target.value)}
            placeholder="e.g., 1"
            className="w-full px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-orange-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Deleting..." : "Delete Submission"}
        </button>
      </div>
    </div>
  );
}
