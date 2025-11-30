"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface SubmissionCardProps {
  submissionId: number;
}

export function SubmissionCard({ submissionId }: SubmissionCardProps) {
  const { data: submissionData, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 border-green-400 text-green-800";
      case "Rejected":
        return "bg-red-100 border-red-400 text-red-800";
      default:
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "Accepted":
        return "✅";
      case "Rejected":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#800020]">Submission #{id.toString()}</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 border-2 ${getStatusColor(status)}`}>
            {getStatusEmoji(status)} {status}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Votes: {voteCount.toString()}</p>
          <p className="text-xs text-gray-500">
            {finalized ? "Finalized" : "Open for voting"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
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
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Image Hashes ({images.length}):
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {images.map((hash: string, idx: number) => (
                <p key={idx} className="text-xs font-mono text-gray-600 break-all">
                  {idx + 1}. {hash}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Submitted: {new Date(Number(timestamp) * 1000).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
