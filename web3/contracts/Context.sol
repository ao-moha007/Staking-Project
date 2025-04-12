// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Execution Context Base Contract
/// @notice Provides information about the current execution context, including the sender and data of the transaction.
/// @dev This is useful for meta-transactions where the actual sender might be different from `msg.sender`.
abstract contract Context {

    /// @notice Returns the address of the sender of the transaction.
    /// @dev By default, this returns `msg.sender`. It can be overridden to support meta-transactions.
    /// @return The address of the transaction sender.
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    /// @notice Returns the calldata of the transaction.
    /// @dev By default, this returns `msg.data`. It can be overridden for advanced use cases.
    /// @return The calldata of the transaction.
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
