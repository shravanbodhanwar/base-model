// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AuditRegistry is AccessControl, Pausable {
    bytes32 public constant LOGGER_ROLE = keccak256("LOGGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct AuditEvent {
        bytes32 eventIdHash;
        bytes32 actorDIDHash;
        bytes32 eventType;
        bytes32 targetHash;
        uint256 timestamp;
        bytes32 metadataHash;
    }

    mapping(bytes32 => AuditEvent) public auditEvents;
    mapping(bytes32 => bool) public eventExists;

    event AuditEventAnchored(bytes32 indexed eventIdHash, bytes32 indexed actorDIDHash, bytes32 indexed eventType, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LOGGER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    function anchorAuditEvent(
        bytes32 _eventIdHash,
        bytes32 _actorDIDHash,
        bytes32 _eventType,
        bytes32 _targetHash,
        bytes32 _metadataHash
    ) external onlyRole(LOGGER_ROLE) whenNotPaused {
        require(!eventExists[_eventIdHash], "Event already anchored");

        auditEvents[_eventIdHash] = AuditEvent({
            eventIdHash: _eventIdHash,
            actorDIDHash: _actorDIDHash,
            eventType: _eventType,
            targetHash: _targetHash,
            timestamp: block.timestamp,
            metadataHash: _metadataHash
        });

        eventExists[_eventIdHash] = true;

        emit AuditEventAnchored(_eventIdHash, _actorDIDHash, _eventType, block.timestamp);
    }

    function getAuditEvent(bytes32 _eventIdHash) external view onlyRole(AUDITOR_ROLE) returns (AuditEvent memory) {
        require(eventExists[_eventIdHash], "Event not found");
        return auditEvents[_eventIdHash];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
