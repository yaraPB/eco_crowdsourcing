"use client";

import Link from "next/link";
import { useContributorStatus } from "~~/hooks/scaffold-eth/useContributorStatus";

export default function Home() {
  const { address, isRegistered, isActive, score, region, department, isAdmin, isLoading } =
    useContributorStatus();

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-6xl font-bold text-white mb-6">🏛️ ContributorDAO</h1>
          <p className="text-2xl text-white/90 mb-8">
            Decentralized Contribution Verification Platform
          </p>
          <p className="text-lg text-white/80 mb-8">
            Connect your wallet to get started as a verified contributor
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border-2 border-white/20">
            <p className="text-white text-left mb-4">🔐 Connect to:</p>
            <ul className="text-white/90 text-left space-y-2">
              <li>✓ Submit contributions for review</li>
              <li>✓ Verify submissions from other contributors</li>
              <li>✓ Earn reputation points</li>
              <li>✓ Participate in decentralized governance</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">👤</div>
            <h1 className="text-4xl font-bold text-[#800020] mb-4">Welcome to ContributorDAO</h1>
            <p className="text-xl text-gray-700 mb-8">
              You are not registered yet. Register to start contributing!
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-[#800020] mb-4">As a registered contributor, you can:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📝 Submit contributions for verification</li>
                <li>✅ Verify submissions from other contributors</li>
                <li>🏆 Earn reputation points (+4 for accepted contributions)</li>
                <li>⭐ Build your score through quality work</li>
              </ul>
            </div>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-[#800020] hover:bg-[#600018] text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
            >
              Register Now →
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
          <div className="bg-red-50 rounded-2xl shadow-2xl p-12 text-center border-4 border-red-400">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-4xl font-bold text-red-700 mb-4">Account Suspended</h1>
            <p className="text-xl text-red-600 mb-8">
              Your account has been suspended due to low reputation score.
            </p>
            <div className="bg-white rounded-xl p-6 mb-8">
              <p className="text-gray-700 text-lg mb-2">Current Score: <span className="font-bold text-red-600">{score}</span></p>
              <p className="text-gray-600 text-sm">
                Scores below -3 result in automatic suspension.
              </p>
            </div>
            <p className="text-gray-600">
              Contact the coordinator to appeal your suspension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome Back! 👋</h1>
          <p className="text-xl text-white/90">Your Contributor Dashboard</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold text-[#800020] mb-2">{score}</h3>
            <p className="text-gray-600">Reputation Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="text-xl font-bold text-[#800020] mb-2">{region}</h3>
            <p className="text-gray-600">Region</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]">
            <div className="text-3xl mb-2">🏢</div>
            <h3 className="text-xl font-bold text-[#800020] mb-2">{department}</h3>
            <p className="text-gray-600">Department</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-[#800020]">
          <h2 className="text-2xl font-bold text-[#800020] mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/submissions"
              className="block p-6 bg-gradient-to-r from-[#800020] to-[#600018] hover:from-[#600018] hover:to-[#800020] text-white rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-xl font-bold mb-2">Submit Contribution</h3>
              <p className="text-white/90 text-sm">Share your work for verification</p>
            </Link>

            <Link
              href="/verify"
              className="block p-6 bg-gradient-to-r from-[#800020] to-[#600018] hover:from-[#600018] hover:to-[#800020] text-white rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-xl font-bold mb-2">Verify Submissions</h3>
              <p className="text-white/90 text-sm">Review and vote on contributions</p>
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-lg p-8 border-2 border-amber-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">👑</div>
              <div>
                <h2 className="text-2xl font-bold text-amber-800">Admin Access</h2>
                <p className="text-amber-700">You have coordinator/owner privileges</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Admin Panel →
            </Link>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8 border-2 border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📊 Scoring System</h3>
          <div className="grid md:grid-cols-2 gap-4 text-white/90 text-sm">
            <div>
              <p className="font-semibold mb-2">Rewards:</p>
              <ul className="space-y-1">
                <li>✓ Accepted contribution: +4 points</li>
                <li>✓ Consensus vote: +2 points</li>
                <li>✓ Valid verification: +1 point</li>
                <li>✓ Rejected contribution: +1 point (effort)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Penalties:</p>
              <ul className="space-y-1">
                <li>✗ No response when assigned: -1 point</li>
                <li>✗ Score ≤ -3: Automatic suspension</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
