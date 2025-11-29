import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "./index";

export function useContributorStatus() {
  const { address } = useAccount();

  const { data: contributor, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "owner",
  });

  const { data: coordinator } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "coordinator",
  });

  const isRegistered = contributor ? contributor[0] === true : false;
  const isActive = contributor ? contributor[5] === true : false;
  const score = contributor ? Number(contributor[4]) : 0;
  const region = contributor ? contributor[1] : "";
  const department = contributor ? contributor[2] : "";
  
  const isOwner = address && owner ? address.toLowerCase() === owner.toLowerCase() : false;
  const isCoordinator = address && coordinator ? address.toLowerCase() === coordinator.toLowerCase() : false;
  const isAdmin = isOwner || isCoordinator;

  return {
    address,
    isRegistered,
    isActive,
    score,
    region,
    department,
    isOwner,
    isCoordinator,
    isAdmin,
    isLoading,
    contributor,
  };
}
