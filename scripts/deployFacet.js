const contractName = "DiamondInit"

async function main() {
    const [deployer] = await ethers.getSigners()
  
    console.log("Deploying facet with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())
  
    const Facet = await ethers.getContractFactory(contractName)
    const facet = await Facet.deploy()
  
    console.log(`${contractName} deployed: ${facet.address}`)
  }
  
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})