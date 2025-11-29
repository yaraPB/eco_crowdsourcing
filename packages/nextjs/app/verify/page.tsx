"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function VerifyPage() {
  const { address } = useAccount();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [decision, setDecision] = useState<"Accept" | "Reject" | "">("");
  const [proof0, setProof0] = useState("");
  const [proof1, setProof1] = useState("");

  const { data: contributor } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  const { writeContractAsync: submitVerification, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleSubmitVote = async () => {
    if (!selectedSubmission || !decision || !proof0 || !proof1) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      await submitVerification({
        functionName: "submitVerification",
        args: [BigInt(selectedSubmission), decision, [proof0 as `0x${string}`, proof1 as `0x${string}`]],
      });
      
      notification.success("Vote submitted successfully!");
      setDecision("");
      setProof0("");
      setProof1("");
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Vote submission failed:", error);
      notification.error("Vote submission failed");
    }
  };

  if (!contributor?.registered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-yellow-200">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                Registration Required
              </h2>
              <p className="text-yellow-700 mb-6">
                You need to register as a contributor before you can verify submissions.
              </p>
              <a
                href="/register"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Go to Registration
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contributor?.active) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">
                Account Banned
              </h2>
              <p className="text-red-700 mb-6">
                Your account has been banned. Please contact the coordinator for reinstatement.
              </p>
              <p className="text-red-600">
                Current Score: {Number(contributor.score)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Verify Submissions
            </h1>
            <p className="text-green-700">
              Review and vote on pending submissions
            </p>
          </div>

          {/* Your Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="text-sm text-green-600 mb-1">Your Score</div>
              <div className="text-3xl font-bold text-green-800">
                {Number(contributor.score)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="text-sm text-green-600 mb-1">Status</div>
              <div className="text-2xl font-bold text-green-800">
                {contributor.active ? "✅ Active" : "🚫 Banned"}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="text-sm text-green-600 mb-1">Region</div>
              <div className="text-xl font-bold text-green-800">
                {contributor.region}
              </div>
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl shadow-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-3">💡 How Verification Works</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Rewards:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• +1 point for valid vote</li>
                  <li>• +2 bonus for consensus vote</li>
                  <li>• Total: +3 points for majority vote</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Requirements:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Submit within 5-minute window</li>
                  <li>• Provide valid Merkle proof</li>
                  <li>• Penalty (-1) for no response</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pending Submissions List */}
          <PendingSubmissionsList 
            onSelectSubmission={setSelectedSubmission}
            selectedSubmission={selectedSubmission}
          />

          {/* Vote Form */}
          {selectedSubmission && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Submit Your Vote for Submission #{selectedSubmission}
              </h2>
              
              <div className="space-y-6">
                {/* Decision */}
                <div>
                  <label className="block text-green-800 font-semibold mb-3">
                    Your Decision *
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDecision("Accept")}
                      className={`flex-1 py-4 rounded-lg font-bold transition-all ${
                        decision === "Accept"
                          ? "bg-green-600 text-white shadow-lg scale-105"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => setDecision("Reject")}
                      className={`flex-1 py-4 rounded-lg font-bold transition-all ${
                        decision === "Reject"
                          ? "bg-red-600 text-white shadow-lg scale-105"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {/* Merkle Proof */}
                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    Merkle Proof Element 0 *
                  </label>
                  <input
                    type="text"
                    value={proof0}
                    onChange={(e) => setProof0(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    Merkle Proof Element 1 *
                  </label>
                  <input
                    type="text"
                    value={proof1}
                    onChange={(e) => setProof1(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                  />
                  <p className="text-sm text-green-600 mt-1">
                    You should receive these proof elements from the coordinator
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitVote}
                  disabled={isPending || !decision || !proof0 || !proof1}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                >
                  {isPending ? "Submitting Vote..." : "Submit Vote"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to list pending submissions
function PendingSubmissionsList({ 
  onSelectSubmission, 
  selectedSubmission 
}: { 
  onSelectSubmission: (id: number) => void;
  selectedSubmission: number | null;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  const { data: counter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "submissionCounter",
  });

  useEffect(() => {
    const fetchPendingSubmissions = async () => {
      if (!counter) return;
      
      const pending = [];
      const total = Number(counter);
      
      for (let i = total; i >= Math.max(1, total - 29); i--) {
        // You'll need to fetch each submission and filter for pending ones
        // This is a placeholder
        pending.push({ id: i });
      }
      
      setSubmissions(pending);
    };

    fetchPendingSubmissions();
  }, [counter]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-green-800">
        Pending Submissions
      </h2>
      
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-green-200 text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-green-700 text-lg">
            No pending submissions to verify at the moment
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <PendingSubmissionCard 
              key={sub.id} 
              submissionId={sub.id}
              isSelected={selectedSubmission === sub.id}
              onSelect={() => onSelectSubmission(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Card for individual pending submission
function PendingSubmissionCard({ 
  submissionId, 
  isSelected, 
  onSelect 
}: { 
  submissionId: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: submission } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

  if (!submission) return null;

  const [id, submitter, images, textHash, status, timestamp, voteCount, finalized] = submission;

  // Only show pending submissions
  if (status !== "Pending") return null;

  return (
    <div 
      onClick={onSelect}
      className={`rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all ${
        isSelected 
          ? "border-green-600 bg-green-50 shadow-xl scale-[1.02]" 
          : "border-yellow-400 bg-yellow-50 hover:shadow-xl hover:scale-[1.01]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⏳</span>
            <h3 className="text-xl font-bold text-yellow-800">
              Submission #{Number(id)}
            </h3>
          </div>
          <p className="text-sm text-yellow-700">
            By: {submitter?.slice(0, 6)}...{submitter?.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg font-bold">
            Pending
          </span>
        </div>
      </div>

      <div className="space-y-2 text-yellow-800">
        <div>
          <span className="font-semibold">Text Hash:</span>
          <p className="font-mono text-sm break-all opacity-75">{textHash}</p>
        </div>

        {images && images.length > 0 && (
          <div>
            <span className="font-semibold">Images: {images.length}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-yellow-300">
          <span className="text-sm">Votes: {Number(voteCount)}</span>
          <span className="text-sm">
            {new Date(Number(timestamp) * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t-2 border-green-400">
          <p className="text-green-700 font-semibold text-center">
            ✓ Selected - Fill out the vote form below
          </p>
        </div>
      )}
    </div>
  );
}
