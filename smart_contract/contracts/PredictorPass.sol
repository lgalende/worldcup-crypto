// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PredictorPass is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor()
    ERC721("Predictor Pass", "PP")
  {}

  enum PassType { Bronze, Silver, Gold, Diamond }

  // It’s cheaper to use arrays if you are using smaller elements 
  // like uint8 (enum is a uint8) which can be packed together.
  PassType[4] public fees = [0.01 ether, 0.02 ether, 0.03 ether, 0.05 ether];

  struct Pass {
    PassType passType;  // uint8
    uint256 id;
    // TODO: country and jersey number
  }

  Pass[] public passes;

  // The NFT which each user holds.
  // The logic of the application requires knowing the type of pass.
  // If this weren't the case, we could just use the ERC721 tokenURI.
  // FIXME: mapping(address => Pass) public ownerPass;

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
  function _createPass(PassType _passType) internal returns (uint256){
    // uint8 country = uint8(_createRandomNum(32));  // 0-32
    // uint8 jerseyNumber = uint8(_createRandomNum(25)) + 1; // 1-25
    
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    Pass memory newPass = Pass(newItemId, _passType);
    passes.push(newPass);
    // FIXME: ownerPass[msg.sender] = newPass;
    _mint(msg.sender, newItemId); // _safeMmint is more expensive
    _setTokenURI(newItemId, tokenURI);
    
    emit NewPass(msg.sender, newItemId, _passType);

    return newItemId;
  }

  function createPass(PassType _passType) public payable {
    // TODO: DISCOUNTS !!!
    require(msg.value >= fees[_passType]);
    _createPass(_passType);
  }

  // Getters
  function getPasses() public view returns (Pass[] memory) {
    return passes;
  }

  function getPass(uint256 _id) public view returns (Pass memory) {
    return passes[_id];
  }

  // FIXME
  // function getPassByUser(address _user) public view returns (Pass memory) {
  //   return ownerPass[_user];
  // }

  // function getOwnerLips(address _owner) public view returns (Lip[] memory) {
  //   Lip[] memory result = new Lip[](balanceOf(_owner));
  //   uint256 counter = 0;
  //   for (uint256 i = 0; i < lips.length; i++) {
  //     if (ownerOf(i) == _owner) {
  //       result[counter] = lips[i];
  //       counter++;
  //     }
  //   }
  //   return result;
  // }

  // Actions
  // TODO: burn
}