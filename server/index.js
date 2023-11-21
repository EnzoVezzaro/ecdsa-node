const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { sign, recoverPublicKey } = require("ethereum-cryptography/secp256k1");
const { Buffer } = require("buffer");

app.use(cors());
app.use(express.json());

const balances = {
  "03c19096c76616ee75c2e5b6e569b190befc682d14f989dedae46de97688b5c02e": 100,
  "036683d9a2364184c005880e1460ba6eca3cead87c600d7e4027825a604a23079d": 50,
  "02e0200a30d0232b8f28b72ce0f5652be58f705c0a92b8d235b18aae25c5579814": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log(address);
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // public key is the sender 
  const { sender, recipient, amount } = req.body;

  // Verify the signature
  const messageHash = toBuffer(`send ${amount} to ${recipient}`);
  const publicKey = recoverPublicKey(messageHash, sender);
  console.log('public key: ', publicKey);
  if (!publicKey || !publicKey.equals(toBuffer(sender, "hex"))) {
    res.status(400).send({ message: "Invalid signature!" });
    return;
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
