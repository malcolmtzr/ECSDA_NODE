// import { keccak256 } from "ethereum-cryptography/keccak";
// import { secp256k1 } from "ethereum-cryptography/secp256k1"
// import { toHex } from "ethereum-cryptography/utils";

const { keccak256 } = require("ethereum-cryptography/keccak");
const { secp256k1 } = require("ethereum-cryptography/secp256k1")
const { toHex } = require("ethereum-cryptography/utils")

const privateKey = secp256k1.utils.randomPrivateKey()
const publicKey = secp256k1.getPublicKey(privateKey);

//Eth addr =/= public key
//Eth addr is the last 20 bytes of the keccakHash of the public key
const getEthAddr = (publicKey) => {
    const firstByteRemoved = publicKey.slice(1);
    const keccakHash = keccak256(firstByteRemoved);
    return toHex(keccakHash.slice(-20));
}

exports.getEthAddr = getEthAddr;

//Represent in Hexadecimal format, which is the norm
console.log("Private Key: " + toHex(privateKey))
console.log("Public Key: " + toHex(publicKey))
console.log("Ethereum addr: 0x" + getEthAddr(publicKey))
console.log();

//run in sever root: node generateKeys.js


