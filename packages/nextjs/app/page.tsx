"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address, isConnected } = useAccount();

  const { data: contributor } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  const isRegistered = contributor?.registered;
  const contributorScore = contributor?.score ? Number(contributor.score) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            Welcome to ContributorDAO
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto">
            A decentralized platform for verifying and rewarding quality contributions 
            through community consensus
          </p>
        </div>

        {/* User Status Card */}
        {isConnected && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                Your Status
              </h2>
              
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Status:</span>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                      Registered ✓
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Score:</span>
                    <span className={`px-4 py-2 rounded-lg font-bold text-xl ${
                      contributorScore >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {contributorScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Region:</span>
                    <span className="text-green-900">{contributor.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Department:</span>
                    <span className="text-green-900">{contributor.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Active:</span>
                    <span className={`px-3 py-1 rounded-lg font-semibold ${
                      contributor.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {contributor.active ? 'Yes' : 'Banned'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-green-700 mb-4">You are not registered yet.</p>
                  <Link
                    href="/register"
                    className="inline-block px-6 py-3 bg-green-600 text-black rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Register Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-colors">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Submit Contributions
            </h3>
            <p className="text-green-700">
              Share your work with images and text. Earn points when your contributions are accepted.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-colors">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Verify Submissions
            </h3>
            <p className="text-green-700">
              Review others' contributions and vote. Earn rewards for participating in consensus.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-colors">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Earn Reputation
            </h3>
            <p className="text-green-700">
              Build your reputation score through quality contributions and fair verification.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
          <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
            How It Works
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-green-800 mb-1">Register</h4>
                <p className="text-green-700">
                  Connect your wallet and register with your region, department, and ID document hash.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-green-800 mb-1">Submit Contributions</h4>
                <p className="text-green-700">
                  Upload your work with image hashes and text hash. Your submission enters the pending queue.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-green-800 mb-1">Verification Process</h4>
                <p className="text-green-700">
                  Assigned verifiers review and vote within a 5-minute window. Consensus determines acceptance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-bold text-green-800 mb-1">Earn Rewards</h4>
                <p className="text-green-700">
                  Accepted contributions earn +4 points. Verifiers earn points for voting and reaching consensus.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Point System */}
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
          <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
            Point System
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-green-800 mb-3">Earn Points</h4>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">+4</span>
                  Contribution Accepted
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">+2</span>
                  Voting with Consensus
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">+1</span>
                  Valid Verification Vote
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">+1</span>
                  Contribution Rejected (effort)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-red-800 mb-3">Lose Points</h4>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-center">
                  <span className="text-red-600 mr-2">-1</span>
                  No Response When Assigned
                </li>
                <li className="flex items-center">
                  <span className="text-red-600 mr-2">≤-3</span>
                  Automatic Ban
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isConnected && (
          <div className="text-center mt-12">
            <p className="text-xl text-green-700 mb-4">
              Ready to get started?
            </p>
            <p className="text-green-600">
              Connect your wallet to begin your journey!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
