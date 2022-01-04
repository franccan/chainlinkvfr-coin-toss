# chainlinkvfr-coin-toss

<img src="https://raw.githubusercontent.com/franccan/chainlinkvfr-coin-toss/master/docs/screenshot1.png" alt="Screenshot">

### What is Chainlink VRF?

Chainlink VRF (Verifiable Random Function) is a provably-fair and verifiable source of randomness designed for smart contracts. Smart contract developers can use Chainlink VRF as a tamper-proof random number generator (RNG) to build reliable smart contracts for any applications which rely on unpredictable outcomes. Some examples include: games, NFTs, random assignment of duties, choosing representatives, or even just for fun!

### How does it work?

Chainlink VRF generates a random number and cryptographic proof of how that number was determined. The proof is published and verified on-chain before it can be used by any consuming applications. This process ensures that the results cannot be tampered with nor manipulated by anyone, including oracle operators, miners, users and even smart contract developers.

### How can I use it?

Your contract inherits from a smart contract provided by Chainlink and you run `requetRandomness` which returns `requestId`. Then after some time the hard-coded callback function `fulfullrandomness` is triggered and `requestId` comes as a parameter. This process takes about 20 seconds using the Polygon network. The contract sends MATIC as part of this process. Your contract needs to have enough funds to interact with the VFR function. At the time of writing the cost of generating a 256-bit random number is 0.0001 LINK (~0.0023 USD at the time of writing of this document)

More information about how this works: https://docs.chain.link/docs/get-a-random-number/

How about the VRF CoinToss game – what is it?

The idea of the game is to try your luck by tossing a coin; heads(1) or tails(2). If you guess the right number, you will receive 2 X whatever the amount you have waged. If you loose, you get nothing. 

Note: You need to send MATIC to the contract using the `despositFunds` function before being able to use the contract. You can always use `withdrawFunds` to get your MATIC back.

Note about state:

- Keeps track of your balance in the `balances` hashmap.

- Generates a unique internal tx id by hashing the sender address + a counter. This is used to map Chainlink's `requesId` with the individual request using the `requestIdToTx` hashmap.

- Keeps complete details of each internal tx in the `TxToTxData` hashmap

- A user cannot call `guessTheNumber` concurrently; the contact is locked when running `guessTheNumber` and unlocked when `fulfillRandomness` is triggered. This is tracked using the `userLocked` hashmap.


There is no ‘house edge’ and this is known as ‘free odds’. However, there is a small cost of producing the random number, somehow code needs to be maintained and enough MATIC needs to be staked to support payouts. This is why the contract won’t let you run `guessTheNumber` without sending a small amount of MATIC. 

Note that this is just a toy contract. I am not sure if this actually makes sense from an economical perspective.

VRF CoinToss game – how to try it?

## Part A – Deploy the smart contract and add some LINK to it

- Step 1 – Configure your environment (.env file) by adding you a private key mnemonic and RPC endpoint

- Step 2 – Deploy the smart contract

    `npm run migrate:polygon_mumbai`

- Step 3 – Grab the contract address and send some LINK to the contract. You can get free test LINK from the Chainlink faucet

## Part B - Interact with the contract. 
Here we have 2 options: (1) use the contract directly or (2) try th web interface. 

To use the web interface:
-	Modify index.js by pointing `CONTRACT` to your contract address
-	Load index.html on a web server  

To interact with the contract directly:
-	Compile the contract using Remix (but do not deploy it)
-	Load the contract at the address
