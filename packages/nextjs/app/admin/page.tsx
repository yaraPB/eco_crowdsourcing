"use client";

import { useContributorStatus } from "~~/hooks/scaffold-eth/useContributorStatus";
import { CommitVerifiers } from "~~/components/admin/CommitVerifiers";
import { FinalizeSubmission } from "~~/components/admin/FinalizeSubmission";
import { ReVerifySubmission } from "~~/components/admin/ReVerifySubmission";
import { BanContributor } from "~~/components/admin/BanContributor";
import { ReinstateContributor } from "~~/components/admin/ReinstateContributor";
import { DeleteSubmission } from "~~/components/admin/DeleteSubmission";
import { ViewBannedContributors } from "~~/components/admin/ViewBannedContributors";

export default function AdminPage() {
  const { address, isAdmin, isOwner, isCoordinator, isLoading } = useContributorStatus();

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-[#800020] mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] flex items-center justify-center">
        <div className="bg-red-50 rounded-xl shadow-lg p-12 max-w-md text-center border-4 border-red-400">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-red-600">You must be the owner or coordinator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#800020] to-[#600018] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">👑</div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
                <p className="text-white/90">
                  {isOwner && isCoordinator
                    ? "Owner & Coordinator"
                    : isOwner
                    ? "Owner Access"
                    : "Coordinator Access"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border-2 border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">📖 Admin Workflow</h3>
            <div className="text-white/90 space-y-2 text-sm">
              <p>
                <strong>1. Commit Verifiers:</strong> Assign verifiers to a pending submission using merkle root
              </p>
              <p>
                <strong>2. Wait for Votes:</strong> Verifiers submit their votes with merkle proofs (5 min window)
              </p>
              <p>
                <strong>3. Finalize Submission:</strong> Reveal the salt to verify proofs and finalize the decision
              </p>
              <p>
                <strong>4. Optional:</strong> Re-verify if needed, or manage contributors (ban/reinstate)
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <CommitVerifiers />
            <FinalizeSubmission />
            <ReVerifySubmission />
            <DeleteSubmission />
            <BanContributor />
            <ReinstateContributor />
          </div>

          {isOwner && (
            <div className="mt-6">
              <ViewBannedContributors />
            </div>
          )}

          <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">ℹ️ Important Notes</h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>
                • <strong>commitVerifiers</strong> starts a new verification round with a 5-minute voting window
              </li>
              <li>
                • <strong>revealFinalSubmissionDecision</strong> finalizes votes and distributes rewards/penalties
              </li>
              <li>
                • <strong>reVerifySubmission</strong> resets a finalized submission to pending (must call commitVerifiers
                after)
              </li>
              <li>
                • <strong>deleteSubmission</strong> permanently removes a submission from the contract
              </li>
              <li>
                • <strong>banContributor</strong> sets score to -3 and deactivates the account
              </li>
              <li>
                • <strong>reinstateContributor</strong> resets score to 0 and reactivates the account
              </li>
              <li>• Only owner can view the banned contributors list</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
