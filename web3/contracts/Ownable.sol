// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// IMPORTING CONTEXT
import "./Context.sol";

/// @title Ownable Access Control Contract
/// @notice Provides basic access control where an account (the owner) can be granted exclusive access to specific functions.
/// @dev This is a simplified version of OpenZeppelin's Ownable. The owner is initially set to the deployer.
abstract contract Ownable is Context {
    /// @dev Stores the address of the current owner.
    address private _owner;

    /// @notice Emitted when ownership is transferred from one address to another.
    /// @param previousOwner The address of the previous owner.
    /// @param newOwner The address of the new owner.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @dev Sets the deployer as the initial owner.
    constructor() {
        _transferOwnership(_msgSender());
    }

    /// @notice Restricts function execution to the current owner.
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /// @notice Returns the address of the current owner.
    /// @return The address of the owner.
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /// @dev Internal function to check whether the caller is the owner.
    /// Reverts if the caller is not the owner.
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /// @notice Renounces ownership of the contract. This leaves the contract without an owner.
    /// @dev This action is irreversible and disables `onlyOwner` functions permanently.
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /// @notice Transfers ownership of the contract to a new address.
    /// @param newOwner The address to transfer ownership to. Cannot be the zero address.
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /// @dev Internal function to transfer ownership of the contract.
    /// Emits an {OwnershipTransferred} event.
    /// @param newOwner The address of the new owner.
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
