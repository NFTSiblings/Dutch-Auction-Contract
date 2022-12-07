const contracts = { // Goerli
    Diamond: {
        address: "0x492fC41f031A28AbA7446c9422247541d2D37c80",
        arguments: ["0xC38Bd9aE7ceeFA705579B71c0295Eb532d6B75D3"]
    },
    DiamondInit: { address: "0xC16185B8c76311bFB46bC9b944777f729Cf6ee50" },
    DiamondCutFacet: { address: "0xC38Bd9aE7ceeFA705579B71c0295Eb532d6B75D3" },
    DiamondLoupeFacet: { address: "0xD470198BF69e77df0887Da5e5300C945A56F9aE0" },
    AdminPauseFacet: { address: "0x326625BB25A27e24415D80448862ef876d4A4b80" },
    AdminPrivilegesFacet: { address: "0x33d110b29E64F88374dceD2B6d2C66328F7428A0" },
    AllowlistFacet: { address: "0xf941A38dEFA977a5Ab5d6264190c2f787a038a9e" },
    CenterFacet: { address: "0xb0EEd95E6B06eeFc153E7e1FB3Da76f76d79F580" },
    ERC165Facet: { address: "0xE723DF1C9156bA14f795C320214E22df0d0939D6" },
    RoyaltiesConfigFacet: { address: "0x1070d9EE14a3cda937522D14040125dbCDF35C24" },
    SaleHandlerFacet: { address: "0xB1086C9Bea003259d6a85A04475d656F2dA6E291" },
    PaymentSplitterFacet: { address: "0xBe6334e3CB600d3A627db20661a34557edc1fEd5" }
}

////////////////////////////////////////////////////////////

async function main() {
    for (contract in contracts) {
        console.log("Verifying " + contract + " at " + contracts[contract].address)

        try {

            await hre.run("verify:verify", {
                address: contracts[contract].address,
                constructorArguments: contracts[contract].arguments
            })

        } catch (err) {

            console.error("Failed to verify " + contract)

        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})