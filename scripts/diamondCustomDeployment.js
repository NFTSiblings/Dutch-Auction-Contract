const diamondName = "ERC721ADiamondTemplate"
// set DiamondInit to the contract address of an existing initialiser contract,
// or set it to "deploy" to have the script deploy it, or set it to false to
// deploy without an intialiser contract.
const DiamondInit = "0xC16185B8c76311bFB46bC9b944777f729Cf6ee50"
const existingFacets = { // Goerli
  // if DiamondCutFacet is not present, it will be deployed
  DiamondCutFacet: "0xC38Bd9aE7ceeFA705579B71c0295Eb532d6B75D3",
  DiamondLoupeFacet: "0xD470198BF69e77df0887Da5e5300C945A56F9aE0",
  AdminPauseFacet: "0x326625BB25A27e24415D80448862ef876d4A4b80",
  AdminPrivilegesFacet: "0x33d110b29E64F88374dceD2B6d2C66328F7428A0",
  AllowlistFacet: "0xf941A38dEFA977a5Ab5d6264190c2f787a038a9e",
  CenterFacet: "0xb0EEd95E6B06eeFc153E7e1FB3Da76f76d79F580",
  ERC165Facet: "0xE723DF1C9156bA14f795C320214E22df0d0939D6",
  RoyaltiesConfigFacet: "0x1070d9EE14a3cda937522D14040125dbCDF35C24",
  SaleHandlerFacet: "0xB1086C9Bea003259d6a85A04475d656F2dA6E291",
  PaymentSplitterFacet: "0xBe6334e3CB600d3A627db20661a34557edc1fEd5"
}
const excludeFunctions = {
  CenterFacet: [
    "supportsInterface(bytes4)"
  ]
}

////////////////////////////////////////////////////////////

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
  let diamondCutFacet
  if (existingFacets.DiamondCutFacet) {
    // get existing deployed DiamondCutFacet
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', existingFacets.DiamondCutFacet)
    console.log('DiamondCutFacet exists at:', diamondCutFacet.address)
  } else {
    // deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
    diamondCutFacet = await DiamondCutFacet.deploy()
    await diamondCutFacet.deployed()
    console.log('DiamondCutFacet deployed:', diamondCutFacet.address)
  }

  // deploy Diamond
  const Diamond = await ethers.getContractFactory(diamondName)
  const diamond = await Diamond.deploy(diamondCutFacet.address)
  await diamond.deployed()
  console.log('Diamond deployed:', diamond.address)

  let diamondInit
  if (ethers.utils.isAddress(DiamondInit)) {
    // get existing deployed DiamondInit contract
    diamondInit = await ethers.getContractAt('DiamondInit', DiamondInit)
    console.log('DiamondInit contract exists at:', diamondInit.address)
  } else if (DiamondInit == "deploy") {
    // deploy DiamondInit
    const DiamondInit = await ethers.getContractFactory('DiamondInit')
    diamondInit = await DiamondInit.deploy()
    await diamondInit.deployed()
    console.log('DiamondInit deployed:', diamondInit.address)
  }
  
  const cut = []
  for (const FacetName in existingFacets) {
    if (FacetName == "DiamondCutFacet") continue

    const facet = await ethers.getContractAt(FacetName, existingFacets[FacetName])
    console.log(`${FacetName} exists at ${facet.address}`)

    const remove = excludeFunctions[FacetName] ? excludeFunctions[FacetName] : [];

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet).remove(remove)
    })
  }

  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt

  // call to init function
  if (DiamondInit) {
    let functionCall = diamondInit.interface.encodeFunctionData('initAll')
    tx = await diamondCut.diamondCut(cut, DiamondInit, functionCall)
  } else {
    tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, [])
  }

  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond cut failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return diamond.address
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDiamond().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

exports.deployDiamond = deployDiamond