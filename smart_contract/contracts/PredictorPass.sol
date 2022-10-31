// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PredictorPass is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor()
    ERC721("Predictor Pass", "PP")
  {
    passes.push(Pass(PassType.Bronze, 0));  // belongs to nobody
    
    // initialize mapping fees
    fees[PassType.Bronze] = 0.01 ether;
    fees[PassType.Silver] = 0.02 ether;
    fees[PassType.Gold] = 0.03 ether;
    fees[PassType.Diamond] = 0.05 ether;
  }

  enum PassType { Bronze, Silver, Gold, Diamond }

  // mapping is cheaper than arrays
  mapping(PassType => uint256) public fees;

  struct Pass {
    PassType passType;  // uint8
    // TODO: country and jersey number
    uint256 id;
  }

  // The logic of the application requires knowing the type of pass.
  // The NFT which each user holds.
  mapping(address => uint256) public playerPassId;

  Pass[] public passes; // 0 is reserved

  event NewPass(address indexed owner, uint256 id, PassType passType);


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

  // Creation
  function _mintPass(PassType _passType, address _addr/*, string memory tokenURI*/) internal returns (uint256) {
    require(_addr != address(0), "ERC721: mint to the zero address");

    // uint8 country = uint8(_createRandomNum(32));  // 0-31
    // uint8 jerseyNumber = uint8(_createRandomNum(25)) + 1; // 1-25
    
    _tokenIds.increment();  // start at 1
    uint256 newItemId = _tokenIds.current();

    Pass memory newPass = Pass(_passType, newItemId);
    _mint(_addr, newItemId); // _safeMmint is more expensive
    passes.push(newPass);
    playerPassId[_addr] = newItemId;
    // TODO _setTokenURI(newItemId, tokenURI);
    // tokenURI is a string that should resolve to a JSON document that describes the NFT's metadata
    
    emit NewPass(_addr, newItemId, _passType);

    return newItemId;
  }

  function mintPass(PassType _passType) external payable {
    require(_passType >= PassType.Bronze && _passType <= PassType.Diamond, "Invalid pass type");
    // FIXME: is the above require necessary? what happens if you send an invalid enum value?
    require(msg.value >= fees[_passType], "Not enough ETH sent");
    
    _mintPass(_passType, msg.sender);
  }

  function ownerMint(PassType _passType, address _addr) external onlyOwner returns (uint256) {
    require(_passType >= PassType.Bronze && _passType <= PassType.Diamond, "Invalid pass type");
    // FIXME: is the above require necessary? what happens if you send an invalid enum value?

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
    // require (playerPassId[_addr] != 0, "User does not have a pass");
    return (uint8(passes[_id].passType), passes[_id].id);
  }

  function getPlayerPassId(address _addr) external view returns (uint256) {
    return playerPassId[_addr];
  }

  function getPlayerPass(address _addr) external view returns (uint8, uint256) {
    // require (playerPassId[_addr] != 0, "User does not have a pass");
    return (uint8(passes[playerPassId[_addr]].passType), passes[playerPassId[_addr]].id);
  }

  // Actions
  // TODO: burn

  // TODO
  /* 
    setTokenUri
    setBaseTokenUri
    _transfer
    _transferFrom
    _approve
    burn... 
  */
}