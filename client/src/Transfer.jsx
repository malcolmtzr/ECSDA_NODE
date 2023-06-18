import { useState } from "react";
import server from "./server";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import {keccak256} from "ethereum-cryptography/keccak.js";
import {secp256k1} from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const txData = {
      sender: address,
      recipient: recipient,
      amount: parseInt(sendAmount),
    };

    const messageHash = toHex(
        keccak256(
            utf8ToBytes(
                JSON.stringify(txData)
            )
        )
    );

        //Moved signing of message to backend because secp256k1.sign returns an
        //object with BigInt properties, which cant be serialized when sending to server

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
          txData,
          messageHash,
          privateKey,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
