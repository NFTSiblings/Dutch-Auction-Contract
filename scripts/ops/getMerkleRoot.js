// Use npm to install merkletreejs and keccak256 in
// this directory prior to running this script

// See readme file for instructions on how to use this script

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Reads wallet addresses from specified file in addresses directory
const allowlistAddresses = require("../../addresses/" + process.argv[2] + ".json");

const leafNodes = allowlistAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

rootHash = "0x" + toHexString(merkleTree.getRoot());

console.log("Root Hash:", rootHash);