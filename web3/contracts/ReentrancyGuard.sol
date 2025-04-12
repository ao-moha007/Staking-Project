// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title ReentrancyGuard
/// @notice Protects functions from being reentered during execution (reentrancy attacks).
/// @dev Use the `nonReentrant` modifier on functions that should not allow nested (reentrant) calls.
abstract contract ReentrancyGuard {
    /// @dev Constant representing the contract is not currently entered.
    uint256 private constant _NOT_ENTERED = 1;

    /// @dev Constant representing the contract is in an entered state.
    uint256 private constant _ENTERED = 2;

    /// @dev Current status of the contract's execution context.
    uint256 private _status;

    /// @notice Initializes the guard status to not entered.
    constructor() {
        _status = _NOT_ENTERED;
    }

    /// @notice Prevents a function from being reentered during execution.
    /// @dev This modifier should be applied to any function where reentrancy is a concern,
    /// especially when interacting with external contracts or transferring ETH/tokens.
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
