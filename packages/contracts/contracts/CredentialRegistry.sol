// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CredentialRegistry is AccessControl {
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    enum Status { ACTIVE, REVOKED, EXPIRED, SUSPENDED, SUPERSEDED }

    struct Credential {
        bytes32 credentialIdHash;
        string issuerDID;
        bytes32 subjectDIDHash;
        string credentialType;
        bytes32 credentialHash; // Hash of the credential data/claims
        uint256 issuanceTimestamp;
        uint256 expirationTimestamp;
        Status status;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(bytes32 => bool) public isAnchored;

    event CredentialAnchored(bytes32 indexed credentialIdHash, string issuerDID, bytes32 subjectDIDHash, string credentialType, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed credentialIdHash, uint256 timestamp);
    event CredentialStatusChanged(bytes32 indexed credentialIdHash, Status status, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
    }

    // Notice we do not store claims on-chain, only hashes
    function anchorCredential(
        bytes32 _credentialIdHash,
        string memory _issuerDID,
        bytes32 _subjectDIDHash,
        string memory _credentialType,
        bytes32 _credentialHash,
        uint256 _issuanceTimestamp,
        uint256 _expirationTimestamp
    ) external {
        // Any valid system caller could potentially anchor. 
        // In a strict setup, we might restrict this to an ISSUER_ROLE.
        require(!isAnchored[_credentialIdHash], "Credential already anchored");

        credentials[_credentialIdHash] = Credential({
            credentialIdHash: _credentialIdHash,
            issuerDID: _issuerDID,
            subjectDIDHash: _subjectDIDHash,
            credentialType: _credentialType,
            credentialHash: _credentialHash,
            issuanceTimestamp: _issuanceTimestamp,
            expirationTimestamp: _expirationTimestamp,
            status: Status.ACTIVE
        });

        isAnchored[_credentialIdHash] = true;

        emit CredentialAnchored(_credentialIdHash, _issuerDID, _subjectDIDHash, _credentialType, block.timestamp);
    }

    function revokeCredential(bytes32 _credentialIdHash, string memory _callerDID) external {
        require(isAnchored[_credentialIdHash], "Credential not anchored");
        
        // We simulate issuer checking by passing callerDID from a trusted backend, 
        // or check if caller has REVOKER_ROLE
        bool isIssuer = keccak256(abi.encodePacked(credentials[_credentialIdHash].issuerDID)) == keccak256(abi.encodePacked(_callerDID));
        require(isIssuer || hasRole(REVOKER_ROLE, msg.sender), "Not authorized to revoke");

        credentials[_credentialIdHash].status = Status.REVOKED;

        emit CredentialRevoked(_credentialIdHash, block.timestamp);
        emit CredentialStatusChanged(_credentialIdHash, Status.REVOKED, block.timestamp);
    }

    function updateStatus(bytes32 _credentialIdHash, Status _newStatus, string memory _callerDID) external {
        require(isAnchored[_credentialIdHash], "Credential not anchored");
        
        bool isIssuer = keccak256(abi.encodePacked(credentials[_credentialIdHash].issuerDID)) == keccak256(abi.encodePacked(_callerDID));
        require(isIssuer || hasRole(REVOKER_ROLE, msg.sender), "Not authorized to update status");

        credentials[_credentialIdHash].status = _newStatus;

        emit CredentialStatusChanged(_credentialIdHash, _newStatus, block.timestamp);
    }

    function verifyCredentialStatus(bytes32 _credentialIdHash) external view returns (Status) {
        require(isAnchored[_credentialIdHash], "Credential not anchored");
        Credential memory cred = credentials[_credentialIdHash];
        
        if (cred.status == Status.ACTIVE && cred.expirationTimestamp > 0 && block.timestamp > cred.expirationTimestamp) {
            return Status.EXPIRED;
        }
        
        return cred.status;
    }
}
