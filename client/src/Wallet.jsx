import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

const getEthAddr = (publicKey) => {
    const firstByteRemoved = publicKey.slice(1);
    const keccakHash = keccak256(firstByteRemoved);
    return toHex(keccakHash.slice(-20));
}

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = "0x" + getEthAddr(secp256k1.getPublicKey(privateKey));
    setAddress(address);

    if (privateKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key (Ideally, this will be handled by Metamask etc)
        <input placeholder="Type a Private Key" value={privateKey} onChange={onChange}></input>
      </label>

      <div>
        My Address: {address}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
