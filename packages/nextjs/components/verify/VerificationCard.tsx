"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface VerificationCardProps {
  submissionId: number;
  userAddress: string | undefined;
  onVoteSubmitted: () => void;
}

export function VerificationCard({ submissionId, userAddress, onVoteSubmitted }: VerificationCardProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [decision, setDecision] = useState<"Accept" | "Reject">("Accept");
  const [proof0, setProof0] = useState("");
  const [proof1, setProof1] = useState("");

  const { data: submission, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

  const { writeContractAsync: submitVerification, isPending } = useScaffoldWriteContract("YourContract");

  if (isLoading || !submission) {
    return null;
  }

  const [id, submitter, images, textHash, status, timestamp, voteCount, finalized] = submission;

  if (status !== "Pending" || finalized) {
    return null;
  }

  const handleSubmitVote = async () => {
    if (!proof0.trim() || !proof1.trim()) {
      notification.error("Both merkle proof elements are required");
      return;
    }

    try {
      const merkleProof = [proof0.trim(), proof1.trim()];

      await submitVerification({
        functionName: "submitVerification",
        args: [BigInt(submissionId), decision, merkleProof],
      });

      notification.success("Vote submitted successfully!");
      setShowVoteModal(false);
      setProof0("");
      setProof1("");
      onVoteSubmitted();
    } catch (error: any) {
      console.error("Vote submission failed:", error);
      notification.error(error?.message || "Vote submission failed");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020] hover:shadow-xl transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#800020] mb-1">Submission #{Number(id)}</h3>
            <p className="text-sm text-gray-600 font-mono">By: {submitter?.slice(0, 6)}...{submitter?.slice(-4)}</p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">⏳ Pending</span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <span className="font-semibold text-gray-700">Text Hash:</span>
            <p className="font-mono text-sm text-gray-600 break-all mt-1">{textHash}</p>
          </div>

          {images && images.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Images ({images.length}):</span>
              <div className="space-y-1 mt-1">
                {images.map((hash: string, idx: number) => (
                  <p key={idx} className="font-mono text-xs text-gray-600 break-all">
                    {idx + 1}. {hash}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
            <span>👥 {Number(voteCount)} votes</span>
            <span>📅 {new Date(Number(timestamp) * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => setShowVoteModal(true)}
          className="w-full bg-[#800020] hover:bg-[#600018] text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Vote on This Submission
        </button>
      </div>

      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#800020]">Vote on Submission #{Number(id)}</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-700 mb-2">Text Hash:</p>
                <p className="font-mono text-sm text-gray-600 break-all">{textHash}</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Your Decision</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDecision("Accept")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      decision === "Accept"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => setDecision("Reject")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      decision === "Reject"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Merkle Proof Element 1</label>
                <input
                  type="text"
                  value={proof0}
                  onChange={e => setProof0(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Merkle Proof Element 2</label>
                <input
                  type="text"
                  value={proof1}
                  onChange={e => setProof1(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Note:</p>
                <p>
                  You must be an assigned verifier and provide valid merkle proof elements to have your vote counted.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowVoteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVote}
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isPending ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
