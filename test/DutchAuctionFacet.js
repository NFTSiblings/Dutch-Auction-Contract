const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
const { expect, assert } = require('chai')
const { ethers } = require('hardhat')
const helpers = require('@nomicfoundation/hardhat-network-helpers')

beforeEach(async () => {

    [deployer, addr1] = await ethers.getSigners()
    diamondAddress = await deployDiamond()

    AdminPrivilegesFacet = await ethers.getContractAt('AdminPrivilegesFacet', diamondAddress)
    DutchAuctionFacet = await ethers.getContractAt('DutchAuctionFacet', diamondAddress)

    initialStartingTimestamp = ethers.BigNumber.from("1672155559")
    initialIntervalTime = ethers.BigNumber.from("600")
    initialEpochChange = [ethers.BigNumber.from("6"), ethers.BigNumber.from("12")]

    initialStartingPrice = ethers.utils.parseEther('0.5')
    initialChangePrice = ethers.utils.parseEther('0.2')
    initialEndingPrice = ethers.utils.parseEther('0.075')
    initialDecreasingRate = [ethers.utils.parseEther('0.05'), ethers.utils.parseEther('0.025')]

})

describe('DutchAuctionFacet', () => {

    describe('Checking getter functions', () => {

        beforeEach(async () => {

            time = await DutchAuctionFacet.getTime()
            price = await DutchAuctionFacet.getPrice()

        })

        it('Checking the initial state with getTime() function', async () => {

            expect(time.startingTimestamp.eq(initialStartingTimestamp)).to.equal(true)
            expect(time.intervalTime.eq(initialIntervalTime)).to.equal(true)
            for(let i = 0; i < time.epochChange.length; i++){
                expect(time.epochChange[i].eq(initialEpochChange[i])).to.equal(true)
            }

        })

        it('Checking the initial state with getPrice() function', async () => {

            expect(price.startingPrice.eq(initialStartingPrice)).to.equal(true)
            expect(price.changePrice.eq(initialChangePrice)).to.equal(true)
            expect(price.endingPrice.eq(initialEndingPrice)).to.equal(true)
            for(let i = 0; i < price.decreasingRate.length; i++){
                expect(price.decreasingRate[i].eq(initialDecreasingRate[i])).to.equal(true)
            }

        })

    })

    describe('Check setter functions', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(deployer.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(addr1.address)).to.equal(false)

            startingTimestamp = ethers.BigNumber.from("3521354")
            intervalTime = ethers.BigNumber.from(100)
            epochChange = [ethers.BigNumber.from(2), ethers.BigNumber.from(5)]

            startingPrice = ethers.BigNumber.from(ethers.utils.parseEther('0.2'))
            changePrice = ethers.BigNumber.from(ethers.utils.parseEther('0.01'))
            endingPrice = ethers.BigNumber.from(ethers.utils.parseEther('0.02'))
            decreasingRate = [ethers.BigNumber.from(ethers.utils.parseEther('0.0025')), ethers.BigNumber.from(ethers.utils.parseEther('0.0015'))]

        })

        it('Non-admins get reverted with setTime()', async () => {

            await expect(DutchAuctionFacet.connect(addr1).setTime(startingTimestamp, intervalTime, epochChange))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })

        it('Non-admins get reverted with setPrice()', async () => {

            await expect(DutchAuctionFacet.connect(addr1).setPrice(startingPrice, changePrice, endingPrice, decreasingRate))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })

        it('Admins allowed setTime() & verifying the new set variables', async () => {

            await DutchAuctionFacet.connect(deployer).setTime(startingTimestamp, intervalTime, epochChange)

            let time = await DutchAuctionFacet.getTime()
            expect(time.startingTimestamp.eq(startingTimestamp)).to.equal(true)
            expect(time.intervalTime.eq(intervalTime)).to.equal(true)
            for(let i = 0; i < time.epochChange.length; i++){
                expect(time.epochChange[i].eq(epochChange[i])).to.equal(true)
            }

        })

        it('Admins allowed setPrice() & verifying the new set variables', async () => {

            await DutchAuctionFacet.connect(deployer).setPrice(startingPrice, changePrice, endingPrice, decreasingRate)

            let price = await DutchAuctionFacet.getPrice()
            expect(price.startingPrice.eq(startingPrice)).to.equal(true)
            expect(price.changePrice.eq(changePrice)).to.equal(true)
            expect(price.endingPrice.eq(endingPrice)).to.equal(true)
            for(let i = 0; i < price.decreasingRate.length; i++){
                expect(price.decreasingRate[i].eq(decreasingRate[i])).to.equal(true)
            }

        })

    })

    describe('Check currentPrice() function', () => {

        beforeEach(async () => {

            time = await DutchAuctionFacet.getTime()
            price = await DutchAuctionFacet.getPrice()

            currentPrice = ethers.BigNumber.from(price.startingPrice)

        })

        it('Verifying currentPrice() output in every possible scenario', async () => {

            //Before start of sale
            expect(ethers.BigNumber.from(await helpers.time.latest()).lt((time.startingTimestamp))).to.equal(true)
            expect(await DutchAuctionFacet.currentPrice()).to.equal(price.startingPrice)

            //Calculating when the price will reach minimum
            let saleDuration = 0
            let i = ethers.BigNumber.from(price.startingPrice)
            for(i = ethers.BigNumber.from(price.startingPrice); ethers.BigNumber.from(i).gt(ethers.BigNumber.from(price.endingPrice));){
                saleDuration += 600
                if(i.gt(ethers.BigNumber.from(price.changePrice))){
                    i = i.sub(ethers.BigNumber.from(price.decreasingRate[0]))
                }
                else if (i.gt(ethers.BigNumber.from(price.endingPrice))){
                    i = i.sub(ethers.BigNumber.from(price.decreasingRate[1]))
                }
            }
            let endTimestamp = ethers.BigNumber.from(time.startingTimestamp).add(saleDuration)
            //Increasing timestamp to start of sale
            await helpers.time.increaseTo(time.startingTimestamp)

            //Looping through to check price every 10 minutes
            //Confirming function is working properly at each stage
            let j = ethers.BigNumber.from(time.startingTimestamp)
            for(j = ethers.BigNumber.from(time.startingTimestamp); j.lte(endTimestamp);){
                expect(currentPrice.eq(ethers.BigNumber.from(await DutchAuctionFacet.currentPrice()))).to.equal(true)
                if(currentPrice.gt(ethers.BigNumber.from(price.changePrice))){
                    currentPrice = currentPrice.sub(ethers.BigNumber.from(price.decreasingRate[0]))
                }
                else if(currentPrice.gt(ethers.BigNumber.from(price.endingPrice))){
                    currentPrice = currentPrice.sub(ethers.BigNumber.from(price.decreasingRate[1]))
                }
                await helpers.time.increase(time.intervalTime)
                j = ethers.BigNumber.from(await helpers.time.latest())
            }

            //Not required but checking that after price as reached endingPrice
            //It stays there when checking afterwards
            expect(ethers.BigNumber.from(await helpers.time.latest()).gt(ethers.BigNumber.from(time.startingTimestamp).add(saleDuration))).to.equal(true)
            expect(await DutchAuctionFacet.currentPrice()).to.equal(price.endingPrice)

        })

    })

})