//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
library MerkleProof {
    function verifyInclusion(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        require(proof.length == 2, "Proof must have exactly 2 elements");
        bytes32 computedHash = leaf;

        bytes32 option1 = keccak256(abi.encodePacked(
            keccak256(abi.encodePacked(computedHash, proof[0])),
            proof[1]
        ));
        bytes32 option2 = keccak256(abi.encodePacked(
            keccak256(abi.encodePacked(proof[0], computedHash)),
            proof[1]
        ));
        bytes32 option3 = keccak256(abi.encodePacked(
            proof[1],
            keccak256(abi.encodePacked(computedHash, proof[0]))
        ));
        bytes32 option4 = keccak256(abi.encodePacked(
            proof[1],
            keccak256(abi.encodePacked(proof[0], computedHash))
        ));

        return (option1 == root || option2 == root || option3 == root || option4 == root);
    }
}

contract YourContract {

    address public owner;
    address public coordinator;

    uint constant VERIFICATION_THRESHOLD = 2;
    uint constant VERIFICATION_WINDOW = 300; // 5 min
    int constant NON_RESPONSE_PENALTY = -1;
    int constant BAN_THRESHOLD = -3;

    constructor() {
        owner = msg.sender;
        coordinator = msg.sender;
    }

    modifier onlyCoordinator() {
        require(msg.sender == coordinator, "coordinator only");
        _;
    }

    modifier notBanned() {
        require(contributors[msg.sender].rewardPoints > BAN_THRESHOLD, "Contributor banned");
        _;
    }

    struct Contributor {
        bool registered;
        string region;
        string department;
        string idDocHash;
        int rewardPoints;
        bool active;
    }

    struct Submission {
        uint id;
        address submitter;
        string[] imageHashes;
        string textHash;
        Status status;
        uint creationTimestamp;
        bytes32 currentMerkleRoot;
        uint acceptCount;
        uint rejectCount;
        uint roundStartTime;
    }

    enum Status { Pending, Accepted, Rejected }

    uint private submissionCounter;
    mapping(uint => Submission) private submissions;
    mapping(address => Contributor) public contributors;
    address[] public contributorList;

    event ContributionSubmitted(uint indexed submissionId, address indexed submitter);
    event VerifiersCommitted(uint indexed submissionId, bytes32 merkleRoot);
    event VerificationSubmitted(uint indexed submissionId, string decision);
    event SubmissionFinalized(uint indexed submissionId, Status status);
    event ContributorReinstated(address contributor);
    event ContributorPenalized(address contributor, int newRewardPoints);

    modifier onlyRegistered() {
        require(contributors[msg.sender].registered, "Not registered");
        require(contributors[msg.sender].active, "Account not active");
        _;
    }

    function registerContributor(
        string memory region,
        string memory department,
        string memory idDocHash
    ) public notBanned {
        require(!contributors[msg.sender].registered, "Already registered");
        contributors[msg.sender] = Contributor({
            registered: true,
            region: region,
            department: department,
            idDocHash: idDocHash,
            rewardPoints: 0,
            active: true
        });
        contributorList.push(msg.sender);
    }

    function submitContribution(string[] memory imageHashes, string memory textHash) public onlyRegistered notBanned returns (uint) {
        require(imageHashes.length > 0 && imageHashes.length <= 5, "Must have 1-5 images");
        require(bytes(textHash).length > 0, "Text hash required");

        submissionCounter++;
        uint sid = submissionCounter;

        Submission storage s = submissions[sid];
        s.id = sid;
        s.submitter = msg.sender;
        s.creationTimestamp = block.timestamp;
        s.textHash = textHash;
        s.status = Status.Pending;

        for (uint i = 0; i < imageHashes.length; i++) {
            s.imageHashes.push(imageHashes[i]);
        }

        emit ContributionSubmitted(sid, msg.sender);
        return sid;
    }

    function commitVerifiers(uint submissionId, bytes32 merkleRoot) external onlyCoordinator {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Invalid submission");
        require(s.status == Status.Pending, "Submission not pending");

        // Penalize non-responders from previous round
        if (s.roundStartTime != 0) {
            for (uint i = 0; i < contributorList.length; i++) {
                address c = contributorList[i];
                if (contributors[c].registered) {
                    if (block.timestamp > s.roundStartTime + VERIFICATION_WINDOW) {
                        // non-response penalty
                        contributors[c].rewardPoints += NON_RESPONSE_PENALTY;
                        if (contributors[c].rewardPoints <= BAN_THRESHOLD) {
                            contributors[c].active = false;
                        }
                        emit ContributorPenalized(c, contributors[c].rewardPoints);
                    }
                }
            }
        }

        s.currentMerkleRoot = merkleRoot;
        s.acceptCount = 0;
        s.rejectCount = 0;
        s.roundStartTime = block.timestamp;

        emit VerifiersCommitted(submissionId, merkleRoot);
    }

    function submitVerification(uint submissionId, string calldata decisionStr, bytes32[] calldata merkleProof) external onlyRegistered {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Submission not found");
        require(s.status == Status.Pending, "Submission not pending");
        require(block.timestamp <= s.roundStartTime + VERIFICATION_WINDOW, "Verification window expired");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verifyInclusion(merkleProof, s.currentMerkleRoot, leaf), "Not assigned verifier");

        // verifier receives +1 for submitting
        contributors[msg.sender].rewardPoints += 1;

        if (keccak256(bytes(decisionStr)) == keccak256(bytes("Accept"))) {
            s.acceptCount++;
        } else if (keccak256(bytes(decisionStr)) == keccak256(bytes("Reject"))) {
            s.rejectCount++;
        } else {
            revert("Invalid decision string");
        }

        emit VerificationSubmitted(submissionId, decisionStr);

        // finalize only if threshold reached
        if (s.acceptCount >= VERIFICATION_THRESHOLD) {
            s.status = Status.Accepted;
            contributors[s.submitter].rewardPoints += 3;
            emit SubmissionFinalized(submissionId, s.status);
        } else if (s.rejectCount >= VERIFICATION_THRESHOLD) {
            s.status = Status.Rejected;
            emit SubmissionFinalized(submissionId, s.status);
        }
    }

    function reinstateContributor(address contributorAddr) external onlyCoordinator {
        Contributor storage c = contributors[contributorAddr];
        require(c.registered, "Contributor not registered");
        c.rewardPoints = 0;
        c.active = true;
        emit ContributorReinstated(contributorAddr);
    }

    function getBannedContributors() external view returns (address[] memory) {
        uint count;
        for (uint i = 0; i < contributorList.length; i++) {
            if (contributors[contributorList[i]].rewardPoints <= BAN_THRESHOLD) {
                count++;
            }
        }

        address[] memory banned = new address[](count);
        uint idx = 0;
        for (uint i = 0; i < contributorList.length; i++) {
            if (contributors[contributorList[i]].rewardPoints <= BAN_THRESHOLD) {
                banned[idx++] = contributorList[i];
            }
        }
        return banned;
    }

    function getSubmission(uint submissionId) external view returns (
        uint id,
        address submitter,
        string[] memory images,
        string memory textHash,
        string memory status,
        uint timestamp,
        uint acceptCount,
        uint rejectCount
    ) {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Submission not found");

        string memory st = s.status == Status.Pending ? "Pending" :
                            s.status == Status.Accepted ? "Accepted" : "Rejected";

        return (s.id, s.submitter, s.imageHashes, s.textHash, st, s.creationTimestamp, s.acceptCount, s.rejectCount);
    }
}
