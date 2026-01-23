// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title AxonSnap
 * @dev Manages token distribution "Snaps" on-chain.
 * Compatible with ERC-4337 (Smart Accounts) and ERC-2771 (Meta-transactions/Relayers).
 */
contract AxonSnap is ReentrancyGuard, Ownable, ERC2771Context {
    using SafeERC20 for IERC20;

    struct Snap {
        address creator;
        address token;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 totalSnappers;
        uint256 remainingSnappers;
        bool isRandom;
        bool isActive;
    }

    mapping(bytes32 => Snap) public snaps;
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;

    event SnapCreated(bytes32 indexed snapId, address indexed creator, address token, uint256 amount);
    event SnapClaimed(bytes32 indexed snapId, address indexed claimer, uint256 amount);

    // Initial trusted forwarder can be updated by owner if needed
    constructor(address _trustedForwarder) 
        ERC2771Context(_trustedForwarder) 
        Ownable(msg.sender) 
    {}

    /**
     * @dev Create a new Snap by depositing tokens.
     */
    function createSnap(
        bytes32 _snapId,
        address _token,
        uint256 _amount,
        uint256 _snappers,
        bool _isRandom
    ) external nonReentrant {
        require(snaps[_snapId].creator == address(0), "Snap already exists");
        require(_amount > 0, "Amount must be > 0");
        require(_snappers > 0, "Snappers must be > 0");

        IERC20(_token).safeTransferFrom(_msgSender(), address(this), _amount);

        snaps[_snapId] = Snap({
            creator: _msgSender(),
            token: _token,
            totalAmount: _amount,
            remainingAmount: _amount,
            totalSnappers: _snappers,
            remainingSnappers: _snappers,
            isRandom: _isRandom,
            isActive: true
        });

        emit SnapCreated(_snapId, _msgSender(), _token, _amount);
    }

    /**
     * @dev Claim from a Snap.
     */
    function claimSnap(bytes32 _snapId) external nonReentrant {
        Snap storage snap = snaps[_snapId];
        require(snap.isActive, "Snap not active");
        require(snap.remainingSnappers > 0, "No snappers left");
        require(!hasClaimed[_snapId][_msgSender()], "Already claimed");

        uint256 claimAmount;

        if (snap.remainingSnappers == 1) {
            // Last snapper gets everything remaining
            claimAmount = snap.remainingAmount;
        } else if (snap.isRandom) {
            // Pseudo-random distribution
            uint256 maxClaim = (snap.remainingAmount / snap.remainingSnappers) * 2;
            claimAmount = (uint256(keccak256(abi.encodePacked(block.timestamp, _msgSender(), _snapId))) % maxClaim) + 1;
            
            if (claimAmount >= snap.remainingAmount) {
                claimAmount = snap.remainingAmount / snap.remainingSnappers;
            }
        } else {
            // Equal distribution
            claimAmount = snap.totalAmount / snap.totalSnappers;
        }

        snap.remainingAmount -= claimAmount;
        snap.remainingSnappers--;
        hasClaimed[_snapId][_msgSender()] = true;

        if (snap.remainingSnappers == 0) {
            snap.isActive = false;
        }

        IERC20(snap.token).safeTransfer(_msgSender(), claimAmount);

        emit SnapClaimed(_snapId, _msgSender(), claimAmount);
    }

    /**
     * @dev Creator can cancel and withdraw remaining funds if any.
     */
    function cancelSnap(bytes32 _snapId) external nonReentrant {
        Snap storage snap = snaps[_snapId];
        require(_msgSender() == snap.creator, "Not creator");
        require(snap.isActive, "Snap not active");

        uint256 refundAmount = snap.remainingAmount;
        snap.remainingAmount = 0;
        snap.isActive = false;

        IERC20(snap.token).safeTransfer(_msgSender(), refundAmount);
    }

    // Overrides for ERC2771Context
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
