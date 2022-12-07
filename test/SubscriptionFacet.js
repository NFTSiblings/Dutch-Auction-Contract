// const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
// const { expect, assert } = require("chai")
// const { ethers } = require('hardhat')
// const helpers = require('@nomicfoundation/hardhat-network-helpers')

// beforeEach(async () => {
//     [deployer, addr1] = await ethers.getSigners()
//     diamondAddress = await deployDiamond()
    
//     SubscriptionFacet = await ethers.getContractAt('SubscriptionFacet', diamondAddress)

//     periodLength = 2592000
//     price = ethers.utils.parseEther("0.05")

//     await SubscriptionFacet.setSubscriptionPeriod(periodLength)
//     await SubscriptionFacet.setSubscriptionPrice(price)
// })

// describe("SubscriptionFacet", () => {
//     describe("Setting Subscription Price", () => {
//         it("setSubscriptionPrice is only callable by admins", async () => {
//             await expect(SubscriptionFacet.connect(addr1).setSubscriptionPrice(0))
//             .to.be.revertedWith("GlobalState: caller is not admin or owner")
//         })

//         it("setSubscriptionPrice correctly updates the stored price variable", async () => {
//             await SubscriptionFacet.setSubscriptionPrice(1)
//             expect(await SubscriptionFacet.subscriptionPrice()).to.equal(1)
//         })
//     })

//     describe("Setting Subscription Period Length", () => {
//         it("setSubscriptionPeriod is only callable by admins", async () => {
//             await expect(SubscriptionFacet.connect(addr1).setSubscriptionPeriod(0))
//             .to.be.revertedWith("GlobalState: caller is not admin or owner")
//         })

//         it("setSubscriptionPeriod correctly updates the stored period variable", async () => {
//             await SubscriptionFacet.setSubscriptionPeriod(1)
//             expect(await SubscriptionFacet.subscriptionPeriod()).to.equal(1)
//         })
//     })

//     describe("Setting a subscription", () => {
//         it("setSubscription is only callable by admins", async () => {
//             await expect(SubscriptionFacet.connect(addr1).setSubscription(0, 0))
//             .to.be.revertedWith("GlobalState: caller is not admin or owner")
//         })

//         it("setSubscription correctly updates the given subscription", async () => {
//             let timestamp = await helpers.time.latest()
//             await SubscriptionFacet.setSubscription(0, timestamp + periodLength)

//             expect(await SubscriptionFacet.getExpiration(0)).to.equal(timestamp + periodLength)
//         })

//         it("setSubscription correctly emits subscriptionUpdated event", async () => {
//             let timestamp = await helpers.time.latest()
//             expect(await SubscriptionFacet.renewSubscription(0, periodLength, { value: price }))
//             .to.emit(SubscriptionFacet, "subscriptionUpdated")
//             .withArgs(0, 0, timestamp + periodLength)
//         })
//     })

//     describe("Withdrawing Ether", () => {
//         it("withdrawEther is only callable by admins", async () => {
//             await expect(SubscriptionFacet.connect(addr1).withdrawEther())
//             .to.be.revertedWith("GlobalState: caller is not admin or owner")
//         })

//         it("withdrawEther sends all Ether in the contract to the caller", async () => {
//             // Send Ether to contract to be withdrawn
//             await deployer.sendTransaction({
//                 to: SubscriptionFacet.address,
//                 value: ethers.utils.parseEther("1")
//             });

//             expect(await SubscriptionFacet.withdrawEther())
//             .to.changeEtherBalance(deployer, ethers.utils.parseEther("1") * -1)
//         })
//     })

//     describe("Reading existing subscription status", () => {
//         it("getExpiration correctly returns the expiration timestamp of the given subscription", async () => {
//             // Non-existant subscription
//             expect(await SubscriptionFacet.getExpiration(0)).to.equal(0)

//             // Existing subscription
//             await SubscriptionFacet.setSubscription(0, 10)

