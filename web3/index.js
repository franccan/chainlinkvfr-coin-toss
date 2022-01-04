MSG_PROCESSING = "<p align=\"center\"><i>Processing transaction on the Polygon blockchain using Chainlink VRF. <br><br>Please wait ~20 seconds</i></p>"
MSG_SIGN = "<p align=\"center\">Please sign the transaction using Metamask</p>"
MSG_WIN = "<p align=\"center\">You Won!</p>"
MSG_LOSE = "<p align=\"center\">You Lost. Better luck next time.</p>"

 CONTRACT = "0x60fbe0a615eAC5452dbAe964AdeAD1Fcd21c74Fe"
 ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "fulfillRandomnessEvent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "TxToTxData",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "numberToGuess",
        "type": "uint32"
      },
      {
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "ifWinAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "randomness",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "counter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "losses",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "randomness",
        "type": "uint256"
      }
    ],
    "name": "rawFulfillRandomness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "requestIdToTx",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resultVRF",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resultVRFParsed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userLocked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wins",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "numberToGuess",
        "type": "uint32"
      },
      {
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      }
    ],
    "name": "guessTheNumber",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function initWeb3() {

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    await provider.send("eth_requestAccounts", []);
    
    const signer = provider.getSigner();
    
    const account = await signer.getAddress();

    console.log("Account:",account);

    const contract = new ethers.Contract(CONTRACT, ABI, provider);

    const contractBalance =  ethers.utils.formatEther(await contract.getContractBalance()) ;
    console.log("getContractBalance():", contractBalance);

    const balance = ethers.utils.formatEther ( await contract.balances(account) , 18);
    console.log(balance);

    const contractWithSigner = await contract.connect(signer);
  
    const wins = ethers.utils.formatUnits ( await contract.wins() , 0);
    console.log("wins():", wins);

    const losses = ethers.utils.formatUnits ( await contract.losses() , 0);
    console.log("losses():", losses);

    // Get all events for the current user

    const filter = contract.filters.fulfillRandomnessEvent(account);
    vrfEvents = await contract.queryFilter(filter, -500);
    
    userTxs = [];
    
    vrfEvents.forEach(async function(vrfEvent) {

      vrfRequestId = await contract.requestIdToTx(vrfEvent.args.requestId);

      tx = await contract.TxToTxData(vrfRequestId);

      userTxs.push(tx);

    });

    console.log(userTxs);

    contract.on(filter, async function(sender,requestId,event) {

      console.log("sender->", sender);
      console.log("requestId->",requestId);
      console.log("event->",event);

      vrfRequestId = await contract.requestIdToTx(requestId);
      tx = await contract.TxToTxData(vrfRequestId);
      console.log(tx);

      console.log("numberToGuess->", tx.numberToGuess);
      console.log("Chainlink VRF randomness->", ethers.utils.formatUnits ( tx.randomness , 0));
      console.log("Chainlink VRF randomness mod 2 ->",ethers.utils.formatUnits(tx.randomness.mod(2),0));
      console.log("Chainlink VRF randomness mod 2 + 1->",Number(ethers.utils.formatUnits(tx.randomness.mod(2),0))+1);
      console.log("isWin:", Number(ethers.utils.formatUnits(tx.randomness.mod(2),0))+1 + 1 == tx.numberToGuess );
      
      Number(ethers.utils.formatUnits(tx.randomness.mod(2),0))+1 == tx.numberToGuess ?  alert("You Won!") : alert("You Lost, try again!");
      document.getElementById("bettingBox").style.display = "block";
      document.getElementById("bettingBoxProcessing").style.display = "none";

     
    });

    const accountData = {
      accountId : account,
      accountBalance : balance
    }

    const contractData = {
        signer : contractWithSigner,
        wins : wins,
        losses : losses,
        contractBalance : contractBalance
    }
    
    return { contractData, accountData }; 


}

