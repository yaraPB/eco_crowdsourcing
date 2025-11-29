"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useContributorStatus } from "~~/hooks/scaffold-eth/useContributorStatus";
import { VerificationCard } from "~~/components/verify/VerificationCard";

export default function VerifyPage() {
  const { address, isRegistered, isActive } = useContributorStatus();
  const [pendingSubmissions, setPendingSubmissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    if (total === 0) {
      setPendingSubmissions([]);
      setLoading(false);
      return;
    }

    const subs: number[] = [];
    const start = Math.max(1, total - 19);
    for (let i = total; i >= start; i--) {
      subs.push(i);
    }

    setPendingSubmissions(subs);
    setLoading(false);
  }, [counter, counterLoading, refreshTrigger]);

  const handleVoteSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-[#800020] mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to verify submissions.</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Registration Required</h2>
            <p className="text-yellow-700 mb-6">You must be a registered contributor to verify submissions.</p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-[#800020] text-white rounded-lg hover:bg-[#600018] transition-colors font-semibold"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Account Suspended</h2>
            <p className="text-red-700">Your account is suspended. You cannot verify submissions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">✅ Verify Submissions</h1>
            <p className="text-white/90">Review pending contributions and cast your votes</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border-2 border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">📋 Verification Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/90 text-sm">
              <div>
                <p className="font-semibold mb-2">Rewards for Voting:</p>
                <ul className="space-y-1">
                  <li>✓ Valid vote: +1 point</li>
                  <li>✓ Consensus vote: +2 points (bonus)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Penalties:</p>
                <ul className="space-y-1">
                  <li>✗ Assigned but no vote: -1 point</li>
                  <li>✗ Invalid merkle proof: No credit</li>
                </ul>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-4">
              <strong>Note:</strong> Only assigned verifiers with valid merkle proofs will have their votes counted.
              Everyone can submit, but only valid votes are processed.
            </p>
          </div>

          {loading || counterLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white mt-4">Loading pending submissions...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">
                Pending Submissions {counter !== undefined && `(${Number(counter)} total)`}
              </h2>

              {pendingSubmissions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-[#800020] text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-gray-700 text-lg">No pending submissions at the moment.</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for new contributions to verify.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {pendingSubmissions.map(id => (
                    <VerificationCard
                      key={`${id}-${refreshTrigger}`}
                      submissionId={id}
                      userAddress={address}
                      onVoteSubmitted={handleVoteSubmitted}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