//             expect(await SubscriptionFacet.getExpiration(0)).to.equal(10)
//         })
//     })

//     describe("Renewing subscriptions", () => {
//         describe("Accepts the correct amount of Ether", () => {

//             it("Rejects txn with no Ether value", async () => {
//                 await expect(
//                     SubscriptionFacet.connect(addr1).renewSubscription(
//                         0,
//                         periodLength
//                     )
//                 ).to.be.revertedWith("Incorrect amount of Ether sent")
//             })

//             it("Rejects txn with wrong amount of Ether", async () => {
//                 await expect(
//                     SubscriptionFacet.connect(addr1).renewSubscription(
//                         0,
//                         periodLength,
//                         { value: price.mul(2) }
//                     )
//                 ).to.be.revertedWith("Incorrect amount of Ether sent")
//             })

//             it("Accepts correct amount of Ether for a single period", async () => {
//                 expect(
//                     await SubscriptionFacet.connect(addr1).renewSubscription(
//                         0,
//                         periodLength,
//                         { value: price }
//                     )
//                 ).not.to.be.reverted
//             })

//             it("Accepts correct amount of Ether for a multiple of period", async () => {
//                 expect(
//                     await SubscriptionFacet.connect(addr1).renewSubscription(
//                         0,
//                         5184000,
//                         { value: price.mul(2) }
//                     )
//                 ).not.to.be.reverted
//             })
//         })

//         describe("Correctly sets the expiration timestamp for the given subscription", () => {
//             it("New subscription", async () => {

//                 let timestamp = await helpers.time.latest()
//                 await SubscriptionFacet.renewSubscription(0, periodLength, { value: price })

//                 expect(await SubscriptionFacet.getExpiration(0)).to.be.closeTo(timestamp + periodLength, 1)

//             })

//             it("Existing subscription", async () => {
//                 let prevExpiry = await helpers.time.latest() + 1000
//                 await SubscriptionFacet.setSubscription(0, prevExpiry)

//                 await SubscriptionFacet.connect(addr1).renewSubscription(0, periodLength, { value: price })
//                 expect(await SubscriptionFacet.getExpiration(0)).to.equal(prevExpiry + periodLength)
//             })
//         })

//         it("Length of added subscription must be divisible by period variable", async () => {
//             // 0
//             await expect(SubscriptionFacet.connect(addr1).renewSubscription(0, 0))
//             .to.be.revertedWith("Invalid subscription length")

//             // 1
//             await expect(SubscriptionFacet.connect(addr1).renewSubscription(0, 1))
//             .to.be.revertedWith("Invalid subscription length")

//             // periodLength * 1.5
//             await expect(SubscriptionFacet.connect(addr1).renewSubscription(0, periodLength * 1.5))
//             .to.be.revertedWith("Invalid subscription length")

//             // periodLength + 1
//             await expect(SubscriptionFacet.connect(addr1).renewSubscription(0, periodLength + 1))
//             .to.be.revertedWith("Invalid subscription length")
//         })

//         it("Correctly emits subscriptionUpdated event", async () => {
//             it("New subscription", async () => {
//                 let timestamp = await helpers.time.latest()
//                 expect(await SubscriptionFacet.connect(addr1).renewSubscription(0, periodLength, { value: price }))
//                 .to.emit(SubscriptionFacet, "subscriptionUpdated")
//                 .withArgs(0, 0, timestamp + periodLength)
//             })

//             it("Existing subscription", async () => {
//                 let prevExpiry = await helpers.time.latest() + 1000
//                 await SubscriptionFacet.setSubscription(0, prevExpiry)

//                 expect(await SubscriptionFacet.connect(addr1).renewSubscription(0, periodLength, { value: price }))
//                 .to.emit(SubscriptionFacet, "subscriptionUpdated")
//                 .withArgs(0, 0, prevExpiry + periodLength)
//             })
//         })
//     })
// })