async function depositFunds(contractWithSigner,value) {

    const tx = await contractWithSigner.depositFunds({
       value : ethers.utils.parseEther(value)
    });
    return tx;

}

async function withdrawFunds(contractWithSigner, value) {
    
    value = value * 10 ** 18;
    const tx = await contractWithSigner.withdrawFunds(String(value));
    return tx;

}

async function guessTheNumber(value, amount, contractWithSigner) {
    
    amount = amount * 10 ** 18;
    let err = {};
    let tx = {};
    try {

      const t = await contractWithSigner.guessTheNumber(value,String(amount), {
        value : ethers.utils.parseEther("0.02")
      });
      tx = t;

    } catch (e) {
      err = e;
    }

    result = { err : err, tx : tx};

    return result;

}

initWeb3().then(function(data){

    var accountElement = document.getElementById("account");
    accountElement.innerHTML = "Connected account: " + data.accountData.accountId;

    var balanceElement = document.getElementById("balance");
    balanceElement.innerHTML = "Available balance: " + data.accountData.accountBalance + " MATIC";

    var winsElement = document.getElementById("wins");
    winsElement.innerHTML = "Global wins: " + data.contractData.wins;

    var lossesElement = document.getElementById("losses");
    lossesElement.innerHTML = "Global losses: " + data.contractData.losses;

    var lossesElement = document.getElementById("contractBalance");
    lossesElement.innerHTML = "Contract balance: " + data.contractData.contractBalance + " MATIC";
    
    var depositFundsElement = document.getElementById("depositFunds");
    depositFundsElement.onclick = function(event) {
        
        var inputDepositFundsElement = document.getElementById("inputDepositFunds");
        depositFunds(data.contractData.signer,inputDepositFundsElement.innerHTML).then(function(tx){
            console.log(tx);
        });
    }

    var withdrawFundsElement = document.getElementById("withdrawFunds");
    withdrawFundsElement.onclick = function(event) {
        var inputWithdrawFundsElement = document.getElementById("inputWithdrawFunds");
        withdrawFunds(data.contractData.signer, inputWithdrawFundsElement.innerHTML).then(function(tx){
            console.log(tx);
        });
    }

    // prevent both checkboxes to be on at the same time

    var heads1CheckboxElement = document.getElementById("heads1Checkbox");
    var tails2CheckboxElement = document.getElementById("tails2Checkbox");
    heads1CheckboxElement.onclick = function(event) {
       console.log(this.checked);
       if(this.checked){
           tails2CheckboxElement.checked = false;
       }
    }
    tails2CheckboxElement.onclick = function(event) {
        console.log(this.checked);
        if(this.checked){
            heads1CheckboxElement.checked = false;
        }
     }

    var guessNumberElement = document.getElementById("guessNumber");
        guessNumberElement.onclick = function(event) {
        // hide all controls from user
        document.getElementById("bettingBox").style.display = "none";
        document.getElementById("bettingBoxProcessing").style.display = "block";

        var inputPlayElement = document.getElementById("inputPlay");
        // at least one checkbox is ON
        if (heads1CheckboxElement.checked == tails2CheckboxElement.checked){
            alert("ERROR - At least one checkbox needs to be selected");
            console.log("ERROR - At least one checkbox needs to be selected");
            return -1
        };
        // specific case
        if (heads1CheckboxElement.checked) {
            value = "1"
        } else if (tails2CheckboxElement.checked) {
            value = "2"
        }
        document.getElementById("bettingBoxProcessing").innerHTML = MSG_SIGN;
        guessTheNumber(value,inputPlayElement.innerHTML,data.contractData.signer).then(function(result){
            
            if (Object.keys(result.err).length !== 0) {
              document.getElementById("bettingBoxProcessing").style.display = "none";
              document.getElementById("bettingBox").style.display = "block";
            } else {
              document.getElementById("bettingBoxProcessing").innerHTML = MSG_PROCESSING;
            }

            console.log(result);

         });
     }
 
    
    

});
