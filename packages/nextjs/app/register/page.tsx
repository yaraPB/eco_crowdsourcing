"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function RegisterPage() {
  const { address } = useAccount();
  const [region, setRegion] = useState("");
  const [department, setDepartment] = useState("");
  const [idDocHash, setIdDocHash] = useState("");

  const { data: contributor, isLoading, refetch } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  // Debug: Log contributor data
  useEffect(() => {
    console.log("Address:", address);
    console.log("Contributor data:", contributor);
    console.log("Is loading:", isLoading);
  }, [address, contributor, isLoading]);

  const { writeContractAsync: registerContributor, isPending } = useScaffoldWriteContract("YourContract");

  const handleRegister = async () => {
    if (!region || !department || !idDocHash) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      await registerContributor({
        functionName: "registerContributor",
        args: [region, department, idDocHash],
      });
      
      notification.success("Registration successful!");
      setRegion("");
      setDepartment("");
      setIdDocHash("");
      
      // Refetch contributor data after 2 seconds
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      notification.error("Registration failed");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800020] mx-auto mb-4"></div>
              <p className="text-gray-700">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if contributor is registered
  const isRegistered = contributor && contributor[0] === true; // contributor.registered is at index 0

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#800020]">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-[#800020] mb-4">
                  Already Registered!
                </h2>
                <p className="text-gray-700 mb-6">
                  You are already a registered contributor.
                </p>
                
                <div className="bg-[#800020]/10 rounded-lg p-6 text-left">
                  <h3 className="font-bold text-[#800020] mb-3">Your Details:</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Region:</span> {contributor[1]}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Department:</span> {contributor[2]}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Score:</span> {Number(contributor[4])}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={contributor[5] ? "text-green-600" : "text-red-600"}>
                        {contributor[5] ? "Active" : "Banned"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Register as Contributor
            </h1>
            <p className="text-white/90">
              Join our community and start contributing!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#800020]">
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-6">
              {/* Region */}
              <div>
                <label className="block text-[#800020] font-semibold mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., North America, Europe, Asia"
                  className="w-full px-4 py-3 border-2 text-black border-gray-300 rounded-lg focus:border-[#800020] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[#800020] font-semibold mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering, Marketing, Research"
                  className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* ID Document Hash */}
              <div>
                <label className="block text-[#800020] font-semibold mb-2">
                  ID Document Hash *
                </label>
                <input
                  type="text"
                  value={idDocHash}
                  onChange={(e) => setIdDocHash(e.target.value)}
                  placeholder="Hash of your identity document"
                  className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  This should be a hash (e.g., IPFS hash or SHA256) of your identity verification document.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-[#800020]/10 border-2 border-[#800020]/20 rounded-lg p-4">
                <h4 className="font-bold text-[#800020] mb-2">📋 Registration Info</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• You start with a score of 0</li>
                  <li>• Earn points by submitting quality contributions</li>
                  <li>• Earn points by verifying others' submissions</li>
                  <li>• Maintain a score above -3 to stay active</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || !address}
                className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg shadow-lg"
              >
                {isPending ? "Registering..." : "Register Now"}
              </button>

              {!address && (
                <p className="text-center text-red-600 text-sm">
                  Please connect your wallet to register
                </p>
              )}
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-[#800020]/20">
            <h3 className="font-bold text-[#800020] mb-3">What happens after registration?</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Your account will be activated immediately</li>
              <li>You can start submitting contributions</li>
              <li>You may be selected to verify others' submissions</li>
              <li>Your reputation score will update based on your activities</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}