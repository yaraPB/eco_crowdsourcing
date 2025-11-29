"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useContributorStatus } from "~~/hooks/scaffold-eth/useContributorStatus";
import { notification } from "~~/utils/scaffold-eth";
import { SubmissionCard } from "~~/components/submissions/SubmissionCard";

export default function SubmissionsPage() {
  const { address, isRegistered, isActive } = useContributorStatus();
  const [imageHashes, setImageHashes] = useState<string[]>([""]);
  const [textHash, setTextHash] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Submission failed:", error);
      notification.error(error?.message || "Submission failed");
    }
  };

  const canSubmit = isRegistered && isActive;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📝 Submissions</h1>
              <p className="text-white/90">View all contributions and submit your own</p>
            </div>
            {canSubmit && (
              <button
                onClick={() => setShowSubmitForm(!showSubmitForm)}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-[#800020] rounded-lg font-semibold transition-colors shadow-lg"
              >
                {showSubmitForm ? "Cancel" : "+ New Submission"}
              </button>
            )}
          </div>

          {!isRegistered && address && (
            <div className="mb-8 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Registration Required</h3>
              <p className="text-yellow-700 mb-4">You must register as a contributor to submit contributions.</p>
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-[#800020] text-white rounded-lg hover:bg-[#600018] transition-colors font-semibold"
              >
                Register Now
              </Link>
            </div>
          )}

          {isRegistered && !isActive && (
            <div className="mb-8 bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🚫</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Account Suspended</h3>
              <p className="text-red-700">Your account is suspended. You cannot submit contributions.</p>
            </div>
          )}

          {showSubmitForm && canSubmit && (
            <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border-2 border-[#800020]">
              <h2 className="text-2xl font-bold text-[#800020] mb-6">Submit New Contribution</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-[#800020] font-semibold mb-2">Text Hash * (Required)</label>
                  <input
                    type="text"
                    value={textHash}
                    onChange={e => setTextHash(e.target.value)}
                    placeholder="Hash of your text content (IPFS hash, SHA256, etc.)"
                    className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors font-mono text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[#800020] font-semibold">Image Hashes (Optional, max 5)</label>
                    {imageHashes.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddImageHash}
                        className="text-[#800020] hover:text-[#600018] font-semibold"
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
                          onChange={e => handleImageHashChange(index, e.target.value)}
                          placeholder={`Image hash ${index + 1}`}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors font-mono text-sm"
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

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Contribution"}
                </button>
              </div>
            </div>
          )}

          <SubmissionsList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

function SubmissionsList({ refreshTrigger }: { refreshTrigger: number }) {
  const [submissions, setSubmissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: counter, isLoading: counterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "submissionCounter",
  });

  useEffect(() => {
    if (counter === undefined || counterLoading) {
      setLoading(true);
      return;
    }

    const total = Number(counter);
    console.log("Total submissions:", total);

    if (total === 0) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const subs: number[] = [];
    const start = Math.max(1, total - 19);
    for (let i = total; i >= start; i--) {
      subs.push(i);
    }

    console.log("Loading submissions:", subs);
    setSubmissions(subs);
    setLoading(false);
  }, [counter, counterLoading, refreshTrigger]);

  if (loading || counterLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">
        Recent Submissions {counter !== undefined && `(${Number(counter)} total)`}
      </h2>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-[#800020] text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-700 text-lg mb-2">No submissions yet. Be the first to contribute!</p>
          <p className="text-gray-500 text-sm">Counter: {Number(counter)}</p>
        </div>
      ) : (
        submissions.map(id => <SubmissionCard key={id} submissionId={id} />)
      )}
    </div>
  );
}
