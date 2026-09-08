// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleRegistry is AccessControl {
    bytes32 public constant ROLE_ADMIN = keccak256("ROLE_ADMIN");

    struct RoleAssignment {
        bytes32 assignmentId;
        string subjectDID;
        bytes32 role;
        string scopeId;
        string grantedBy;
        uint256 timestamp;
        bool isActive;
    }

    mapping(bytes32 => RoleAssignment) public assignments;
    // Mapping to quickly check if a subject has a role in a scope: keccak256(subjectDID, role, scopeId) => assignmentId
    mapping(bytes32 => bytes32) public activeAssignments;
    // Role hierarchy: higher role can grant lower roles
    // Not fully dynamic, but typically Admin > Manager > User. For now, ROLE_ADMIN can grant any role.

    event RoleAssigned(bytes32 indexed assignmentId, string subjectDID, bytes32 role, string scopeId, string grantedBy, uint256 timestamp);
    event RoleRevoked(bytes32 indexed assignmentId, string subjectDID, bytes32 role, string scopeId, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ROLE_ADMIN, msg.sender);
    }

    function assignRole(
        string memory _subjectDID,
        bytes32 _role,
        string memory _scopeId,
        string memory _grantedBy
    ) external onlyRole(ROLE_ADMIN) {
        bytes32 lookupKey = keccak256(abi.encodePacked(_subjectDID, _role, _scopeId));
        require(activeAssignments[lookupKey] == bytes32(0), "Role already assigned in scope");

        bytes32 assignmentId = keccak256(abi.encodePacked(_subjectDID, _role, _scopeId, block.timestamp));

        assignments[assignmentId] = RoleAssignment({
            assignmentId: assignmentId,
            subjectDID: _subjectDID,
            role: _role,
            scopeId: _scopeId,
            grantedBy: _grantedBy,
            timestamp: block.timestamp,
            isActive: true
        });

        activeAssignments[lookupKey] = assignmentId;

        emit RoleAssigned(assignmentId, _subjectDID, _role, _scopeId, _grantedBy, block.timestamp);
    }

    function revokeRole(string memory _subjectDID, bytes32 _role, string memory _scopeId) external onlyRole(ROLE_ADMIN) {
        bytes32 lookupKey = keccak256(abi.encodePacked(_subjectDID, _role, _scopeId));
        bytes32 assignmentId = activeAssignments[lookupKey];
        require(assignmentId != bytes32(0), "Role not assigned in scope");

        assignments[assignmentId].isActive = false;
        delete activeAssignments[lookupKey];

        emit RoleRevoked(assignmentId, _subjectDID, _role, _scopeId, block.timestamp);
    }

    function hasRoleInScope(string memory _subjectDID, bytes32 _role, string memory _scopeId) external view returns (bool) {
        bytes32 lookupKey = keccak256(abi.encodePacked(_subjectDID, _role, _scopeId));
        bytes32 assignmentId = activeAssignments[lookupKey];
        if (assignmentId == bytes32(0)) {
            return false;
        }
        return assignments[assignmentId].isActive;
    }
}
