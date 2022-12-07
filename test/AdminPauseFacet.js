// const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
// const { expect, assert } = require("chai")

// beforeEach(async () => {
//     [deployer] = await ethers.getSigners()
//     diamondAddress = await deployDiamond()
    
//     AdminPauseFacet = await ethers.getContractAt('AdminPauseFacet', diamondAddress)
// })

// describe('AdminPauseFacet', async () => {
//     it('Diamond Storage variables are correctly set by initialiser contract', async () => {
//         expect(await AdminPauseFacet.paused()).to.equal(false);
//     })

//     it('TogglePause function correctly toggles the paused status', async () => {
//         await AdminPauseFacet.togglePause();
//         expect(await AdminPauseFacet.paused()).to.equal(true);
//         await AdminPauseFacet.togglePause();
//         expect(await AdminPauseFacet.paused()).to.equal(false);
//     })

//     it('Events are correctly emitted when the contract is paused & unpaused', async () => {
//         expect(await AdminPauseFacet.togglePause())
//         .to.emit(AdminPauseFacet, "Paused")
//         .withArgs(deployer.address);
//     })
// })