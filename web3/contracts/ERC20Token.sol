// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Custom ERC20 Token Contract with Extended Holder Info
/// @notice Implements basic ERC20 functionality with additional per-holder token tracking.
/// @dev Not fully ERC20-compliant due to naming and event signatures. Useful for educational or experimental purposes.
contract ERC20Token {

    /// @notice The name of the token
    string public name = "ERC20Token";

    /// @notice The token symbol (e.g., TKN)
    string public symbol = "TKN";

    /// @notice Token standard version description
    string public standard = "ERC20Token v.0.1";

    /// @notice Total number of tokens in existence
    uint256 public totalSupply;

    /// @notice Address of the contract deployer (owner)
    address public ownerOfContract;

    /// @dev Internal counter used to assign token holder IDs
    uint256 public _userId;

    /// @dev Constant initial supply of tokens (10 million tokens, 18 decimals)
    uint256 constant initialSupply = 10_000_000 * (10 ** 18);

    /// @notice Stores balances of each address
    mapping(address => uint256) public balanceOf;

    /// @notice Stores approved allowances for delegated spending
    mapping(address => mapping(address => uint256)) public allowance;

    /// @dev Struct to store extended data about token holders
    struct TokenHolderInfo {
        uint256 _tokenId;
        address _from;
        address _to;
        uint256 _totalToken;
        bool _tokenHolder;
    }

    /// @notice Array of addresses that have ever received tokens
    address[] public holderToken;

    /// @notice Mapping from address to extended token holder info
    mapping(address => TokenHolderInfo) public tokenHolderInfos;

    /// @notice Emitted when tokens are transferred between addresses
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// @notice Emitted when an approval is set by a token owner to a spender
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    /// @notice Contract constructor. Mints initial supply to the deployer.
    constructor() {
        ownerOfContract = msg.sender;
        balanceOf[msg.sender] = initialSupply;
        totalSupply = initialSupply;
    }

    /// @dev Increments the internal user ID counter
    function inc() internal {
        _userId++;
    }

    /// @notice Transfers tokens from sender to a specified address
    /// @param _to The address to transfer tokens to
    /// @param _value The number of tokens to transfer
    /// @return success True if transfer succeeded
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "ERC20: insufficient balance");
        inc();

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        TokenHolderInfo storage TokenHolderInfo = tokenHolderInfos[_to];
        TokenHolderInfo._to = _to;
        TokenHolderInfo._from = msg.sender;
        TokenHolderInfo._totalToken = _value;
        TokenHolderInfo._tokenHolder = true;
        TokenHolderInfo._tokenId = _userId;

        holderToken.push(_to);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /// @notice Approves `_spender` to transfer up to `_value` tokens from sender's account
    /// @param _spender The address allowed to spend the tokens
    /// @param _value The number of tokens approved for transfer
    /// @return success True if approval succeeded
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @notice Transfers tokens from one address to another using an allowance
    /// @param _from The address to send tokens from
    /// @param _to The address to send tokens to
    /// @param _value The number of tokens to send
    /// @return success True if transfer succeeded
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "ERC20: insufficient balance");
        require(_value <= allowance[_from][msg.sender], "ERC20: insufficient allowance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    /// @notice Returns extended token holding data for a given address
    /// @param _address The address to query
    /// @return tokenId Token ID assigned internally
    /// @return to Last recipient address
    /// @return from Last sender address
    /// @return totalToken Last transferred token amount
    /// @return isHolder Boolean indicating if this address holds tokens
    function getTokenHolderData(address _address) public view returns (
        uint256 tokenId,
        address to,
        address from,
        uint256 totalToken,
        bool isHolder
    ) {
        TokenHolderInfo memory info = tokenHolderInfos[_address];
        return (
            info._tokenId,
            info._to,
            info._from,
            info._totalToken,
            info._tokenHolder
        );
    }

    /// @notice Returns the list of addresses that have received tokens
    /// @return An array of token holder addresses
    function getTokenHolder() public view returns (address[] memory) {
        return holderToken;
    }
}
