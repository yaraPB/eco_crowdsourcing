"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useContributorStatus } from "~~/hooks/scaffold-eth/useContributorStatus";
import { notification } from "~~/utils/scaffold-eth";

export default function RegisterPage() {
  const router = useRouter();
  const { address, isRegistered, isLoading } = useContributorStatus();
  const [region, setRegion] = useState("");
  const [department, setDepartment] = useState("");
  const [idDocHash, setIdDocHash] = useState("");

  const { writeContractAsync: registerContributor, isPending } = useScaffoldWriteContract("YourContract");

  const handleRegister = async () => {
    if (!region.trim() || !department.trim() || !idDocHash.trim()) {
      notification.error("All fields are required");
      return;
    }

    try {
      await registerContributor({
        functionName: "registerContributor",
        args: [region, department, idDocHash],
      });

      notification.success("Registration successful!");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      console.error("Registration failed:", error);
      notification.error(error?.message || "Registration failed");
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#006233] to-[#80ba9e] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#800020] mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to register as a contributor.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#006233] to-[#80ba9e] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl">Checking registration status...</p>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#006233] to-[#80ba9e] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#800020] mb-4">Already Registered</h2>
          <p className="text-gray-600 mb-6">You are already registered as a contributor!</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#800020] hover:bg-[#600018] text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006233] to-[#80ba9e] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-4xl font-bold text-[#800020] mb-2">Contributor Registration</h1>
            <p className="text-gray-600">Join the Eco_Crowdsoucing community</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[#800020] font-semibold mb-2">
                Region *
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Ifrane, Rabat, Casablanca, etc.."
                className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#800020] font-semibold mb-2">
                Department *
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., AUI, INTP, UM6P, etc..."
                className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#800020] font-semibold mb-2">
                ID Document Hash *
              </label>
              <input
                type="text"
                value={idDocHash}
                onChange={(e) => setIdDocHash(e.target.value)}
                placeholder="IPFS hash"
                className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:border-[#800020] focus:outline-none transition-colors font-mono text-sm"
              />
              <p className="text-gray-500 text-sm mt-1">
                Store your document on IPFS or generate a hash for verification
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> By registering, you agree to participate in the verification process.
                Maintain a positive reputation score to stay active.
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={isPending}
              className="w-full bg-[#800020] hover:bg-[#600018] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors shadow-lg text-lg"
            >
              {isPending ? "Registering..." : "Register as Contributor"}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#800020] mb-4">After Registration</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#800020]">✓</span>
                <span>Submit contributions for review and verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#800020]">✓</span>
                <span>Participate in verifying other contributors' submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#800020]">✓</span>
                <span>Earn reputation points for quality work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#800020]">✓</span>
                <span>Build your on-chain reputation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
