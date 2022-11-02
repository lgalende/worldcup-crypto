// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PredictorPass is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor(string memory _baseURI)
    ERC721("Predictor Pass", "PP")
  {
    baseURI = _baseURI;

    _tokenIds.increment();  // start at 1

    passes.push(Pass(PassType.Bronze, 0));  // belongs to nobody
    
    // initialize mapping fees
    fees[PassType.Bronze] = 0.01 ether;
    fees[PassType.Silver] = 0.02 ether;
    fees[PassType.Gold] = 0.03 ether;
    fees[PassType.Diamond] = 0.05 ether;
  }

  enum PassType { Bronze, Silver, Gold, Diamond }

  string public baseURI;

  // mapping is usually cheaper than arrays
  mapping(PassType => uint256) public fees;

  struct Pass {
    PassType passType;  // uint8
    // TODO: country and jersey number
    uint256 id;
  }
  // TODO: timestamp?

  // The logic of the application requires knowing the type of pass.
  // The id of the NFT which each user holds.
  mapping(address => uint256) public playerPassId;

  Pass[] public passes; // 0 is reserved

  event NewPass(address indexed owner, uint256 id, PassType passType);
  // and event Transfer from _burn and transfer overriden functions

  // Helpers
  function _createRandomNum(uint256 _mod) internal view returns (uint256) {
    uint256 randomNum = uint256(
      keccak256(abi.encodePacked(block.timestamp, msg.sender))
    );
    return randomNum % _mod;
  }

  function updateFee(PassType _passType, uint256 _fee) external onlyOwner {
    fees[_passType] = _fee;
  }

  function withdraw() external payable onlyOwner {
    address payable _owner = payable(owner());
    _owner.transfer(address(this).balance);
  }

  // Turns uint8 into string
  function uintToStr(uint8 _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
      return '0';
    }
    uint8 j = _i;
    uint8 len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len;
    while (_i != 0) {
      k = k - 1;
      uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
      bytes1 b1 = bytes1(temp);
      bstr[k] = b1;
      _i /= 10;
    }
    return string(bstr);
  }

  function getTokenURI(PassType _passType) internal view returns (string memory) {
    return string(abi.encodePacked(baseURI, '/', uintToStr(uint8(_passType)), '.json'));
  }

  function setBaseURI(string memory _baseURI) external onlyOwner {
    baseURI = _baseURI;
  }


  // Creation
  function _mintPass(PassType _passType, address _addr) internal returns (uint256) {    
    require(playerPassId[_addr] == 0, "Player already has a pass");
    
    // require(_addr != address(0), "ERC721: mint to the zero address"); // already donde by _mint

    // uint8 country = uint8(_createRandomNum(32));  // 0-31
    // uint8 jerseyNumber = uint8(_createRandomNum(25)) + 1; // 1-25
    
    uint256 newItemId = _tokenIds.current();

    Pass memory newPass = Pass(_passType, newItemId);
    _mint(_addr, newItemId); // _safeMmint is more expensive, but safe against smart contract interactions
    passes.push(newPass);
    playerPassId[_addr] = newItemId;

    // tokenURI is a string that should resolve to a JSON document that describes the NFT's metadata
    _setTokenURI(newItemId, getTokenURI(_passType));

    _tokenIds.increment();

    emit NewPass(_addr, newItemId, _passType);

    return newItemId;
  }

  function mintPass(PassType _passType) external payable {
    // TODO: discount?
    require(msg.value >= fees[_passType], "Not enough ETH sent");
    
    _mintPass(_passType, msg.sender);
  }

  function ownerMint(PassType _passType, address _addr) external onlyOwner returns (uint256) {
    return _mintPass(_passType, _addr);
  }


  // Getters
  function getFees() external view returns (uint256[4] memory) {
    return [fees[PassType.Bronze], fees[PassType.Silver], fees[PassType.Gold], fees[PassType.Diamond]];
  }

  function getPasses() public view returns (Pass[] memory) {
    return passes;
  }

  function getPass(uint256 _id) public view returns (uint8, uint256) {
    require(passes[_id].id != 0, "Pass does not exist");
    return (uint8(passes[_id].passType), passes[_id].id);
  }

  function getPlayerPassId(address _addr) external view returns (uint256) {
    return playerPassId[_addr];
  }

  function getPlayerPass(address _addr) external view returns (uint8, uint256) {
    require (playerPassId[_addr] != 0, "User does not have a pass");
    return (uint8(passes[playerPassId[_addr]].passType), passes[playerPassId[_addr]].id);
  }

  function getTokenIds() external view onlyOwner returns (uint256) {
    return _tokenIds.current();
  }


  // Actions

  /**
    * @dev Burns `tokenId`. See {ERC721-_burn}.
    *
    * Requirements:
    *
    * - The caller must own `tokenId` or be an approved operator.
    */
  function burn(uint256 tokenId) public {
      require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
      
      address owner = ownerOf(tokenId);

      _burn(tokenId);

      _tokenIds.decrement();  // start at 1
      Pass memory nobodyPass = Pass(PassType.Bronze, 0);
      passes[tokenId] = nobodyPass;
      playerPassId[owner] = 0;
  }


  // Overrides
  /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.transferFrom(from, to, tokenId);
        playerPassId[from] = 0;
        playerPassId[to] = tokenId;
    }

  /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        super.safeTransferFrom(from, to, tokenId, data);
        playerPassId[from] = 0;
        playerPassId[to] = tokenId;
    }


}