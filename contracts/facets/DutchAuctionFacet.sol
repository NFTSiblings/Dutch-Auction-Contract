//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DutchAuctionLib {

    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("dutchauctionlib.storage");

    struct state {
        uint256 startingPrice;
        uint256 changePrice;
        uint256 endingPrice;
        uint256 startingTimestamp;
        uint256 intervalTime;
        uint256[] decreasingRate;
        uint256[] epochChange;
    }

    function getState() internal pure returns (state storage _state) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            _state.slot := position
        }
    }

    function calculatePrice() internal view returns (uint256 price) {
        state storage s = getState();
        if(block.timestamp < s.startingTimestamp) return s.startingPrice;
        uint256 epoch = (block.timestamp - s.startingTimestamp) / s.intervalTime;
        if(epoch <= s.epochChange[0]) {
            price = s.startingPrice - (epoch * s.decreasingRate[0]);
        }
        else if(epoch > s.epochChange[0] && epoch < s.epochChange[1]) {
            price = s.changePrice - ((epoch - s.epochChange[0])* s.decreasingRate[1]);
        }
        else {
            price = s.endingPrice;
        }
    }
}

import "../libraries/GlobalState.sol";

contract DutchAuctionFacet {

    // SETTER FUNCTIONS //

    function setTime(uint256 startingTimestamp, uint256 intervalTime, uint256[] memory epochChange) public {
        GlobalState.requireCallerIsAdmin();
        DutchAuctionLib.state storage s = DutchAuctionLib.getState();
        s.startingTimestamp = startingTimestamp;
        s.intervalTime = intervalTime;
        s.epochChange = epochChange;
    }

    function setPrice(uint256 startingPrice, uint256 changePrice, uint256 endingPrice, uint256[] memory decreasingRate) public {
        GlobalState.requireCallerIsAdmin();
        DutchAuctionLib.state storage s = DutchAuctionLib.getState();
        s.startingPrice = startingPrice;
        s.changePrice = changePrice;
        s.endingPrice = endingPrice;
        s.decreasingRate = decreasingRate;
    }

    // GETTER FUNCTIONS //

    function getTime() public view returns(uint256 startingTimestamp, uint256 intervalTime, uint256[] memory epochChange) {
        DutchAuctionLib.state storage s = DutchAuctionLib.getState();
        startingTimestamp = s.startingTimestamp;
        intervalTime = s.intervalTime;
        epochChange = s.epochChange;
    }

    function getPrice() public view returns(uint256 startingPrice, uint256 changePrice, uint256 endingPrice, uint256[] memory decreasingRate){
        DutchAuctionLib.state storage s = DutchAuctionLib.getState();
        startingPrice = s.startingPrice;
        changePrice = s.changePrice;
        endingPrice = s.endingPrice;
        decreasingRate = s.decreasingRate;
    }

    function currentPrice() public view returns(uint256 price) {
        price = DutchAuctionLib.calculatePrice();
    }

}