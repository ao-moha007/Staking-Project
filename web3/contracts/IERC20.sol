// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title ERC-20 Token Standard Interface
/// @notice Interface for ERC-20 compliant tokens as defined in the EIP.
/// @dev See https://eips.ethereum.org/EIPS/eip-20 for full details.
interface IERC20 {

    /// @notice Emitted when `value` tokens are moved from one account (`from`) to another (`to`).
    /// @param from The address tokens are transferred from.
    /// @param to The address tokens are transferred to.
    /// @param value The number of tokens transferred.
    event Transfer(address indexed from, address indexed to, uint256 value);

    /// @notice Emitted when the allowance of a `spender` for an `owner` is set by a call to {approve}.
    /// @param owner The address of the token owner.
    /// @param spender The address authorized to spend tokens.
    /// @param value The new allowance value.
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// @notice Returns the amount of tokens owned by `account`.
    /// @param account The address to query the balance of.
    /// @return The number of tokens owned by `account`.
    function balanceOf(address account) external view returns (uint256);

    /// @notice Transfers `amount` tokens to `to`.
    /// @param to The address to transfer to.
    /// @param amount The number of tokens to transfer.
    /// @return True if the operation succeeded.
    function transfer(address to, uint256 amount) external returns (bool);

    /// @notice Returns the remaining number of tokens that `spender` is allowed to spend on behalf of `owner`.
    /// @param owner The address which owns the tokens.
    /// @param spender The address which will spend the tokens.
    /// @return The remaining allowance for `spender` to spend from `owner`.
    function allowance(address owner, address spender) external view returns (uint256);

    /// @notice Sets `amount` as the allowance of `spender` over the caller's tokens.
    /// @param spender The address authorized to spend tokens.
    /// @param amount The number of tokens to allow.
    /// @return True if the operation succeeded.
    function approve(address spender, uint256 amount) external returns (bool);

    /// @notice Moves `amount` tokens from `from` to `to` using the allowance mechanism.
    /// `amount` is deducted from the caller's allowance.
    /// @param from The address to transfer tokens from.
    /// @param to The address to transfer tokens to.
    /// @param amount The number of tokens to transfer.
    /// @return True if the operation succeeded.
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
