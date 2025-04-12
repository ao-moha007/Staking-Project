// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// IMPORTING CONTRACT
import "./Address.sol";

/// @title Initializable Upgradeable Contract Base
/// @notice Provides initialization logic for upgradeable contracts that use proxies.
/// @dev Emulates constructor behavior with versioned initializer functions.
/// Useful for contracts deployed behind proxies where constructors are not used.
abstract contract Initializable {

    /// @dev Tracks the initialization version of the contract.
    uint8 private _initialized;

    /// @dev Indicates whether the contract is in the process of initializing.
    bool private _initializing;

    /// @notice Emitted when the contract is initialized or reinitialized.
    /// @param version The version number used for initialization.
    event Initialized(uint8 version);

    /// @notice Modifier to define a protected initializer function that can be invoked at most once.
    /// @dev Equivalent to a constructor for proxy-deployed contracts.
    modifier initializer() {
        bool isTopLevelCall = !_initializing;

        require(
            (isTopLevelCall && _initialized < 1) ||
            (!Address.isContract(address(this)) && _initialized == 1),
            "Initializable: contract is already initialized"
        );

        _initialized = 1;

        if (isTopLevelCall) {
            _initializing = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /// @notice Modifier to define a reinitializer function that can be invoked once per version.
    /// @dev Useful when upgrading contract logic and initializing new modules.
    /// @param version The version number used for reinitialization.
    modifier reintializer(uint8 version) {
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");

        _initialized = version;
        _initializing = true;

        _;

        _initializing = false;
        emit Initialized(version);
    }

    /// @notice Modifier to protect functions so they can only be invoked during initialization.
    /// @dev Functions marked with this modifier can only be called inside `initializer` or `reinitializer`.
    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    /// @notice Locks the contract, preventing any future reinitialization.
    /// @dev Should be called in the constructor of implementation contracts to prevent misuse.
    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");

        if (_initialized < type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }
}
