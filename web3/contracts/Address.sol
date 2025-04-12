// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Address Utility Library
/// @notice Provides utility functions for address type, including checking if address is a contract,
/// safely sending ETH, and performing low-level calls.
library Address {

    /// @notice Returns true if `account` is a contract.
    /// @param account The address to check.
    /// @return True if `account` is a contract, false otherwise.
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    /// @notice Sends `amount` wei to `recipient`, forwarding all available gas and reverting on errors.
    /// @param recipient The address to send ETH to.
    /// @param amount The amount of wei to send.
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");
        (bool success,) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /// @notice Performs a low-level `call` to `target` with `data`.
    /// @dev Reverts with default error message if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @return The returned data from the call.
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /// @notice Performs a low-level `call` to `target` with `data`.
    /// @dev Reverts with custom `errorMessage` if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @param errorMessage Custom error message if call fails.
    /// @return The returned data from the call.
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /// @notice Performs a low-level `call` to `target` with `data` and sends `value` wei.
    /// @dev Reverts with default error message if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @param value The amount of wei to send.
    /// @return The returned data from the call.
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /// @notice Performs a low-level `call` to `target` with `data` and sends `value` wei.
    /// @dev Reverts with custom `errorMessage` if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @param value The amount of wei to send.
    /// @param errorMessage Custom error message if call fails.
    /// @return The returned data from the call.
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /// @notice Performs a low-level static call to `target` with `data`.
    /// @dev Reverts with default error message if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @return The returned data from the static call.
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /// @notice Performs a low-level static call to `target` with `data`.
    /// @dev Reverts with custom `errorMessage` if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @param errorMessage Custom error message if call fails.
    /// @return The returned data from the static call.
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /// @notice Performs a low-level delegate call to `target` with `data`.
    /// @dev Reverts with default error message if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @return The returned data from the delegate call.
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /// @notice Performs a low-level delegate call to `target` with `data`.
    /// @dev Reverts with custom `errorMessage` if call fails.
    /// @param target The address to call.
    /// @param data The call data.
    /// @param errorMessage Custom error message if call fails.
    /// @return The returned data from the delegate call.
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /// @notice Verifies the result of a low-level call.
    /// @dev Reverts with `errorMessage` if call failed and there is no revert reason.
    /// If there is a revert reason, bubbles it up.
    /// @param success Whether the low-level call succeeded.
    /// @param returndata The return data from the call.
    /// @param errorMessage Fallback error message if `returndata` is empty.
    /// @return The `returndata` if successful.
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}
