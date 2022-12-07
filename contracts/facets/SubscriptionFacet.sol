// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * SubscriptionLib authored by Sibling Labs
 * Version 0.1.0
 * 
 * This library is designed to work in conjunction with
 * SubscriptionFacet - it facilitates diamond storage and shared
 * functionality associated with SubscriptionFacet.
/**************************************************************/

library SubscriptionLib {
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("subscriptionlib.storage");

    struct state {
        mapping(uint256 => uint64) expirations;
        uint256 price;
        uint256 period;
    }

    /**
    * @dev Return stored state struct.
    */
    function getState() internal pure returns (state storage _state) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            _state.slot := position
        }
    }

    event subscriptionUpdated(
        uint256 tokenId,
        uint64 previousExpiry,
        uint64 newExpiry
    );
}

/**************************************************************\
 * SubscriptionFacet authored by Sibling Labs
 * Version 0.1.0
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";

contract SubscriptionFacet {

    // VARIABLE GETTERS //

    function subscriptionPrice() external view returns (uint256) {
        return SubscriptionLib.getState().price;
    }

    function subscriptionPeriod() external view returns (uint256) {
        return SubscriptionLib.getState().period;
    }

    // ADMIN FUNCTIONS //

    function setSubscriptionPrice(uint256 price) external {
        GlobalState.requireCallerIsAdmin();
        SubscriptionLib.getState().price = price;
    }

    function setSubscriptionPeriod(uint256 period) external {
        GlobalState.requireCallerIsAdmin();
        SubscriptionLib.getState().period = period;
    }

    function setSubscription(uint256 tokenId, uint64 expiration) external {
        GlobalState.requireCallerIsAdmin();

        uint64 prevExpiry = SubscriptionLib.getState().expirations[tokenId];

        SubscriptionLib.getState().expirations[tokenId] = expiration;
        emit SubscriptionLib.subscriptionUpdated(tokenId, prevExpiry, expiration);
    }

    function withdrawEther() external {
        GlobalState.requireCallerIsAdmin();
        payable(msg.sender).transfer(address(this).balance);
    }

    // PUBLIC FUNCTIONS //

    function getExpiration(uint256 tokenId) external view returns (uint64) {
        return SubscriptionLib.getState().expirations[tokenId];
    }

    function renewSubscription(uint256 tokenId, uint64 length) external payable {
        uint64 prevExpiry = SubscriptionLib.getState().expirations[tokenId];

        uint256 price = SubscriptionLib.getState().price;
        uint256 period = SubscriptionLib.getState().period;
        require(length % period == 0 && length > 0, "Invalid subscription length");
        require(msg.value == price * length / period, "Incorrect amount of Ether sent");

        uint64 newExpiry =
            block.timestamp > prevExpiry ?
            uint64(block.timestamp) + length :
            prevExpiry + length;
        
        SubscriptionLib.getState().expirations[tokenId] = newExpiry;

        emit SubscriptionLib.subscriptionUpdated(tokenId, prevExpiry, newExpiry);
    }

}