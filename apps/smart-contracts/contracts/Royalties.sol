// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Royalties is AccessControl, ReentrancyGuard {
    struct RoyaltyTrack {
        string name;
        uint256 royaltyShare;
        uint256 fractions;
    }

    RoyaltyTrack track;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public lastDeposited = 0;
    uint256 public lastReward = 0;
    uint256 public currentRate = 0;
    uint256 public totalReward = 0;

    mapping(uint256 => uint256) claimedAmount;
    mapping(uint256 => uint256) lastClaimed;

    IERC20 public immutable paymentToken;
    IERC721 public immutable nft;

    event Rate(uint256 rate);
    event Payment(address indexed sender, uint256 amount, uint256 timestamp);
    event Deposit(uint256 amount, uint256 timestamp);
    event Claimed(
        uint256 tokenId,
        address user,
        uint256 amount,
        uint256 timestamp
    );

    constructor(
        address _nftAddress,
        string memory _name,
        uint256 _royaltyShare,
        uint256 _fractions,
        uint256 _rate,
        address _paymentToken
    ) {
        paymentToken = IERC20(_paymentToken);
        nft = IERC721(_nftAddress);
        currentRate = _rate;
        track = RoyaltyTrack(_name, _royaltyShare, _fractions);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setRate(uint256 _rate) public onlyRole(ADMIN_ROLE) {
        currentRate = _rate;
        emit Rate(_rate);
    }

    function _transfer(address to, uint256 amount) internal {
        require(
            paymentToken.balanceOf(address(this)) > amount,
            "Not enough funds in treasury"
        );
        paymentToken.transfer(to, amount);
        emit Payment(to, amount, block.timestamp);
    }

    function depositRewards(uint256 _rewards) public {
        if (lastDeposited > 0) {
            uint256 timeDiff = block.timestamp - lastDeposited;
            currentRate = _rewards / timeDiff;
        }

        lastDeposited = block.timestamp;
        lastReward = _rewards;
        totalReward += _rewards;
        emit Deposit(_rewards, block.timestamp);
    }

    function depositRewardsAndRate(uint256 _rewards, uint256 _rate) external {
        depositRewards(_rewards);
        setRate(_rate);
    }

    function getClaimedAmount(uint256 _tokenId) public view returns (uint256) {
        return claimedAmount[_tokenId];
    }

    function getRewardsAmount(uint256 _tokenId) public view returns (uint256) {
        uint256 guess = 0;
        if (currentRate > 0) {
            guess = ((block.timestamp - lastDeposited) * currentRate);
        }

        uint256 amount = (totalReward + guess) / track.fractions;
        return amount - claimedAmount[_tokenId];
    }

    function getTotalAmount(uint256 _tokenId) public view returns (uint256) {
        return getRewardsAmount(_tokenId) + getClaimedAmount(_tokenId);
    }

    function claim(uint256 _tokenId) external nonReentrant {
        address owner = nft.ownerOf(_tokenId);
        require(owner == msg.sender, "Only the owner of the token can claim");
        uint256 amount = getRewardsAmount(_tokenId);
        claimedAmount[_tokenId] = amount;
        lastClaimed[_tokenId] = block.timestamp;
        totalReward += amount;
        paymentToken.transfer(msg.sender, amount);
        emit Claimed(_tokenId, msg.sender, amount, block.timestamp);
    }

    function getTotalEarnings() public view returns (uint256) {
        return totalReward;
    }
}
