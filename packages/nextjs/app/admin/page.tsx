"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

export default function AdminPage() {
  const { address } = useAccount();

  const { data: owner } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "owner",
  });

  const { data: coordinator } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "coordinator",
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  const isCoordinator = address && coordinator && address.toLowerCase() === coordinator.toLowerCase();

  if (!isOwner && !isCoordinator) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">
                Access Denied
              </h2>
              <p className="text-red-700 mb-6">
                This page is only accessible to the contract owner or coordinator.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Go Home
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-green-700">
              {isOwner ? "Owner" : "Coordinator"} Management Dashboard
            </p>
          </div>

          {/* Role Info */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {isOwner ? "👑 Owner Access" : "🔧 Coordinator Access"}
                </h2>
                <p className="opacity-90">
                  You have elevated privileges to manage the platform
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-75">Your Address</div>
                <div className="font-mono text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Commit Verifiers */}
            <CommitVerifiersSection />

            {/* Finalize Submission */}
            <FinalizeSubmissionSection />

            {/* Re-verify Submission */}
            <ReVerifySubmissionSection />

            {/* Delete Submission */}
            <DeleteSubmissionSection />

            {/* Ban Contributor */}
            <BanContributorSection />

            {/* Reinstate Contributor */}
            <ReinstateContributorSection />

            {/* View Banned Contributors (Owner Only) */}
            {isOwner && <BannedContributorsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Commit Verifiers Section
function CommitVerifiersSection() {
  const [submissionId, setSubmissionId] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");

  const { writeContractAsync: commitVerifiers, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleCommit = async () => {
    if (!submissionId || !merkleRoot) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      await commitVerifiers({
        functionName: "commitVerifiers",
        args: [BigInt(submissionId), merkleRoot as `0x${string}`],
      });
      
      notification.success("Verifiers committed successfully!");
      setSubmissionId("");
      setMerkleRoot("");
    } catch (error) {
      console.error("Commit failed:", error);
      notification.error("Commit failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4">
        🎯 Commit Verifiers
      </h3>
      <div className="space-y-4">
        <input
          type="number"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
          placeholder="Submission ID"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
        />
        <input
          type="text"
          value={merkleRoot}
          onChange={(e) => setMerkleRoot(e.target.value)}
          placeholder="Merkle Root (0x...)"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
        />
        <button
          onClick={handleCommit}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Committing..." : "Commit Verifiers"}
        </button>
      </div>
    </div>
  );
}

// Finalize Submission Section
function FinalizeSubmissionSection() {
  const [submissionId, setSubmissionId] = useState("");
  const [salt, setSalt] = useState("");
  const [verifier1, setVerifier1] = useState("");
  const [verifier2, setVerifier2] = useState("");
  const [verifier3, setVerifier3] = useState("");

  const { writeContractAsync: finalizeSubmission, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleFinalize = async () => {
    if (!submissionId || !salt || !verifier1 || !verifier2 || !verifier3) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      await finalizeSubmission({
        functionName: "revealFinalSubmissionDecision",
        args: [
          BigInt(submissionId), 
          salt, 
          [verifier1 as `0x${string}`, verifier2 as `0x${string}`, verifier3 as `0x${string}`]
        ],
      });
      
      notification.success("Submission finalized successfully!");
      setSubmissionId("");
      setSalt("");
      setVerifier1("");
      setVerifier2("");
      setVerifier3("");
    } catch (error) {
      console.error("Finalization failed:", error);
      notification.error("Finalization failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4">
        ✅ Finalize Submission
      </h3>
      <div className="space-y-4">
        <input
          type="number"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
          placeholder="Submission ID"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
        />
        <input
          type="text"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          placeholder="Salt"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
        />
        <input
          type="text"
          value={verifier1}
          onChange={(e) => setVerifier1(e.target.value)}
          placeholder="Verifier 1 Address (0x...)"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
        />
        <input
          type="text"
          value={verifier2}
          onChange={(e) => setVerifier2(e.target.value)}
          placeholder="Verifier 2 Address (0x...)"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
        />
        <input
          type="text"
          value={verifier3}
          onChange={(e) => setVerifier3(e.target.value)}
          placeholder="Verifier 3 Address (0x...)"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
        />
        <button
          onClick={handleFinalize}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Finalizing..." : "Finalize Submission"}
        </button>
      </div>
    </div>
  );
}

// Re-verify Submission Section
function ReVerifySubmissionSection() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: reVerify, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleReVerify = async () => {
    if (!submissionId) {
      notification.error("Please enter a submission ID");
      return;
    }

    try {
      await reVerify({
        functionName: "reVerifySubmission",
        args: [BigInt(submissionId)],
      });
      
      notification.success("Submission reopened for re-verification!");
      setSubmissionId("");
    } catch (error) {
      console.error("Re-verify failed:", error);
      notification.error("Re-verify failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4">
        🔄 Re-verify Submission
      </h3>
      <div className="space-y-4">
        <input
          type="number"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
          placeholder="Submission ID"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
        />
        <button
          onClick={handleReVerify}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Re-verifying..." : "Re-verify Submission"}
        </button>
        <p className="text-sm text-green-600">
          Note: Must call "Commit Verifiers" after this to assign new verifiers
        </p>
      </div>
    </div>
  );
}

// Delete Submission Section
function DeleteSubmissionSection() {
  const [submissionId, setSubmissionId] = useState("");

  const { writeContractAsync: deleteSubmission, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleDelete = async () => {
    if (!submissionId) {
      notification.error("Please enter a submission ID");
      return;
    }

    if (!confirm(`Are you sure you want to delete submission #${submissionId}?`)) {
      return;
    }

    try {
      await deleteSubmission({
        functionName: "deleteSubmission",
        args: [BigInt(submissionId)],
      });
      
      notification.success("Submission deleted successfully!");
      setSubmissionId("");
    } catch (error) {
      console.error("Delete failed:", error);
      notification.error("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
      <h3 className="text-xl font-bold text-red-800 mb-4">
        🗑️ Delete Submission
      </h3>
      <div className="space-y-4">
        <input
          type="number"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
          placeholder="Submission ID"
          className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none"
        />
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Deleting..." : "Delete Submission"}
        </button>
      </div>
    </div>
  );
}

// Ban Contributor Section
function BanContributorSection() {
  const [contributorAddress, setContributorAddress] = useState("");

  const { writeContractAsync: banContributor, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleBan = async () => {
    if (!contributorAddress) {
      notification.error("Please enter a contributor address");
      return;
    }

    if (!confirm(`Are you sure you want to ban ${contributorAddress}?`)) {
      return;
    }

    try {
      await banContributor({
        functionName: "banContributor",
        args: [contributorAddress as `0x${string}`],
      });
      
      notification.success("Contributor banned successfully!");
      setContributorAddress("");
    } catch (error) {
      console.error("Ban failed:", error);
      notification.error("Ban failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
      <h3 className="text-xl font-bold text-red-800 mb-4">
        🚫 Ban Contributor
      </h3>
      <div className="space-y-4">
        <input
          type="text"
          value={contributorAddress}
          onChange={(e) => setContributorAddress(e.target.value)}
          placeholder="Contributor Address (0x...)"
          className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none font-mono text-sm"
        />
        <button
          onClick={handleBan}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Banning..." : "Ban Contributor"}
        </button>
      </div>
    </div>
  );
}

// Reinstate Contributor Section
function ReinstateContributorSection() {
  const [contributorAddress, setContributorAddress] = useState("");

  const { writeContractAsync: reinstateContributor, isPending } = 
    useScaffoldWriteContract("YourContract");

  const handleReinstate = async () => {
    if (!contributorAddress) {
      notification.error("Please enter a contributor address");
      return;
    }

    try {
      await reinstateContributor({
        functionName: "reinstateContributor",
        args: [contributorAddress as `0x${string}`],
      });
      
      notification.success("Contributor reinstated successfully!");
      setContributorAddress("");
    } catch (error) {
      console.error("Reinstate failed:", error);
      notification.error("Reinstate failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4">
        ♻️ Reinstate Contributor
      </h3>
      <div className="space-y-4">
        <input
          type="text"
          value={contributorAddress}
          onChange={(e) => setContributorAddress(e.target.value)}
          placeholder="Contributor Address (0x...)"
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
        />
        <button
          onClick={handleReinstate}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isPending ? "Reinstating..." : "Reinstate Contributor"}
        </button>
      </div>
    </div>
  );
}

// Banned Contributors List (Owner Only)
function BannedContributorsSection() {
  const { data: bannedList } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getBannedContributors",
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 md:col-span-2">
      <h3 className="text-xl font-bold text-orange-800 mb-4">
        📋 Banned Contributors
      </h3>
      {!bannedList || bannedList.length === 0 ? (
        <p className="text-green-600 text-center py-4">
          No banned contributors
        </p>
      ) : (
        <div className="space-y-2">
          {bannedList.map((addr, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
            >
              <span className="font-mono text-sm">{addr}</span>
              <Address address={addr} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
