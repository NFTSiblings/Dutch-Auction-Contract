// const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
// const { expect, assert } = require("chai")
// const { ethers } = require("hardhat")

// beforeEach(async () => {
//     [deployer] = await ethers.getSigners()
//     diamondAddress = await deployDiamond()

//     DiamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
//     AdminPrivilegesFacet = await ethers.getContractAt('AdminPrivilegesFacet', diamondAddress)
//     AllowlistFacet = await ethers.getContractAt('AllowlistFacet', diamondAddress)
//     CenterFacet = await ethers.getContractAt('CenterFacet', diamondAddress)
//     ERC165Facet = await ethers.getContractAt('ERC165Facet', diamondAddress)
//     PaymentSplitterFacet = await ethers.getContractAt('PaymentSplitterFacet', diamondAddress)
//     SaleHandlerFacet = await ethers.getContractAt('SaleHandlerFacet', diamondAddress)
//     RoyaltiesConfigFacet = await ethers.getContractAt('RoyaltiesConfigFacet', diamondAddress)
// })

// describe("Diamond Deployment", () => {
//     it("Correctly sets the contract owner", async () => {
//         expect(await AdminPrivilegesFacet.owner()).to.equal(deployer.address)
//     })

//     it("Correctly adds DiamondCutFacet", async () => {
//         // Checking that a facet exists for the diamondCut function
//         const diamondCutFunctionSelector = "0x1f931c1c"
//         expect(await DiamondLoupeFacet.facetAddress(diamondCutFunctionSelector))
//         .not.to.be.equal(ethers.constants.AddressZero)
//     })
// })

// describe("Initialisation", () => {
//     it("All facets are added", async () => {
//         facetAddresses = []
//         for (address of await DiamondLoupeFacet.facetAddresses()) {
//             facetAddresses.push(address)
//         }
//         assert.equal(facetAddresses.length, 12)
//     })

//     it("AdminPrivilegesFacet is initialised correctly", async () => {
//         admin = "0x885Af893004B4405Dc18af1A4147DCDCBdA62b50"
//         expect(await AdminPrivilegesFacet.isAdmin(admin)).to.equal(true)
//     })

//     it("AllowlistFacet is initialised correctly", async () => {
//         merkleRoot = "0x3d7ea9207f8fd37c25e5eebfea71390f9fefee8c47f9b9a5c390cdee08df7ba2"
//         expect(await AllowlistFacet.merkleRoot()).to.equal(merkleRoot)
//     })

//     it("CenterFacet is initialised correctly", async () => {
//         maxSupply = 10000
//         baseURI = "https://gateway.pinata.cloud/ipfs/.../?"
//         walletCaps = [5, 20]
//         prices = [ethers.utils.parseEther("0.01"), ethers.utils.parseEther("0.01")]
//         contractName = "MyToken"
//         contractSymbol = "MTK"
//         startTokenId = 0

//         expect(await CenterFacet.maxSupply()).to.equal(maxSupply)
//         await CenterFacet.reserve(1)
//         expect(await CenterFacet.exists(0)).to.equal(true)
//         expect(await CenterFacet.tokenURI(0)).to.equal(baseURI + "0")
//         expect(await CenterFacet.walletCap()).to.equal(walletCaps[1])
//         expect(await CenterFacet.walletCapAL()).to.equal(walletCaps[0])
//         expect(await CenterFacet.price()).to.equal(prices[1])
//         expect(await CenterFacet.priceAL()).to.equal(prices[0])
//         expect(await CenterFacet.name()).to.equal(contractName)
//         expect(await CenterFacet.symbol()).to.equal(contractSymbol)
//     })

//     it("ERC165Facet is initialised correctly", async () => {
//         interfaceIds = ["0x01ffc9a7", "0x7f5828d0", "0x2a55205a", "0x80ac58cd", "0x5b5e139f", "0x48e2b093", "0x1f931c1c"]

//         for (id of interfaceIds) {
//             expect(await ERC165Facet.supportsInterface(id)).to.equal(true);
//         }
//     })

//     it("PaymentSplitterFacet is initialised correctly", async () => {
//         shareholder = "0x699a1928EA12D21dd2138F36A3690059bf1253A0"

//         expect(await PaymentSplitterFacet.totalShares()).to.equal(1)
//         expect(await PaymentSplitterFacet.payee(0)).to.equal(shareholder)
//         expect(await PaymentSplitterFacet.shares(shareholder)).to.equal(1)
//     })

//     it("SaleHandlerFacet is initialised correctly", async () => {
//         privSaleTimestamp = 1663286400
//         privSaleLength = 86400
//         publicSaleLength = 86400

//         expect(await SaleHandlerFacet.saleTimestamp()).to.equal(privSaleTimestamp)
//         expect(await SaleHandlerFacet.privSaleLength()).to.equal(privSaleLength)
//         expect(await SaleHandlerFacet.publicSaleLength()).to.equal(publicSaleLength)
//     })

//     it("RoyaltiesConfigFacet is initialised correctly", async () => {
//         royaltyRecipient = "0x699a1928EA12D21dd2138F36A3690059bf1253A0"
//         royaltyBps = 1000

//         let recipient
//         [recipient, fee] = await RoyaltiesConfigFacet.royaltyInfo(0, ethers.utils.parseEther("1"))

//         expect(recipient).to.equal(royaltyRecipient)
//         expect(fee).to.equal(ethers.utils.parseEther("1").mul(royaltyBps).div(10000))
//     })
// })