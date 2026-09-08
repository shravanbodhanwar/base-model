// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AssetNFT is ERC721, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");

    struct CustodyEntry {
        address from;
        address to;
        uint256 timestamp;
    }

    struct AssetData {
        string ownerDID;
        bytes32 metadataHash;
        string assetType;
        bool isSoulbound;
        string unit;
        string sbu;
        uint256 value; // Used to determine if governance approval is needed for burn
    }

    mapping(uint256 => AssetData) public assets;
    mapping(uint256 => CustodyEntry[]) private custodyHistory;

    uint256 public nextTokenId = 1;
    uint256 public highValueThreshold = 10000; // Example threshold
    address public governanceContract; // For high value burns

    event AssetMinted(uint256 indexed tokenId, string ownerDID, bytes32 metadataHash, string assetType, bool isSoulbound);
    event AssetBurned(uint256 indexed tokenId, address burner);
    event AssetTransferred(uint256 indexed tokenId, address from, address to);
    event TransferRequested(uint256 indexed tokenId, address from, address to);
    event TransferApproved(uint256 indexed tokenId, address approver);

    constructor() ERC721("BEL Asset", "BELA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(TRANSFER_ROLE, msg.sender);
        _grantRole(BURN_ROLE, msg.sender);
    }

    function setGovernanceContract(address _gov) external onlyRole(DEFAULT_ADMIN_ROLE) {
        governanceContract = _gov;
    }

    function setHighValueThreshold(uint256 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        highValueThreshold = _threshold;
    }

    function mintAsset(
        address _to,
        string memory _ownerDID,
        bytes32 _metadataHash,
        string memory _assetType,
        bool _isSoulbound,
        string memory _unit,
        string memory _sbu,
        uint256 _value
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256 tokenId = nextTokenId++;
        
        assets[tokenId] = AssetData({
            ownerDID: _ownerDID,
            metadataHash: _metadataHash,
            assetType: _assetType,
            isSoulbound: _isSoulbound,
            unit: _unit,
            sbu: _sbu,
            value: _value
        });

        _mint(_to, tokenId);

        custodyHistory[tokenId].push(CustodyEntry({
            from: address(0),
            to: _to,
            timestamp: block.timestamp
        }));

        emit AssetMinted(tokenId, _ownerDID, _metadataHash, _assetType, _isSoulbound);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        if (from != address(0) && to != address(0)) {
            require(!assets[tokenId].isSoulbound, "Soulbound assets cannot be transferred");
            // Either has TRANSFER_ROLE, or follows normal ERC721 approval logic
            if (!hasRole(TRANSFER_ROLE, msg.sender)) {
               // Let standard ERC721 checks happen if we were to enforce standard approvals here
               // _update inside ERC721 already checks auth. 
            }
            
            custodyHistory[tokenId].push(CustodyEntry({
                from: from,
                to: to,
                timestamp: block.timestamp
            }));
            
            emit AssetTransferred(tokenId, from, to);
        }
        
        return super._update(to, tokenId, auth);
    }

    function burn(uint256 _tokenId) external onlyRole(BURN_ROLE) whenNotPaused {
        require(_ownerOf(_tokenId) != address(0), "Nonexistent token");

        if (assets[_tokenId].value > highValueThreshold && governanceContract != address(0)) {
            // Assume caller is governance contract if value is high
            require(msg.sender == governanceContract, "High value burn requires governance");
        }

        _burn(_tokenId);
        emit AssetBurned(_tokenId, msg.sender);
    }

    function getCustodyHistory(uint256 _tokenId) external view returns (CustodyEntry[] memory) {
        require(_ownerOf(_tokenId) != address(0) || custodyHistory[_tokenId].length > 0, "No history");
        return custodyHistory[_tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
