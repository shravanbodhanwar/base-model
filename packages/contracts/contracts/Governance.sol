// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Governance is AccessControl {
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    enum ProposalState { PENDING, EXECUTED, CANCELLED }

    struct Proposal {
        uint256 id;
        bytes32 titleHash;
        uint8 actionType;
        address target;
        bytes32 calldataHash;
        string proposerDID;
        uint256 deadline;
        uint256 approvals;
        ProposalState state;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    
    uint256 public nextProposalId = 1;
    uint256 public approvalThreshold = 2; // Default 2-of-3

    event ProposalCreated(uint256 indexed id, bytes32 titleHash, address target, string proposerDID, uint256 deadline);
    event ProposalApproved(uint256 indexed id, address approver);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);
    event ThresholdUpdated(uint256 newThreshold);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, msg.sender); // Assign first signer
    }

    function setApprovalThreshold(uint256 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_threshold > 0, "Threshold must be > 0");
        approvalThreshold = _threshold;
        emit ThresholdUpdated(_threshold);
    }

    function createProposal(
        bytes32 _titleHash,
        uint8 _actionType,
        address _target,
        bytes32 _calldataHash,
        string memory _proposerDID,
        uint256 _duration
    ) external onlyRole(SIGNER_ROLE) {
        uint256 id = nextProposalId++;
        
        proposals[id] = Proposal({
            id: id,
            titleHash: _titleHash,
            actionType: _actionType,
            target: _target,
            calldataHash: _calldataHash,
            proposerDID: _proposerDID,
            deadline: block.timestamp + _duration,
            approvals: 0,
            state: ProposalState.PENDING
        });

        emit ProposalCreated(id, _titleHash, _target, _proposerDID, proposals[id].deadline);
    }

    function approveProposal(uint256 _id) external onlyRole(SIGNER_ROLE) {
        Proposal storage proposal = proposals[_id];
        require(proposal.id == _id, "Invalid proposal");
        require(proposal.state == ProposalState.PENDING, "Not pending");
        require(block.timestamp <= proposal.deadline, "Expired");
        require(!hasApproved[_id][msg.sender], "Already approved");

        hasApproved[_id][msg.sender] = true;
        proposal.approvals += 1;

        emit ProposalApproved(_id, msg.sender);

        if (proposal.approvals >= approvalThreshold) {
            executeProposal(_id);
        }
    }

    function executeProposal(uint256 _id) internal {
        Proposal storage proposal = proposals[_id];
        require(proposal.state == ProposalState.PENDING, "Not pending");
        require(proposal.approvals >= approvalThreshold, "Insufficient approvals");
        require(block.timestamp <= proposal.deadline, "Expired");

        proposal.state = ProposalState.EXECUTED;

        // In a real system, we might actually execute the calldata:
        // (bool success, ) = proposal.target.call(data);
        // require(success, "Execution failed");
        
        emit ProposalExecuted(_id);
    }

    function cancelProposal(uint256 _id) external {
        Proposal storage proposal = proposals[_id];
        require(proposal.id == _id, "Invalid proposal");
        require(proposal.state == ProposalState.PENDING, "Not pending");
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin can cancel");

        proposal.state = ProposalState.CANCELLED;
        
        emit ProposalCancelled(_id);
    }
}
