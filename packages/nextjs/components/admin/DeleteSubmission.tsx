"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function DeleteSubmission() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: deleteSubmission, isPending } = useScaffoldWriteContract("YourContract");

  const handleDelete = async () => {
    if (!submissionId.trim()) {
      notification.error("Submission ID is required");
      return;
    }

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
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-400">
      <h3 className="text-xl font-bold text-red-700 mb-4">🗑️ Delete Submission</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Submission ID</label>
          <input
            type="number"
            value={submissionId}
            onChange={e => setSubmissionId(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-red-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Deleting..." : "Delete Submission"}
        </button>
      </div>
    </div>
  );
}
