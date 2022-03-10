// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

// Get contracts from Chainlink
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract VRFCoinToss is VRFConsumerBase {
    
    // Internal constants
    uint256 internal chainlinkFee;
    uint256 internal minBet;
    uint256 internal maxBet;
    uint256 internal betFee;

    // Number times the contract has been used
    uint256 public counter;

    // Keep track of system-level metrics
    uint256 public wins;
    uint256 public losses;
    uint256 public totalBalance;
    
    // Contract owner (not used)
    address payable owner;

    // Incoming Chainlink VRF 'requestID' => internal TX
    mapping(bytes32 => uint256) public requestIdToTx;

    // Is a user allowed to use the contract or not
    mapping(address => bool) public userLocked;

    // User balance
    mapping(address => uint256) public balances;

    // Transaction data structure
    struct transactionData {
        uint32 numberToGuess;   // Did the user choose heads or tails
        uint256 betAmount;      // How much?
        address sender;         // Who
        uint256 ifWinAmount;    // Pre-calculate the proceeds
        uint256 randomness;     // Save incoming Chainlink VRF 'randomness'
        bytes32 requestId;      // Save incoming Chainlink VRF 'requestID'
    }

    // Map internal TX to transactionData structure
    mapping(uint256 => transactionData) public TxToTxData;

    // Emited when we hear from Chainlink
    event fulfillRandomnessEvent(address indexed sender, bytes32 indexed requestId);

    // Chainlink VRF Contract Addresses [v1] 
    bytes32 internal chainlinkKeyHash;
      
    // Placeholders to store the random number (for debugging)
    uint256 public resultVRF;
    uint256 public resultVRFParsed;
    
    constructor () 
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
        )
        public
    {
        
        chainlinkKeyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        chainlinkFee    =  0.0001 * 10 ** 18; // 0.0001 LINK (Varies by network) ~ 0.15c
        minBet          =  0.1000 * 10 ** 18; // 0.100 MATIC  ~15c
        maxBet          =  1.0000 * 10 ** 18; // 1 MATIC ~$1.5 USD 
        betFee          =  0.0200 * 10 ** 18; // 0.02 MATIC ~5c / to pay for LINK and to pay devs
        
        // Owner - explicitly cast it to address payable 

        owner = payable(msg.sender);
        
    }
    
    /* 
     * guessTheNumber() -> public payable
     * 
     * Parameters:
     * - uint32 numberToGuess: What did the user choose? (heads or tails)
     * - uint256 betAmount: How much (MATIC) is the user betting?
     * 
     * Returns:
     * - bytes32 requestId: ChainLink VRF requestId
    */

    function guessTheNumber(uint32 numberToGuess, uint256 betAmount) public payable returns (bytes32 requestId) {
        
        // Need to send soma MATIC to play
        require(msg.value == betFee, "Need to pay to play");

        // User not locked, there is no in-flight TX
        require(userLocked[msg.sender] == false, "Locked, bet in progress");
        
        // Min/Max bet
        require(betAmount >= minBet, "Min bet error");
        require(betAmount <= maxBet, "Max bet error");

        // Check user has enough balace to play
        require(betAmount <= balances[msg.sender], "Not enough to bet");

        // Make sure the contract has enough LINK
        require(LINK.balanceOf(address(this)) >= chainlinkFee, "Contract does not have enought LINK");

        // As for a new random number and get requestId from Chainlink VRF
        requestId = requestRandomness(chainlinkKeyHash, chainlinkFee);

        // Generate a new in-flight TX based on the sender + counter
        uint256 requestTx = uint256(keccak256(abi.encode(msg.sender, ++counter)));

        // Map Chainlink's request ID to the in-flight request TX
        requestIdToTx[requestId] = requestTx;
        
        // Store the in-flight request TX to: numberToGuess, betAmount and sender
        TxToTxData[requestTx].numberToGuess = numberToGuess;
        TxToTxData[requestTx].betAmount = betAmount;
        TxToTxData[requestTx].sender = msg.sender;
        
        // Remove funds
        balances[msg.sender] -= betAmount;
        
        // Calculate returns
        TxToTxData[requestTx].ifWinAmount = balances[msg.sender] + betAmount * 2;

        // lock from betting while on flight
        userLocked[msg.sender] = true;

        // Return proof of randomness (by Chainlink)
        return requestId;
    }
    
    /* 
     * Callback function used by VRF Coordinator - fulfillRandomness() -> internal override
     * 
     * Parameters:
     * - bytes32 requestId: ChainLink VRF requestId
     * - uint256 randomness: Random number
     *
     * Event:
     * - fulfillRandomnessEvent(sender, requestId);
    */

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {    
        
        resultVRF = randomness;                     // For debugging
        resultVRFParsed = (randomness % 2) + 1;     
        
        // 1. Use requestId and requestIdToTx to recover the TX 
        // 2. Fill it with function parameters

        TxToTxData[requestIdToTx[requestId]].randomness = randomness;
        TxToTxData[requestIdToTx[requestId]].requestId = requestId;

        // Get numberToGuess from TX and compare it with random number's modulo % 2

        if (TxToTxData[requestIdToTx[requestId]].numberToGuess == resultVRFParsed){
            // User won
            // 1. Get sender from TX
            // 2. Update user's balance with pre-calculated win amount.
            ++wins;
            balances[TxToTxData[requestIdToTx[requestId]].sender] = TxToTxData[requestIdToTx[requestId]].ifWinAmount;
        } else {
            // User did not win, do nothing
            ++losses;
        }
        
        // unlock user
        userLocked[TxToTxData[requestIdToTx[requestId]].sender] = false;
        
        // emit event
        emit fulfillRandomnessEvent(TxToTxData[requestIdToTx[requestId]].sender, requestId);

    }

    /* 
     * withdrawFunds() -> public payable
     * 
     * Parameters:
     * - uint256 amount: How much to widthraw
     *
    */

    function withdrawFunds(uint256 amount) public payable {    
        
        // Make sure the user has enough to complete the transactio
        require(amount <= balances[msg.sender], "Not enough balance");
        
        // Track the balance deduction
        balances[msg.sender] -= amount;

        // Send the assets to the user
        (bool sent, bytes memory data) = msg.sender.call{value: amount}("");
        
        // Make sure that the transaction was succesfull
        require(sent, "Failed to send MATIC");
        
    }

    /* 
     * depositFunds() -> public payable
     * 
    */
     
    function depositFunds() public payable {
        
        // The contract will receive the balance

        // Keep track of the user's deposit

        balances[msg.sender] += msg.value;
    }

    /* 
     * getContractBalance() -> public view 
     * 
     * Returns:
     * - uint256: the contract's balance
    */

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    
}