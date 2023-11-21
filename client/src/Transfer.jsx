import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  
  // Function to sign the message with the private key
  const signMessage = (message, address) => {
    const signature = secp.secp256k1.sign(message,address);
    return signature;
  };

  async function transfer(evt) {
    evt.preventDefault();

    const message = JSON.stringify({
      sender: address,
      recipient,
      amount: parseInt(sendAmount),
    });
    // Sign the message with the private key
    const signature = signMessage(utf8ToBytes(message), privateKey);
    console.log('signature: ', toHex(utf8ToBytes(signature.toString())));

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: JSON.stringify(signature, (_, v) => typeof v === 'bigint' ? v.toString() : v),
        amount: parseInt(sendAmount),
        recipient,
      });
      console.log('balance: ', balance);
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      // alert(ex.response.data.message);
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
