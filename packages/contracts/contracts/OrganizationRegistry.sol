// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract OrganizationRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum OrgType { ORG, UNIT, SBU }

    struct Organization {
        string orgId;
        string name;
        OrgType orgType;
        string parentId;
        string did;
        bytes32 metadataHash;
        bool status; // true for active, false for inactive
    }

    mapping(string => Organization) public organizations;
    mapping(string => bool) public isRegistered;

    event OrganizationRegistered(string indexed orgId, string name, OrgType orgType, string parentId, string did, bytes32 metadataHash);
    event OrganizationUpdated(string indexed orgId, string name, string did, bytes32 metadataHash, bool status);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerOrganization(
        string memory _orgId,
        string memory _name,
        OrgType _orgType,
        string memory _parentId,
        string memory _did,
        bytes32 _metadataHash
    ) external onlyRole(ADMIN_ROLE) {
        require(!isRegistered[_orgId], "Organization already registered");

        if (_orgType != OrgType.ORG) {
            require(isRegistered[_parentId], "Parent organization not registered");
        }

        organizations[_orgId] = Organization({
            orgId: _orgId,
            name: _name,
            orgType: _orgType,
            parentId: _parentId,
            did: _did,
            metadataHash: _metadataHash,
            status: true
        });
        isRegistered[_orgId] = true;

        emit OrganizationRegistered(_orgId, _name, _orgType, _parentId, _did, _metadataHash);
    }

    function updateOrganization(
        string memory _orgId,
        string memory _name,
        string memory _did,
        bytes32 _metadataHash,
        bool _status
    ) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_orgId], "Organization not registered");

        organizations[_orgId].name = _name;
        organizations[_orgId].did = _did;
        organizations[_orgId].metadataHash = _metadataHash;
        organizations[_orgId].status = _status;

        emit OrganizationUpdated(_orgId, _name, _did, _metadataHash, _status);
    }

    function getOrganization(string memory _orgId) external view returns (Organization memory) {
        require(isRegistered[_orgId], "Organization not registered");
        return organizations[_orgId];
    }
}
