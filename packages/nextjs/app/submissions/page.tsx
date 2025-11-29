"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function SubmissionsPage() {
  const { address } = useAccount();
  const [imageHashes, setImageHashes] = useState<string[]>([""]);
  const [textHash, setTextHash] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [submissionCounter, setSubmissionCounter] = useState(0);

  const { data: contributor } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  const { writeContractAsync: submitContribution, isPending: isSubmitting } = 
    useScaffoldWriteContract("YourContract");

  const handleAddImageHash = () => {
    if (imageHashes.length < 5) {
      setImageHashes([...imageHashes, ""]);
    }
  };

  const handleRemoveImageHash = (index: number) => {
    setImageHashes(imageHashes.filter((_, i) => i !== index));
  };

  const handleImageHashChange = (index: number, value: string) => {
    const newHashes = [...imageHashes];
    newHashes[index] = value;
    setImageHashes(newHashes);
  };

  const handleSubmit = async () => {
    const validHashes = imageHashes.filter(h => h.trim() !== "");
    
    if (!textHash.trim()) {
      notification.error("Text hash is required");
      return;
    }

    try {
      await submitContribution({
        functionName: "submitContribution",
        args: [validHashes, textHash],
      });
      
      notification.success("Contribution submitted successfully!");
      setImageHashes([""]);
      setTextHash("");
      setShowSubmitForm(false);
      setSubmissionCounter(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error("Submission failed:", error);
      notification.error("Submission failed");
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
                You need to register as a contributor before you can submit contributions.
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                Submissions
              </h1>
              <p className="text-green-700">
                View all submissions and submit new contributions
              </p>
            </div>
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              {showSubmitForm ? "Cancel" : "+ New Submission"}
            </button>
          </div>

          {/* Submit Form */}
          {showSubmitForm && (
            <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Submit New Contribution
              </h2>
              
              <div className="space-y-6">
                {/* Text Hash */}
                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    Text Hash * (Required)
                  </label>
                  <input
                    type="text"
                    value={textHash}
                    onChange={(e) => setTextHash(e.target.value)}
                    placeholder="Hash of your text content (IPFS hash, SHA256, etc.)"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                  />
                </div>

                {/* Image Hashes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-green-800 font-semibold">
                      Image Hashes (Optional, max 5)
                    </label>
                    {imageHashes.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddImageHash}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        + Add Image
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {imageHashes.map((hash, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={hash}
                          onChange={(e) => handleImageHashChange(index, e.target.value)}
                          placeholder={`Image hash ${index + 1}`}
                          className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                        />
                        {imageHashes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImageHash(index)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Contribution"}
                </button>
              </div>
            </div>
          )}

          {/* Submissions List */}
          <SubmissionsList key={submissionCounter} userAddress={address} />
        </div>
      </div>
    </div>
  );
}

// Component to display list of submissions
function SubmissionsList({ userAddress }: { userAddress: string | undefined }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read submission counter to know how many to fetch
  const { data: counter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "submissionCounter",
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!counter) return;
      
      setLoading(true);
      const subs = [];
      const total = Number(counter);
      
      // Fetch last 20 submissions or all if less than 20
      const start = Math.max(1, total - 19);
      for (let i = total; i >= start; i--) {
        try {
          // You'll need to call getSubmission for each ID
          // This is a placeholder - you'll need to implement the actual contract call
          subs.push({ id: i });
        } catch (error) {
          console.error(`Error fetching submission ${i}:`, error);
        }
      }
      
      setSubmissions(subs);
      setLoading(false);
    };

    fetchSubmissions();
  }, [counter]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-green-700 mt-4">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-green-800 mb-4">
        Recent Submissions
      </h2>
      
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-green-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-green-700 text-lg">
            No submissions yet. Be the first to contribute!
          </p>
        </div>
      ) : (
        submissions.map((sub) => (
          <SubmissionCard key={sub.id} submissionId={sub.id} />
        ))
      )}
    </div>
  );
}

// Individual submission card component
function SubmissionCard({ submissionId }: { submissionId: number }) {
  const { data: submission } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getSubmission",
    args: [BigInt(submissionId)],
  });

  if (!submission) return null;

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
          <p className="text-sm opacity-75">
            Submitted by: {submitter?.slice(0, 6)}...{submitter?.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-2 rounded-lg font-bold ${
            status === "Accepted" ? "bg-green-200" :
            status === "Rejected" ? "bg-red-200" :
            "bg-yellow-200"
          }`}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-semibold">Text Hash:</span>
          <p className="font-mono text-sm break-all opacity-75">{textHash}</p>
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
          <span className="text-sm">
            Votes: {Number(voteCount)}
          </span>
          <span className="text-sm">
            {finalized ? "Finalized" : "In Progress"}
          </span>
          <span className="text-sm">
            {new Date(Number(timestamp) * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
