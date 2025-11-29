"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface SubmissionCardProps {
  submissionId: number;
}

export function SubmissionCard({ submissionId }: SubmissionCardProps) {
  const { data: submission, isLoading, isError, error } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

  if (isLoading) {
    return (
      <div className="rounded-xl shadow-lg p-6 border-2 border-gray-300 bg-gray-50 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="rounded-xl shadow-lg p-6 border-2 border-red-300 bg-red-50">
        <p className="text-red-700 font-semibold">Error loading submission #{submissionId}</p>
        <p className="text-red-600 text-sm mt-1">{error?.message || "Submission not found"}</p>
      </div>
    );
  }

  const [id, submitter, images, textHash, status, timestamp, voteCount, finalized] = submission;

  const getStatusColor = () => {
    if (status === "Accepted") return "bg-green-100 border-green-400 text-green-800";
    if (status === "Rejected") return "bg-red-100 border-red-400 text-red-800";
    return "bg-yellow-100 border-yellow-400 text-yellow-800";
  };

  const getStatusIcon = () => {
    if (status === "Accepted") return "✅";
    if (status === "Rejected") return "❌";
    return "⏳";
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 border-2 ${getStatusColor()} transition-all hover:shadow-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getStatusIcon()}</span>
            <h3 className="text-xl font-bold">Submission #{Number(id)}</h3>
          </div>
          <p className="text-sm opacity-75 font-mono">
            By: {submitter?.slice(0, 6)}...{submitter?.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-4 py-2 rounded-lg font-bold ${
              status === "Accepted" ? "bg-green-200" : status === "Rejected" ? "bg-red-200" : "bg-yellow-200"
            }`}
          >
            {status}
          </span>
          {finalized && <p className="text-xs mt-1 opacity-75">Finalized</p>}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-semibold">Text Hash:</span>
          <p className="font-mono text-sm break-all opacity-75 mt-1">{textHash}</p>
        </div>

        {images && images.length > 0 && (
          <div>
            <span className="font-semibold">Images ({images.length}):</span>
            <div className="space-y-1 mt-1">
              {images.map((hash: string, idx: number) => (
                <p key={idx} className="font-mono text-xs break-all opacity-75">
                  {idx + 1}. {hash}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-current opacity-50">
          <span className="text-sm">👥 {Number(voteCount)} votes</span>
          <span className="text-sm">📅 {new Date(Number(timestamp) * 1000).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
