// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

library MerkleProof {
    function verifyInclusion(bytes32[] memory _proof, bytes32 _root, bytes32 _leaf) internal pure returns (bool) {
        require(_proof.length == 2, "Proof must have exactly 2 elements");
        bytes32 computedHash = _leaf;

        bytes32 option1 = keccak256(abi.encodePacked(
            keccak256(abi.encodePacked(computedHash, _proof[0])),
            _proof[1]
        ));
        bytes32 option2 = keccak256(abi.encodePacked(
            keccak256(abi.encodePacked(_proof[0], computedHash)),
            _proof[1]
        ));
        bytes32 option3 = keccak256(abi.encodePacked(
            _proof[1],
            keccak256(abi.encodePacked(computedHash, _proof[0]))
        ));
        bytes32 option4 = keccak256(abi.encodePacked(
            _proof[1],
            keccak256(abi.encodePacked(_proof[0], computedHash))
        ));

        return (option1 == _root || option2 == _root || option3 == _root || option4 == _root);
    }
}

contract FinalEco {

    address public owner;
    address public coordinator;

    uint constant VERIFICATION_THRESHOLD = 2; // to reach consensus, we need at minimum 2 verifiers having the same opinion
    uint constant VERIFICATION_WINDOW = 300; // 5 min
    int constant VERIFICATION_REWARD = 1;
    int constant VERIFICATION_CONSENSUS_REWARD = 2;
    int constant CONTRIBUTION_ACCEPTED = 4;
    int constant CONTRIBUTION_REJECTED = 1;
    int constant NON_RESPONSE_PENALTY = -1;
    int constant BAN_THRESHOLD = -3;

    constructor() {
        owner = msg.sender;
        coordinator = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "owner only");
        _;
    }

    modifier onlyCoordinator() {
        require(msg.sender == coordinator, "coordinator only");
        _;
    }

    modifier notBanned() {
        require(contributors[msg.sender].score > -3, "Contributor banned");
        _;
    }

    struct Contributor {
        bool registered;
        string region;
        string department;
        string idDocHash;
        int score;
        bool active;
    }

    struct Vote {
        address verifier;
        string decision;
        bytes32 proof0;
        bytes32 proof1;
        bool verified; // for after we check the salt
    }

    struct Submission {
        uint id;
        address submitter;
        string[] imageHashes;
        string textHash;
        Status status;
        uint creationTimestamp;
        bytes32 currentMerkleRoot;
        uint roundStartTime;
        // finalized after we reveal the salt
        bool finalized;
        Vote[] votes; 
        // even though we store the addresses, the address would have already submitted so there's no advantage in knowing the address after submitting it
        mapping(address => bool) hasSubmitted; 
    }

    enum Status { Pending, Accepted, Rejected }

    uint private submissionCounter;
    mapping(uint => Submission) public submissions;
    mapping(address => Contributor) public contributors;
    address[] public contributorList;

    event ContributionSubmitted(uint indexed submissionId, address indexed submitter);
    event VerifiersCommitted(uint indexed submissionId, bytes32 merkleRoot);
    event VoteSubmitted(uint indexed submissionId, address indexed verifier);
    event SubmissionFinalized(uint indexed submissionId, Status status, uint validAccepts, uint validRejects);
    event ContributorRewarded(address indexed contributor, int points);
    event ContributorPenalized(address indexed contributor, int points);
    event ContributorReinstated(address contributor);
    event ContributorBanned(address contributor);
    event SubmissionDeleted(uint indexed submissionId);

    modifier onlyRegistered() {
        require(contributors[msg.sender].registered, "Not registered");
        require(contributors[msg.sender].active, "Account not active");
        _;
    }

    function registerContributor( string memory _region, string memory _department, string memory _idDocHash) public notBanned {
        require(!contributors[msg.sender].registered, "Already registered");

        contributors[msg.sender] = Contributor(true, _region, _department, _idDocHash, 0, true);
        contributorList.push(msg.sender);
    }

    function submitContribution(
        string[] memory _imageHashes, string memory _textHash) public onlyRegistered notBanned returns (uint) {
        require(_imageHashes.length >= 0 && _imageHashes.length <= 5, "May have up to 5 images");
        require(bytes(_textHash).length > 0, "Text hash required");

        submissionCounter++;
        uint sid = submissionCounter;

        Submission storage s = submissions[sid];
        s.id = sid;
        s.submitter = msg.sender;
        s.creationTimestamp = block.timestamp;
        s.textHash = _textHash;
        s.status = Status.Pending;
        s.finalized = false;

        for (uint i = 0; i < _imageHashes.length; i++) {
            s.imageHashes.push(_imageHashes[i]);
        }

        emit ContributionSubmitted(sid, msg.sender);
        return sid;
    }

    function commitVerifiers(uint _sid, bytes32 _merkleRoot) external onlyCoordinator {
        Submission storage s = submissions[_sid];
        require(s.id != 0, "Invalid submission");
        require(s.status == Status.Pending, "Submission not pending");
        require(!s.finalized, "Already finalized");

        // Reset hasSubmitted for all previous verifiers before starting new round
        for (uint i = 0; i < s.votes.length; i++) {
            s.hasSubmitted[s.votes[i].verifier] = false;
        }

        s.currentMerkleRoot = _merkleRoot;
        s.roundStartTime = block.timestamp;
        
        delete s.votes;
        
        emit VerifiersCommitted(_sid, _merkleRoot);
    }

    // everyone can submit, but in the finalization is where we filter the votes of the actual verifiers
    function submitVerification( uint _subID, string calldata _decision, bytes32[] calldata _merkleProof) external onlyRegistered {
        Submission storage s = submissions[_subID];
        require(s.id != 0, "Submission not found");
        require(s.status == Status.Pending, "Submission not pending");
        require(!s.finalized, "Already finalized");
        require(block.timestamp <= s.roundStartTime + VERIFICATION_WINDOW, "Verification window expired");
        require(!s.hasSubmitted[msg.sender], "Already submitted");
        require(_merkleProof.length == 2, "Invalid proof length");

        require(
            keccak256(bytes(_decision)) == keccak256(bytes("Accept")) || 
            keccak256(bytes(_decision)) == keccak256(bytes("Reject")),
            "Invalid decision"
        );

        Vote memory newVote;
        newVote.verifier = msg.sender;
        newVote.decision = _decision;
        newVote.proof0 = _merkleProof[0];
        newVote.proof1 = _merkleProof[1];
        newVote.verified = false;
        
        s.votes.push(newVote);
        s.hasSubmitted[msg.sender] = true;

        emit VoteSubmitted(_subID, msg.sender);
    }

    // Only finalized if concensus is reached by assigned voters, else the submission will still be marked as pending and the coordinator reassigns it
    function revealFinalSubmissionDecision
    ( uint _subID, string memory _salt, address[3] memory _assignedVerifiers) 
    external onlyCoordinator 
    {
        Submission storage s = submissions[_subID];
        require(s.id != 0, "Submission not found");
        require(!s.finalized, "Already finalized");
        require(block.timestamp > s.roundStartTime + VERIFICATION_WINDOW || 
            s.votes.length >= VERIFICATION_THRESHOLD, "Wait for deadline or for at least 2 to vote");

        uint validAcceptCount;
        uint validRejectCount;

        // First pass: Verify proofs and count votes, give base reward
        for (uint i = 0; i < s.votes.length; i++) {
            Vote storage vote = s.votes[i];
            
            // rebuild proof array
            bytes32[] memory proof = new bytes32[](2);
            proof[0] = vote.proof0;
            proof[1] = vote.proof1;
            
            // Verify the proof with the _salt
            bytes32 leaf = keccak256(abi.encodePacked(vote.verifier, _salt));
            bool isValid = MerkleProof.verifyInclusion(proof, s.currentMerkleRoot, leaf);
            
            if (isValid) {
                vote.verified = true;
                
                // Count their vote
                if (keccak256(bytes(vote.decision)) == keccak256(bytes("Accept"))) {
                    validAcceptCount++;
                } else { 
                    validRejectCount++; 
                }
                
                // Give base reward to all valid verifiers (1 point)
                contributors[vote.verifier].score += VERIFICATION_REWARD;
                emit ContributorRewarded(vote.verifier, contributors[vote.verifier].score);
            } else {
                vote.verified = false;
            }
        }

        // Second pass: Give consensus bonus to majority verifiers (additional 2 points)
        // Only if consensus is reached
        if (validAcceptCount >= VERIFICATION_THRESHOLD || validRejectCount >= VERIFICATION_THRESHOLD) {
            string memory majorityDecision = validAcceptCount >= VERIFICATION_THRESHOLD ? "Accept" : "Reject";
            
            for (uint i = 0; i < s.votes.length; i++) {
                Vote storage vote = s.votes[i];
                if (vote.verified && keccak256(bytes(vote.decision)) == keccak256(bytes(majorityDecision))) {
                    contributors[vote.verifier].score += VERIFICATION_CONSENSUS_REWARD;
                    emit ContributorRewarded(vote.verifier, contributors[vote.verifier].score);
                }
            }
        }

        // Penalize assigned verifiers who DIDN'T submit valid votes
        for (uint i = 0; i < _assignedVerifiers.length; i++) {
            address verifier = _assignedVerifiers[i];
            
            // Check if they submitted a VALID vote
            bool submittedValid = false;
            for (uint j = 0; j < s.votes.length; j++) {
                if (s.votes[j].verifier == verifier && s.votes[j].verified) {
                    submittedValid = true;
                    break;
                }
            }
            
            // Penalize if they didn't submit OR submitted invalid proof
            if (!submittedValid) {
                contributors[verifier].score += NON_RESPONSE_PENALTY;
                
                if (contributors[verifier].score <= BAN_THRESHOLD) {
                    contributors[verifier].active = false;
                }
                
                emit ContributorPenalized(verifier, contributors[verifier].score);
            }
        }

        if (validAcceptCount >= VERIFICATION_THRESHOLD) {
            s.status = Status.Accepted;
            s.finalized = true;

            contributors[s.submitter].score += CONTRIBUTION_ACCEPTED;
            emit ContributorRewarded(s.submitter, contributors[s.submitter].score);
            emit SubmissionFinalized(_subID, s.status, validAcceptCount, validRejectCount);

        } 
        else if (validRejectCount >= VERIFICATION_THRESHOLD) {
            s.status = Status.Rejected;
            s.finalized = true;
            
            contributors[s.submitter].score += CONTRIBUTION_REJECTED;
            emit ContributorRewarded(s.submitter, contributors[s.submitter].score);
            emit SubmissionFinalized(_subID, s.status, validAcceptCount, validRejectCount);
        } 
        else {
            // status stays pending, finalized = false and coordinator needs to reassign new verifiers
            s.status = Status.Pending;
            s.finalized = false;
            
            // Still reward contributor for effort (1 point)
            contributors[s.submitter].score += CONTRIBUTION_REJECTED;
            emit ContributorRewarded(s.submitter, contributors[s.submitter].score);
            emit SubmissionFinalized(_subID, s.status, validAcceptCount, validRejectCount);
        }
    }


    function deleteSubmission(uint submissionId) external onlyCoordinator {
        require(submissions[submissionId].id != 0, "Submission not found");
        delete submissions[submissionId];
        emit SubmissionDeleted(submissionId);
    }

    function reinstateContributor(address _contributorAddr) external onlyCoordinator {
        Contributor storage c = contributors[_contributorAddr];
        require(c.registered, "Contributor not registered");
        c.score = 0;
        c.active = true;
        emit ContributorReinstated(_contributorAddr);
    }
    
    function banContributor(address _contributorAddr) external onlyCoordinator {
        Contributor storage c = contributors[_contributorAddr];
        require(c.registered, "Contributor not registered");
        c.score = -3;
        c.active = false;
        emit ContributorBanned(_contributorAddr);
    }


    // after calling reVerifySubmission, the coordinator MUST call commitVerifiers again
    // to assign new verifiers and start a new verification round with a fresh timer
    // The roundStartTime will be set again when commitVerifiers is called
    function reVerifySubmission(uint submissionId) external onlyCoordinator {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Submission not found");
        require(s.finalized, "Submission not finalized yet");
        require( s.status == Status.Accepted || s.status == Status.Rejected, "Can only reverify accepted or rejected submissions");

        // Reset hasSubmitted for all verifiers who voted in the previous round
        for (uint i = 0; i < s.votes.length; i++) {
            s.hasSubmitted[s.votes[i].verifier] = false;
        }
        
        s.status = Status.Pending;
        s.finalized = false;
        s.roundStartTime = block.timestamp;
        delete s.votes;
    }

    function getSubmission(uint _subID) external view returns ( uint id, address submitter, string[] memory images, string memory textHash, string memory status, uint timestamp, uint voteCount, bool finalized ) {
        
        Submission storage s = submissions[_subID];
        require(s.id != 0, "Submission not found");
        string memory st = s.status == Status.Pending ? "Pending" : s.status == Status.Accepted ? "Accepted" : "Rejected";

        return (s.id, s.submitter, s.imageHashes, s.textHash, st, s.creationTimestamp, s.votes.length, s.finalized);
    }

    function getBannedContributors() external view onlyOwner returns (address[] memory) {
        uint count;
        for (uint i = 0; i < contributorList.length; i++) {
            if (contributors[contributorList[i]].score <= BAN_THRESHOLD) {
                count++;
            }
        }

        address[] memory banned = new address[](count);
        uint idx = 0;
        for (uint i = 0; i < contributorList.length; i++) {
            if (contributors[contributorList[i]].score <= BAN_THRESHOLD) {
                banned[idx++] = contributorList[i];
            }
        }
        return banned;
    }
}
