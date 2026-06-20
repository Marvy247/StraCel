// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BountyBoard is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable gDollar;

    enum Status { Open, Claimed, Completed, Cancelled }

    struct Bounty {
        address poster;
        string title;
        string description;
        uint256 reward;
        uint8 currency;          // 0 = CELO, 1 = G$
        uint256 deadline;
        Status status;
        address worker;
        string proof;
        uint256 createdAt;
        address referrer;        // optional, gets 0.5% bonus
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;
    uint256 public platformFeeBps = 250; // 2.5%
    uint256 public referrerBonusBps = 50; // 0.5% of reward (from fee)
    address public feeCollector;
    uint256 public accumulatedFees;

    event BountyPosted(uint256 indexed id, address indexed poster, uint8 currency, uint256 reward);
    event BountyClaimed(uint256 indexed id, address indexed worker);
    event ProofSubmitted(uint256 indexed id, string proof);
    event BountyCompleted(uint256 indexed id, address indexed worker, uint256 reward, uint256 fee);
    event BountyCancelled(uint256 indexed id);
    event FeeUpdated(uint256 bps);
    event FeesWithdrawn(uint256 amount);

    error InvalidInput();
    error InvalidDeadline();
    error ZeroValue();
    error NotOpen();
    error NotClaimed();
    error NotPoster();
    error NotWorker();
    error DeadlinePassed();
    error AlreadyCompleted();
    error TransferFailed();
    error InsufficientAllowance();

    modifier onlyPoster(uint256 id) {
        if (bounties[id].poster != msg.sender) revert NotPoster();
        _;
    }

    modifier onlyWorker(uint256 id) {
        if (bounties[id].worker != msg.sender) revert NotWorker();
        _;
    }

    constructor(address _gDollar, address _feeCollector) Ownable(msg.sender) {
        gDollar = IERC20(_gDollar);
        feeCollector = _feeCollector;
    }

    function postBounty(
        string calldata title,
        string calldata description,
        uint256 reward,
        uint8 currency,
        uint256 deadline,
        address referrer
    ) external payable returns (uint256) {
        if (bytes(title).length == 0 || bytes(title).length > 128) revert InvalidInput();
        if (bytes(description).length == 0 || bytes(description).length > 1024) revert InvalidInput();
        if (reward == 0) revert ZeroValue();
        if (deadline <= block.number) revert InvalidDeadline();

        uint256 fee = (reward * platformFeeBps) / 10000;
        uint256 totalFromPoster = reward + fee;

        if (currency == 0) {
            if (msg.value < totalFromPoster) revert InsufficientAllowance();
            if (msg.value > totalFromPoster) {
                (bool sent,) = payable(msg.sender).call{value: msg.value - totalFromPoster}("");
                if (!sent) revert TransferFailed();
            }
        } else {
            if (msg.value > 0) revert InvalidInput();
            gDollar.safeTransferFrom(msg.sender, address(this), totalFromPoster);
        }

        uint256 id = ++bountyCount;
        bounties[id] = Bounty({
            poster: msg.sender,
            title: title,
            description: description,
            reward: reward,
            currency: currency,
            deadline: deadline,
            status: Status.Open,
            worker: address(0),
            proof: "",
            createdAt: block.number,
            referrer: referrer
        });

        accumulatedFees += fee;
        emit BountyPosted(id, msg.sender, currency, reward);
        return id;
    }

    function claimBounty(uint256 id) external {
        Bounty storage b = bounties[id];
        if (b.status != Status.Open) revert NotOpen();
        if (block.number > b.deadline) revert DeadlinePassed();
        if (b.poster == msg.sender) revert InvalidInput();

        b.worker = msg.sender;
        b.status = Status.Claimed;
        emit BountyClaimed(id, msg.sender);
    }

    function submitProof(uint256 id, string calldata proof) external onlyWorker(id) {
        Bounty storage b = bounties[id];
        if (b.status != Status.Claimed) revert NotClaimed();
        if (bytes(proof).length == 0) revert InvalidInput();

        b.proof = proof;
        emit ProofSubmitted(id, proof);
    }

    function approveSubmission(uint256 id) external onlyPoster(id) {
        Bounty storage b = bounties[id];
        if (b.status != Status.Claimed) revert NotClaimed();

        b.status = Status.Completed;

        uint256 workerReward = b.reward;
        uint256 referrerBonus = 0;

        if (b.referrer != address(0)) {
            referrerBonus = (b.reward * referrerBonusBps) / 10000;
            workerReward = b.reward - referrerBonus;
        }

        if (b.currency == 0) {
            (bool sentToWorker,) = payable(b.worker).call{value: workerReward}("");
            if (!sentToWorker) revert TransferFailed();
            if (referrerBonus > 0) {
                (bool sentToRef,) = payable(b.referrer).call{value: referrerBonus}("");
                if (!sentToRef) revert TransferFailed();
            }
        } else {
            gDollar.safeTransfer(b.worker, workerReward);
            if (referrerBonus > 0) {
                gDollar.safeTransfer(b.referrer, referrerBonus);
            }
        }

        emit BountyCompleted(id, b.worker, workerReward, referrerBonus);
    }

    function cancelBounty(uint256 id) external onlyPoster(id) {
        Bounty storage b = bounties[id];
        if (b.status == Status.Completed) revert AlreadyCompleted();
        if (b.status == Status.Cancelled) revert InvalidInput();

        uint256 fee = (b.reward * platformFeeBps) / 10000;

        if (b.status == Status.Claimed && block.number <= b.deadline) {
            revert DeadlinePassed();
        }

        b.status = Status.Cancelled;

        uint256 refund = b.reward + fee;
        if (b.currency == 0) {
            (bool sent,) = payable(b.poster).call{value: refund}("");
            if (!sent) revert TransferFailed();
        } else {
            gDollar.safeTransfer(b.poster, refund);
        }

        accumulatedFees -= fee;
        emit BountyCancelled(id);
    }

    function getActiveBounties() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= bountyCount; i++) {
            if (bounties[i].status == Status.Open) count++;
        }
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= bountyCount; i++) {
            if (bounties[i].status == Status.Open) {
                ids[idx++] = i;
            }
        }
        return ids;
    }

    function getUserBounties(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= bountyCount; i++) {
            Bounty storage b = bounties[i];
            if (b.poster == user || b.worker == user) count++;
        }
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= bountyCount; i++) {
            Bounty storage b = bounties[i];
            if (b.poster == user || b.worker == user) ids[idx++] = i;
        }
        return ids;
    }

    function updateFee(uint256 newBps) external onlyOwner {
        if (newBps > 1000) revert InvalidInput();
        platformFeeBps = newBps;
        emit FeeUpdated(newBps);
    }

    function withdrawFees() external {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert ZeroValue();
        accumulatedFees = 0;
        (bool sent,) = payable(feeCollector).call{value: amount}("");
        if (!sent) revert TransferFailed();
        emit FeesWithdrawn(amount);
    }
}
