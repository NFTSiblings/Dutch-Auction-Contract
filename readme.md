## **Deployments**

This Diamond is deployed at 0x492fC41f031A28AbA7446c9422247541d2D37c80 on Goerli testnet.

[Diamond Admin Panel](https://ethan-sibs.web.app/?diamond=0x492fC41f031A28AbA7446c9422247541d2D37c80)

[Etherscan](https://goerli.etherscan.io/address/0x492fC41f031A28AbA7446c9422247541d2D37c80)

## **Adapting this Template for a New Project**

- Run `npm install` to install required modules
- Add your facet contracts to `/contracts/facets`
    - Install any necessary packages from npm, e.g. ERC721A or OpenZeppelin Contracts
- Make sure `Diamond.sol` contains the latest version of our template diamond contract
- Make sure all existing facets in the template are of their latest versions, and that all are compatible
- Modify `DiamondInit.sol` to initialise all facets with correct values for your particular project
- If necessary, replace the list of addresses in the `addresses` directory with your own list

## **Scripts/Operations**

**getMerkleRoot.js**

`scripts/ops/getMerkleRoot.js`

Generates a Merkle Root from a provided list of addresses. Provide the name of the file in the `addresses` directory (without the file extension) which contains the list of addresses to generate a Merkle Root from. The address list file must be in `.json` format.

This script can be run via Node or Hardhat.

Example:

```jsx
node scripts/ops/getMerkleRoot.js allowlist
// Returns Merkle Root for the list of addresses in addresses/allowlist.json
```

**getMerkleProof.js**

`scripts/ops/getMerkleProof.js`

Generates a Merkle Proof for a provided address in a provided list of addresses. Provide the name of the file in the `addresses` directory (without the file extension) which contains the address to generate a Merkle Proof for, and the address itself as a second argument. The address list file must be in `.json` format.

> Note: even if the same address is part of more than one list, the merkle proof will change between different lists. Make sure to choose the file carefully.
> 

This script can be run via Node or Hardhat.

Example:

```jsx
node scripts/ops/getMerkleProof.js allowlist 0x699a1928EA12D21dd2138F36A3690059bf1253A0
// Returns Merkle Proof for 0x699a...53A0 as part of addresses/allowlist.json
```

**deployFacet.js**

`scripts/deployFacet.js`

Deploys a single smart contract to the network.

Make sure to insert the name of the smart contract on line 1 before running the script.

Provide a network to deploy the contract to as a parameter when invoking the script.

This script must be run via Hardhat.

Example:

```jsx
npx hardhat run scripts/deployFacet.js --network rinkeby
```

**deployFacetAndDiamondCut.js**

`scripts/deployFacetAndDiamondCut.js`

Deploys a single smart contract to the network, adds it to the provided Diamond with a diamond cut transaction, and verifies the new facet.

Make sure to set the name of the facet to be deployed on line 1, the address of the diamond on line 2, and the address of the diamond initialiser contract on line 3. If no diamond initialiser contract is required, set the variable on line 3 to `false`.
Also, make sure to set the `excludeFunctions` variable to an array of the function signatures which are to be excluded from the diamond cut. If no functions need to be excluded, this variable should be set to an empty array.

Provide a network to deploy the contract to as a parameter when invoking the script.

This script must be run via Hardhat.

Example:

```jsx
npx hardhat run scripts/deployFacetAndDiamondCut.js --network rinkeby
```

**diamondCustomDeployment.js**

`scripts/diamondCustomDeployment.js`

Deploys the diamond contract, links existing facets which have already been deployed to the network, and initialises facets using a diamond initialiser contract.

Make sure to add the name of the diamond contract on line 1.

Also, add the address of the deployed diamond initialiser contract on line 5. If the diamond initialiser contract is not deployed yet and you want to deploy it, set this variable to `"deploy"`. If you do not want to use a diamond initialiser contract for this deployment, set this variable to `false`.

Set the `existingFacets` variable on line 6 to an object which contains the names of all deployed facets, and their addresses. Here is an example of what the `existingFacets` object might look like:

```jsx
const existingFacets = { // Rinkeby
  // if DiamondCutFacet is not present, it will be deployed
  DiamondCutFacet: "0x3C616F532cBA23F2A2690B12FCA495aAD4a16E43",
  DiamondLoupeFacet: "0x706985da9e528b86c0553d676cac0315ff3c8d48",
  AdminPauseFacet: "0x92e28663ebf433d8a3785d96a70a6233dff60233",
  AdminPrivilegesFacet: "0x4b5f7cb0ebe63bfc7a125e7bea74f6beb5aef987",
  ERC721AFacet: "0x80d2c3f931ffbdf2977c4517a6319a46ffd5fdf7",
  CenterFacet: "0x2419740564746c90b64d0cc105f15617e4fe5462"
}
```

> Note: if `DiamondCutFacet` is not a member of `existingFacets`, it will be deployed by the script.
> 

To exclude functions from being added to the diamond, you can add them to the `excludeFunctions` object, organised by the facet that they belong to. Here is an example of what the `excludeFunctions` object might look like:

```jsx
const excludeFunctions = {
  ERC721AFacet: [
    "_setAux(address,uint64)",
    "_getAux(address)",
  ],
  PaymentSplitterFacet: [
    "released(address)",
    "totalReleased()"
  ]
}
```

Provide a network to deploy the contract to as a parameter when invoking the script.

This script must be run via Hardhat.

Example:

```jsx
npx hardhat run scripts/diamondCustomDeployment.js --network rinkeby
```

**diamondFullDeployment.js**

`scripts/diamondFullDeployment.js`

Deploys entire diamond (including all related facets & diamond initialiser contract), and sends a diamond cut transaction which links all facets and initialises them with the diamond initialiser contract.

This script is imported by Hardhat test scripts to facilitate tests, but it can also be used to deploy a diamond to a testnet or mainnet.

If you use this script to deploy to a live network, make sure to allow console logging by changing the variable on line 3 to `true`. When running Hardhat test scripts, it’s best to keep this variable set to `false`.

Make sure to add the name of the diamond contract on line 4.

The facets which are added to the diamond are automatically determined by the files in the `/contracts/facets` directory. All of these files must share the same name as the smart contracts inside them.

To exclude facet contracts which are inside the facets folder, you can add the name of the facet contract to the array of excluded facets on line 5.

To exclude functions from being added to the diamond, you can add them to the object on line 6, organised by the facet that they belong to. Here is an example of what the `excludeFunctions` object might look like:

```jsx
const excludeFunctions = {
  ERC721AFacet: [
    "_setAux(address,uint64)",
    "_getAux(address)",
  ],
  PaymentSplitterFacet: [
    "released(address)",
    "totalReleased()"
  ]
}
```

Provide a network to deploy the contract to as a parameter when invoking the script.

This script must be run via Hardhat.

Example:

```jsx
npx hardhat run scripts/diamondFullDeployment.js --network rinkeby
```

## **Testing**

When testing contracts, you can easily set up a diamond on the Hardhat network by importing the `diamondFullDeployment.js` script.

At the top of your test script file, include:

```jsx
const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
```

And in your `beforeEach` function, use the following:

```jsx
diamondAddress = await deployDiamond()
AdminPauseFacet = await ethers.getContractAt('AdminPauseFacet', diamondAddress)
```

Once you have got the diamond’s address using `await deployDiamond()`, you can use `ethers.getContractAt(facetName, diamondAddress)` to create contract instances for each facet. In your tests, you can call these contracts to run transactions, as you would with a normal smart contract.

## **Deploying The Diamond**

Using the scripts in this repo, you can deploy your diamond a number of ways. Make sure to read my guides above before using any of the scripts in this repo.

You may choose to deploy each facet one by one using `scripts/deployFacet.js`.

With all of your facets deployed, you may choose to use `scripts/diamondCustomDeployment.js` to deploy your diamond and automatically add the existing facet contracts to the diamond.

If you want to add a facet to an existing diamond, you can use `scripts/deployFacetAndDiamondCut.js`.

Alternatively, if you want to deploy the diamond and all related contracts in one go (including `DiamondCutFacet` and the diamond initialiser contract), you can use `scripts/diamondFullDeployment.js`. This script is good for deploying the contract in full to a testnet.
