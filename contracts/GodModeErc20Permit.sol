// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/Erc20Permit.sol";

/// @title GodModeErc20Permit
/// @author surbhi
/// @notice Allows anyone to mint or burn any amount of tokens to any account.
/// @dev Strictly for test purposes.
contract GodModeErc20Permit is Erc20, Erc20Permit {
    /// EVENTS ///

    event Burn(address indexed holder, uint256 burnAmount);

    event Mint(address indexed beneficiary, uint256 mintAmount);

    /// CONSTRUCTOR ///

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Erc20Permit(name_, symbol_, decimals_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @notice Destroys `burnAmount` tokens from `holder`, reducing the token supply.
    /// @param holder The account whose tokens to burn.
    /// @param burnAmount The amount of tokens to destroy.
    function __godMode_burn(address holder, uint256 burnAmount) external {
        burnInternal(holder, burnAmount);
    }

    /// @notice Prints new tokens into existence and assigns them to `beneficiary`, increasing the
    /// total supply.
    /// @param beneficiary The account for which to mint the tokens.
    /// @param mintAmount The amount of tokens to print into existence.
    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }
}
