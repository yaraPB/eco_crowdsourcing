import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "./useScaffoldReadContract";

export function useContributorStatus() {
  const { address } = useAccount();

  const { data: contributorData, isLoading: contributorLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: address ? [address] : undefined,
    watch: true, // Watch for changes to prevent global notification bug
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "owner",
  });

  const { data: coordinator } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "coordinator",
  });

  const isRegistered = contributorData?.[0] ?? false; // registered
  const region = contributorData?.[1] ?? "";
  const department = contributorData?.[2] ?? "";
  const idDocHash = contributorData?.[3] ?? "";
  const score = contributorData?.[4] ? Number(contributorData[4]) : 0;
  const isActive = contributorData?.[5] ?? false;

  const isOwner = address && owner ? address.toLowerCase() === owner.toLowerCase() : false;
  const isCoordinator = address && coordinator ? address.toLowerCase() === coordinator.toLowerCase() : false;
  const isAdmin = isOwner || isCoordinator;

  return {
    address,
    isRegistered,
    region,
    department,
    idDocHash,
    score,
    isActive,
    isOwner,
    isCoordinator,
    isAdmin,
    isLoading: contributorLoading,
  };
}
