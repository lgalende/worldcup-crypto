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
    _tokenIds.increment();  // start at 1
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

  mapping (address => uint8) public discounts;

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
  function _mintPass(PassType _passType/*, string memory tokenURI*/) internal returns (uint256) {
    // uint8 country = uint8(_createRandomNum(32));  // 0-31
    // uint8 jerseyNumber = uint8(_createRandomNum(25)) + 1; // 1-25
    
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    Pass memory newPass = Pass(_passType, newItemId);
    passes.push(newPass);
    playerPassId[msg.sender] = newItemId;
    _mint(msg.sender, newItemId); // _safeMmint is more expensive
    // TODO _setTokenURI(newItemId, tokenURI);
    // tokenURI is a string that should resolve to a JSON document that describes the NFT's metadata
    
    emit NewPass(msg.sender, newItemId, _passType);

    return newItemId;
  }

  function mintPass(PassType _passType) public payable {
    // TODO: check discounts logic
    require(100 * msg.value >= fees[_passType] * (100 - discounts[msg.sender]), "Not enough ETH sent");
    _mintPass(_passType);
  }

  // Getters
  function getPasses() public view returns (Pass[] memory) {
    return passes;
  }

  function getPass(uint256 _id) public view returns (Pass memory) {
    return passes[_id];
  }

  function getDiscount(address _addr) external view returns (uint8) {
    return discounts[_addr];
  }

  function getPlayerPassId(address _addr) external view returns (uint256) {
    return playerPassId[_addr];
  }

  function getPlayerPass(address _addr) external view returns (Pass memory) {
    require (playerPassId[_addr] != 0, "User does not have a pass");
    return passes[playerPassId[_addr]];
  }

  // Actions
  // TODO: burn

  function addDiscount(address _addr, uint8 _discount) external onlyOwner {
    require(_discount <= 100);
    discounts[_addr] = _discount;
  }

  function removeDiscount(address _addr) external onlyOwner {
    discounts[_addr] = 0;
  }
}