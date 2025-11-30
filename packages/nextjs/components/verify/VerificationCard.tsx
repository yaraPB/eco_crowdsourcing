"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface VerificationCardProps {
  submissionId: number;
  userAddress: string;
  onVoteSubmitted?: () => void;
}

export function VerificationCard({ submissionId, userAddress, onVoteSubmitted }: VerificationCardProps) {
  const [decision, setDecision] = useState<"Accept" | "Reject">("Accept");
  const [merkleProof, setMerkleProof] = useState<string[]>(["", "", ""]);
  const [showVoteForm, setShowVoteForm] = useState(false);

  const { data: submissionData, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

  const { writeContractAsync: submitVerification, isPending } = useScaffoldWriteContract("YourContract");

  const handleProofChange = (index: number, value: string) => {
    const newProof = [...merkleProof];
    newProof[index] = value;
    setMerkleProof(newProof);
  };

  const handleSubmitVote = async () => {
    const validProof = merkleProof.filter(p => p.trim() !== "");
    
    if (validProof.length !== 3) {
      notification.error("All 3 merkle proof elements are required");
      return;
    }

    try {
      await submitVerification({
        functionName: "submitVerification",
        args: [BigInt(submissionId), decision, merkleProof as [`0x${string}`, `0x${string}`, `0x${string}`]],
      });

      notification.success("Vote submitted successfully!");
      setMerkleProof(["", "", ""]);
      setShowVoteForm(false);
      onVoteSubmitted?.();
    } catch (error: any) {
      console.error("Vote submission failed:", error);
      notification.error(error?.message || "Vote submission failed");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-300">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return null;
  }

  const [id, submitter, images, textHash, status, timestamp, voteCount, finalized] = submissionData;

  // Only show pending submissions
  if (status !== "Pending") {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#800020]">Submission #{id.toString()}</h3>
          <p className="text-gray-600 text-sm">Status: {status}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Votes: {voteCount.toString()}</p>
          <p className="text-xs text-gray-500">
            {finalized ? "Finalized" : "Open"}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Submitter:</p>
          <p className="text-xs font-mono text-gray-600 break-all">{submitter}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">Text Hash:</p>
          <p className="text-xs font-mono text-gray-600 break-all">{textHash}</p>
        </div>

        {images.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700">Images: {images.length}</p>
            <div className="space-y-1">
              {images.map((hash: string, idx: number) => (
                <p key={idx} className="text-xs font-mono text-gray-600 break-all">
                  {idx + 1}. {hash}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {!showVoteForm ? (
        <button
          onClick={() => setShowVoteForm(true)}
          className="w-full bg-[#800020] hover:bg-[#600018] text-white font-bold py-3 rounded-lg transition-colors"
        >
          Cast Your Vote
        </button>
      ) : (
        <div className="space-y-4 border-t-2 border-gray-200 pt-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Decision</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDecision("Accept")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  decision === "Accept"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ✓ Accept
              </button>
              <button
                onClick={() => setDecision("Reject")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  decision === "Reject"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ✗ Reject
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Merkle Proof (3 elements required)
            </label>
            <div className="space-y-2">
              {merkleProof.map((proof, index) => (
                <input
                  key={index}
                  type="text"
                  value={proof}
                  onChange={e => handleProofChange(index, e.target.value)}
                  placeholder={`Proof element ${index + 1} (0x...)`}
                  className="w-full px-3 py-2 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none font-mono text-xs"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Provide your 3-element merkle proof if you were assigned as a verifier
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitVote}
              disabled={isPending}
              className="flex-1 bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {isPending ? "Submitting..." : "Submit Vote"}
            </button>
            <button
              onClick={() => {
                setShowVoteForm(false);
                setMerkleProof(["", "", ""]);
              }}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
