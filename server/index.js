const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1} = require("ethereum-cryptography/secp256k1");
const { toHex } = require('ethereum-cryptography/utils');
const { getEthAddr } = require("./generateKeys");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0xa340f611d2726ba10a7e378e9166ecaae747462f": 100,
  "0x8abb72b0096f05550afd8dd2d9fdce1ae852991b": 50,
  "0x6765f132e847ba4461b88bbd4d6f42cdb884c469": 75,
};

//Pks of above addrs:
//18aa7891a7b5b4ad7b31907803401360fae995fa93819886627cbd5f22aded81
//812662f979bc60b594039a8eee6198354da0ab452d2cf753018e604906d323f6
//f8b0d1f56155c12d7924e2f670b2ee4876840c55cdf194dc5a436314ea81c7dd

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { txData, messageHash, privateKey } = req.body;
  const sender = txData.sender;
  const recipient = txData.recipient;
  const amount = txData.amount;

  //Returns Signature
  const signedMessage = secp256k1.sign(
      messageHash,
      privateKey,
  );

  const isValid = validateTransaction(sender, messageHash, signedMessage, privateKey);
  if (!isValid) {
    res.status(400).send({ message: "Not valid sender"});
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

//To recover the public key, we need the message hash, signature, and recovery bit.
//Or simply use getPublicKey(privateKey).
//The private key must match the sender address, which confirms that the txn is authorized
const validateTransaction = (sender, messageHash, signedMessage, privateKey) => {
  const recoveredPublicKey = secp256k1.getPublicKey(privateKey);
  const recoveredEthAddr = "0x" + getEthAddr(recoveredPublicKey)
  const isSigned = secp256k1.verify(signedMessage, messageHash, recoveredPublicKey);
  let validSender = false;
  if (sender === recoveredEthAddr) {
    validSender = true
  }
  if (isSigned && validSender) {
    return true
  }
  return false
}

