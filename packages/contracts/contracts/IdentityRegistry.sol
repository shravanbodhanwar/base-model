// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract IdentityRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    enum Status { ACTIVE, REVOKED, DEACTIVATED, COMPROMISED }

    struct DIDRecord {
        string did;
        address owner;
        bytes32 publicKeyHash;
        Status status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(string => DIDRecord) public didRecords;
    mapping(string => bool) public isRegistered;

    event DIDRegistered(string indexed did, address indexed owner, bytes32 publicKeyHash, uint256 timestamp);
    event DIDKeyRotated(string indexed did, bytes32 newPublicKeyHash, uint256 timestamp);
    event DIDRevoked(string indexed did, uint256 timestamp);
    event DIDStatusChanged(string indexed did, Status status, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
    }

    function registerDID(string memory _did, address _owner, bytes32 _publicKeyHash) external onlyRole(REGISTRAR_ROLE) {
        require(!isRegistered[_did], "DID already registered");

        didRecords[_did] = DIDRecord({
            did: _did,
            owner: _owner,
            publicKeyHash: _publicKeyHash,
            status: Status.ACTIVE,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        isRegistered[_did] = true;

        emit DIDRegistered(_did, _owner, _publicKeyHash, block.timestamp);
    }

    function rotateKey(string memory _did, bytes32 _newPublicKeyHash) external {
        require(isRegistered[_did], "DID not registered");
        require(msg.sender == didRecords[_did].owner, "Only owner can rotate key");
        require(didRecords[_did].status == Status.ACTIVE, "DID is not active");

        didRecords[_did].publicKeyHash = _newPublicKeyHash;
        didRecords[_did].updatedAt = block.timestamp;

        emit DIDKeyRotated(_did, _newPublicKeyHash, block.timestamp);
    }

    function revokeDID(string memory _did) external {
        require(isRegistered[_did], "DID not registered");
        require(msg.sender == didRecords[_did].owner || hasRole(REVOKER_ROLE, msg.sender), "Not authorized to revoke");

        didRecords[_did].status = Status.REVOKED;
        didRecords[_did].updatedAt = block.timestamp;

        emit DIDRevoked(_did, block.timestamp);
        emit DIDStatusChanged(_did, Status.REVOKED, block.timestamp);
    }

    function markCompromised(string memory _did) external {
        require(isRegistered[_did], "DID not registered");
        require(msg.sender == didRecords[_did].owner || hasRole(REVOKER_ROLE, msg.sender), "Not authorized");

        didRecords[_did].status = Status.COMPROMISED;
        didRecords[_did].updatedAt = block.timestamp;

        emit DIDStatusChanged(_did, Status.COMPROMISED, block.timestamp);
    }

    function getDIDRecord(string memory _did) external view returns (DIDRecord memory) {
        require(isRegistered[_did], "DID not registered");
        return didRecords[_did];
    }
}
