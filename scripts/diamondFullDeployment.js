// Console messages are currently disabled for testing purposes.
// They should be reenabled for deployments to testnets or mainnet!
const allowConsoleLogging = false
const diamondName = "ERC721ADiamondTemplate"
const excludeFacets = ["ExcludedFacet"]
const excludeFunctions = {
  CenterFacet: [
    "supportsInterface(bytes4)"
  ]
}

////////////////////////////////////////////////////////////

const fs = require('fs/promises')
const path = require('path')
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  if (allowConsoleLogging) console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // deploy Diamond
  const Diamond = await ethers.getContractFactory(diamondName)
  const diamond = await Diamond.deploy(diamondCutFacet.address)
  await diamond.deployed()
  if (allowConsoleLogging) console.log('Diamond deployed:', diamond.address)

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit')
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  if (allowConsoleLogging) console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  if (allowConsoleLogging) {
    console.log('')
    console.log('Deploying facets')
  }

  // get list of facets to add from files in the contracts directory
  // note that file names must be the same as the contract name for this to work
  const FacetFileNames = await fs.readdir(path.join(path.resolve(), '/contracts/facets'))
  const FacetNames = []
  FacetFileNames.forEach((fileName) => {
    let contractName = fileName.substring(0, fileName.length - 4)
    if (
      fileName != "DiamondCutFacet.sol" &&
      !excludeFacets.includes(fileName || contractName)
    ) FacetNames.push(contractName)
  })

  const cut = []
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    if (allowConsoleLogging) console.log(`${FacetName} deployed: ${facet.address}`)
    
    const remove = excludeFunctions[FacetName] ? excludeFunctions[FacetName] : [];

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet).remove(remove)
    })
  }

  // upgrade diamond with facets
  if (allowConsoleLogging) {
    console.log('')
    console.log('Diamond Cut:', cut)
  }
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData('initAll')
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  if (allowConsoleLogging) console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond cut failed: ${tx.hash}`)
  }
  if (allowConsoleLogging) console.log('Completed diamond cut')
  return diamond.address
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDiamond().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

exports.deployDiamond = deployDiamond