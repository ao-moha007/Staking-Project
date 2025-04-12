//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//IMPORTING CONTRAT
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./Initializable.sol";
import "./IERC20.sol";

contract TokenStaking is Ownable, ReentrancyGuard, Initializable {
    //Struct to store the User's Details
    struct User {
        uint256 stakeAmount; //stake amount
        uint256 rewardAmount; //reward amount
        uint256 lastStakeTime; //last stake timestamp
        uint256 lastRewardCalculationTime; //last reward calculation timestamp
        uint256 rewardsClaimedSoFar; //sum of rewards claimed so far
    }

    uint256 _minimumStakingAmount; //minimum staking amount
    uint256 _maxStakingTokenLimit; //maximum staking token limit for program
    uint256 _stakeEndDate; //end date for program
    uint256 _stakeStartDate; //start date for program
    uint256 _totalStakedTokens; //Total number of tokens that are staked
    uint256 _totalUsers; // total number of users
    uint256 _stakeDays; //staking days
    uint256 _earlyUnstakeFeePercentage; //early unstake fee percentage
    bool _isStakingPaused; // staking status

    //Token contract address
    address private _tokenAddress;

    //APY
    uint256 _apyRate;

    uint256 public constant PERCENTAGE_DEMONITION = 10000;
    uint256 public constant APY_RATE_CHANGE_THRESHOLD = 10;

    // User address => User
    mapping(address => User) private _users;

    event Stake(address indexed user, uint256 amount);
    event StakingDetail(address indexed user, uint256 amount, string message);
    event Unstake(address indexed user, uint256 amount);
    event EarlyUnstakeFee(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 amount);

    modifier whenTreasuryHasBalance(uint256 amount) {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= amount,
            "TokenStaking: insufficient funds in the treasury"
        );
        _;
    }

    function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) public virtual initializer {
        __TokenStaking_init_unchained(
            owner_,
            tokenAddress_,
            apyRate_,
            minimumStakingAmount_,
            maxStakeTokenLimit_,
            stakeStartDate_,
            stakeEndDate_,
            stakeDays_,
            earlyUnstakeFeePercentage_
        );
    }

    function __TokenStaking_init_unchained(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) internal onlyInitializing {
        require(
            _apyRate <= 10000,
            "TokenStaking: apy rate should be less than 10000"
        );
        require(stakeDays_ > 0, "TokenStaking: stake days must be non zero");
        require(
            tokenAddress_ != address(0),
            "TokenStaking: token address can't be a 0 address"
        );
        require(
            stakeStartDate_ < stakeEndDate_,
            "TokenStaking: start date must be less than end date"
        );

        _transferOwnership(owner_);
        _tokenAddress = tokenAddress_;
        _apyRate = apyRate_;
        _minimumStakingAmount = minimumStakingAmount_;
        _maxStakingTokenLimit = maxStakeTokenLimit_;
        _stakeStartDate = stakeStartDate_;
        _stakeEndDate = stakeEndDate_;
        _stakeDays = stakeDays_ * 1 days;
        _earlyUnstakeFeePercentage = earlyUnstakeFeePercentage_;
    }

    /* View Methods Start */

    /**
     *@notice This function is used to get the minimum staking amount
     */
    function getMinimumStakingAmount() external view returns (uint256) {
        return _minimumStakingAmount;
    }

    /**
     *@notice This function is used to get the maxmum staking token limit for program
     */
    function getMaxStakingTokenLimit() external view returns (uint256) {
        return _maxStakingTokenLimit;
    }

    /**
     *@notice This function is used to get the  staking start for program
     */
    function getStartDate() external view returns (uint256) {
        return _stakeStartDate;
    }

    /**
     *@notice This function is used to get the  staking end date for program
     */
    function getStakeEndDate() external view returns (uint256) {
        return _stakeEndDate;
    }

    /**
     *@notice This function is used to get the total number of token that are staked
     */
    function getTotalStakedTokens() external view returns (uint256) {
        return _totalStakedTokens;
    }

    /**
     *@notice This function is used to get the total number of users
     */
    function getTotalUsers() external view returns (uint256) {
        return _totalUsers;
    }

    /**
     *@notice This function is used to get the stake days
     */
    function getStakeDays() external view returns (uint256) {
        return _stakeDays;
    }

    /**
     *@notice This function is used to get early unstake fee percentage
     */
    function getEarlyUnstakeFeePercentage() external view returns (uint256) {
        return _earlyUnstakeFeePercentage;
    }

    /**
     *@notice This function is used to get staking status
     */
    function getStakingStatus() external view returns (bool) {
        return _isStakingPaused;
    }

    /**
     *@notice This function is used to get the current apy rate
     */
    function getAPY() external view returns (uint256) {
        return _apyRate;
    }

    /**
     *@notice This function is used to get msg.sender's estimated reward amount
     */
    function getUserEstimatedRewards() external view returns (uint256) {
        (uint256 amount, ) = _getUserEstimatedRewards(msg.sender); //missing arugement
        return _users[msg.sender].rewardAmount + amount;
    }

    /**
     *@notice This function is used to get withdrawable amount from contract
     */
    function getwithdrawableAmount() external view returns (uint256) {
        // return IERC20(_tokenAddress).balanceOf(address(this)) - _totalStakedTokens;
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        if (balance > _totalStakedTokens) {
            return balance - _totalStakedTokens;
        } else {
            return 0;
        }
    }

    /**
     *@notice This function is used to get user's details
     *@param userAddress User's address to get details of
     *@return User Struct
     */
    function getUser(address userAddress) external view returns (User memory) {
        return _users[userAddress];
    }

    /**
     *@notice This function is used to check if the user is a stakeholder
     *@param _user Address of the user to check
     *@return True if user is a stakeholder, false otherwise
     */
    function isStakeholder(address _user) external view returns (bool) {
        return _users[_user].stakeAmount != 0;
    }

    /* View Methods End */

    /* Owner Methods Start */

    /**
    *@notice This function is used to update minimum staking amount
     
     */
    function updateMinimumStakingAmount(uint256 newAmount) external onlyOwner {
        _minimumStakingAmount = newAmount;
    }

    /**
     *@notice This function is used to update maximum staking amount
     */
    function updateMaximumStakingAmount(uint256 newAmount) external onlyOwner {
        _maxStakingTokenLimit = newAmount;
    }

    /**
     *@notice This function is used to update staking end date
     */
    function updateStakingDate(uint256 newDateAmount) external onlyOwner {
        _stakeDays = newDateAmount;
    }

    /**
     *@notice This function is used to update early stake fee percentage
     */
    function updateEarlyStakeFeePercentage(
        uint256 newPercentage
    ) external onlyOwner {
        _earlyUnstakeFeePercentage = newPercentage;
    }

    /**
     *@notice This function is used to stake tokens for specific user
     *@dev This function can be used to stake for specific user
     *@param amount the amount to stake
     *@param user user's address
     */
    function stakeForUser(
        uint256 amount,
        address user
    ) external onlyOwner nonReentrant {
        _stakeTokens(amount, user);
    }

    /**
        *@notice enable/disable staking
        *@dev This function can be used to toggle staking status
        
     */
    function togglesStakingStatus() external onlyOwner {
        _isStakingPaused = !_isStakingPaused;
    }

    /**
     *@notice This function is used to withdraw the specified amount if possible
     *@dev This function can be used to withdraw the available tokens
     *@param amount the amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(
            this.getwithdrawableAmount() >= amount,
            "TokenStaking: not enough withdrawable tokens"
        );
        IERC20(_tokenAddress).transfer(msg.sender, amount);
    }

    /** Owner Methods End */

    /** User Methods Start */
    /**
     *@notice This function is used to stake tokens
     *@param _amount The amount that will be staked
     */
    function stake(uint256 _amount) external nonReentrant {
        require(
            this.getwithdrawableAmount() >= _amount,
            "TokenStaking: not enough withdrawable tokens"
        );

        _stakeTokens(_amount, msg.sender);
    }
    
    function emergencyWithdraw() external onlyOwner {
    uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
    IERC20(_tokenAddress).transfer(owner(), balance);
   }

    function getTotalClaimedRewards(address _user) external view returns (uint256) {
    return _users[_user].rewardsClaimedSoFar;
    }

    function _stakeTokens(uint256 _amount, address user_) private {
        require(!_isStakingPaused, "TokensStaking: staking is paused");
        uint256 currentTime = getCurrentTime();
        require(
            currentTime > _stakeStartDate,
            "TokensStaking: staking not started yet"
        );
        require(currentTime < _stakeEndDate, "TokensStaking: staking ended");
        require(
            _totalStakedTokens + _amount <= _maxStakingTokenLimit,
            "TokensStaking: max staking token limit reached"
        );
        require(_amount > 0, "TokenStaking: stake amount must be non-zero");
        require(
            _amount >= _minimumStakingAmount,
            "TokenStaking: stake amount must be greater than the minimum amount allowed"
        );
        if (_users[user_].stakeAmount != 0) {
            _calculateRewards(user_);
        } else {
            _users[user_].lastRewardCalculationTime = currentTime;
            _totalUsers += 1;
        }

        _users[user_].stakeAmount += _amount;
        _users[user_].lastStakeTime = currentTime;
        _totalStakedTokens += _amount;

        require(
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "TokenStaking: failed to transfer tokens"
        );
        emit Stake(user_, _amount);
    }

    /**
     *@notice This function is used to unstake tokens
     *@param _amount  The amount that will be unstaked
     */
    function unStake(
        uint256 _amount
    ) external nonReentrant whenTreasuryHasBalance(_amount) {
        address user = msg.sender;

        require(_amount != 0, "TokenStaking: amount should be non-zero");
        require(this.isStakeholder(user), "TokenStaking: not a stakehlder");
        require(
            _users[user].stakeAmount >= _amount,
            "TokenStaking: not enough stake to unstake"
        );

        //Calculate User's rewards until now
        _calculateRewards(user);

        uint256 feeEarlyUnstake;

        if (getCurrentTime() <= _users[user].lastStakeTime + _stakeDays) {
            feeEarlyUnstake = ((_amount * _earlyUnstakeFeePercentage) /
                PERCENTAGE_DEMONITION);
            emit EarlyUnstakeFee(user, feeEarlyUnstake);
        }

        uint256 amountToUnstake = _amount - feeEarlyUnstake;

        _users[user].stakeAmount -= _amount;
        _totalStakedTokens -= _amount;
        if (_users[user].stakeAmount == 0) {
            // delete _users[user];
            _totalUsers -= 1;
        }
        require(
            IERC20(_tokenAddress).transfer(user, amountToUnstake),
            "TokenStaking: failed to transfer"
        );
        emit Unstake(user, _amount);
    }

    /** @notice This function is used to claim user's rewards
     *
     */
    function claimReward()
        external
        nonReentrant
        whenTreasuryHasBalance(_users[msg.sender].rewardAmount)
    {
        _calculateRewards(msg.sender);
        uint256 rewardAmount = _users[msg.sender].rewardAmount;
        require(rewardAmount > 0, "TokenStaking: no reward to claim");
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= rewardAmount,
            "Insufficient balance"
        );

        require(
            IERC20(_tokenAddress).transfer(msg.sender, rewardAmount),
            "TokenStaking: failed to transfer"
        );
        _users[msg.sender].rewardAmount = 0;
        _users[msg.sender].rewardsClaimedSoFar += rewardAmount;
        emit ClaimReward(msg.sender, rewardAmount);
    }

    /** User methods End */

    /* Private Helper Methods Start */
    /**
     * @notice This function is used to calculate rewards for a user
     * @param _user Address of the user
     */
    function _calculateRewards(address _user) private {
        (uint256 userReward, uint256 currentTime) = _getUserEstimatedRewards(
            _user
        );
        _users[_user].rewardAmount += userReward;
        _users[_user].lastRewardCalculationTime = currentTime;
    }

    /**
     * @notice This function is used to get estimated rewards for a user
     * @param _user Address of the user
     * @return Estinated rewards for the user
     */
    function _getUserEstimatedRewards(
        address _user
    ) private view returns (uint256, uint256) {
        uint256 userReward;
        uint256 userTimestamp = _users[_user].lastRewardCalculationTime;
        uint256 currentTime = getCurrentTime();
        if (currentTime > _users[_user].lastStakeTime + _stakeDays) {
            currentTime = _users[_user].lastStakeTime + _stakeDays;
        }

        uint256 totalStakedTime = currentTime - userTimestamp;
        userReward +=
            ((totalStakedTime * _users[_user].stakeAmount * _apyRate) /
                365 days) /
            PERCENTAGE_DEMONITION;
        return (userReward, currentTime);
    }

    function getCurrentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
