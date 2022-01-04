// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract VRFCoinToss is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal chainlinkFee;
    uint256 internal minBet;
    uint256 internal maxBet;
    uint256 internal betFee;

    uint256 public counter;
    
    uint256 public resultVRF;
    uint256 public resultVRFParsed;
    uint256 public wins;
    uint256 public losses;
    
    address payable owner;
    uint256 public totalBalance;


    struct transactionData {
        uint32 numberToGuess;
        uint256 betAmount;
        address sender;
        uint256 ifWinAmount;
        uint256 randomness;
        bytes32 requestId;
    }

    mapping(bytes32 => uint256) public requestIdToTx;
    mapping(uint256 => transactionData) public TxToTxData;
    mapping(address => bool) public userLocked;
    mapping(address => uint256) public balances;

    event fulfillRandomnessEvent(address indexed sender, bytes32 indexed requestId);

    constructor () 
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
        )
        public
    {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;

        chainlinkFee =  0.0001 * 10 ** 18; // 0.0001 LINK (Varies by network) ~ 0.2c
        minBet =        0.1000 * 10 ** 18; // 0.100 MATIC  ~25c
        maxBet =        1.0000 * 10 ** 18; // 1 MATIC ~$2.5 USD 
        betFee =        0.0200 * 10 ** 18; // 0.02 MATIC ~5c / to pay for LINK and to pay devs
        
        owner = payable(msg.sender);
        
    }
    
    /** 
     * guessTheNumber
     */
    function guessTheNumber(uint32 numberToGuess, uint256 betAmount) public payable returns (bytes32 requestId) {
        
        require(msg.value == betFee, "Need to pay to enjoy free odds");

        // user not locked
        require(userLocked[msg.sender] == false, "Locked, bet in progress");
        
        // min bet
        require(betAmount >= minBet, "Min bet error");
        
        // max bet
        require(betAmount <= maxBet, "Max bet error");

        // check balance
        require(betAmount <= balances[msg.sender], "Not enough to bet");

        // make sure the contract has enough LINK
        require(LINK.balanceOf(address(this)) >= chainlinkFee, "Contract does not have enought LINK");

        // get requestId from Chainlink VRF
        requestId = requestRandomness(keyHash, chainlinkFee);

        // Generate a new in-flight Tx ID based on the sender + counter
        uint256 requestTx = uint256(keccak256(abi.encode(msg.sender, ++counter)));

        // Map Chainlink's request ID to the in-flight request TX
        requestIdToTx[requestId] = requestTx;
        
        // Store map the  in-flight request TX to: numberToGuess, betAmount and sender
        
        TxToTxData[requestTx].numberToGuess = numberToGuess;
        TxToTxData[requestTx].betAmount = betAmount;
        TxToTxData[requestTx].sender = msg.sender;
        
        // remove funds
        balances[msg.sender] -= betAmount;
        
        // calculate returns
        TxToTxData[requestTx].ifWinAmount = balances[msg.sender] + betAmount*2;

        // lock from betting while on flight
        userLocked[msg.sender] = true;

        // Return proof of randomness (by Chainlink) to the user
        return requestId;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {    
        
        resultVRF = randomness;
        resultVRFParsed = (randomness % 2) + 1;

        TxToTxData[requestIdToTx[requestId]].randomness = randomness;
        TxToTxData[requestIdToTx[requestId]].requestId = requestId;

        if (TxToTxData[requestIdToTx[requestId]].numberToGuess == resultVRFParsed){

            ++wins;
            balances[TxToTxData[requestIdToTx[requestId]].sender] = TxToTxData[requestIdToTx[requestId]].ifWinAmount;

        } else {

            ++losses;

        }
        
        // unlock user
        userLocked[TxToTxData[requestIdToTx[requestId]].sender] = false;
        
        // emit event
        emit fulfillRandomnessEvent(TxToTxData[requestIdToTx[requestId]].sender, requestId);


    }
    
    function withdrawFunds(uint256 amount) public payable {    
        require(amount <= balances[msg.sender], "Not enough balance");
        balances[msg.sender] -= amount;
        (bool sent, bytes memory data) = msg.sender.call{value: amount}("");
        
        require(sent, "Failed to send MATIC");
        
    }

    function depositFunds() public payable {
        balances[msg.sender] += msg.value;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    
}