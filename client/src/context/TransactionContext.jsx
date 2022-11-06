import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from 'web3modal';
// import Portis from "@portis/web3";

import { contractABI, contractAddress, usdcAddress, erc20ABI, derc20Address } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

// const providerOptions = {
//   portis: {
//     package: Portis, // required
//     options: {
//       id: "8e23465f-c9a7-410a-92df-18b2e3d1c38f",
//       network: "maticMumbai"
//     }
//   }
// };

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const [userNFT, setUserNFT] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [usdcContract, setUsdcContract] = useState(null);

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };


  //* Reset web3 onboarding modal params
  useEffect(() => {
    const resetParams = async () => {
      // const currentStep = await GetParams();

      // setStep(currentStep.step);
      // setUserNFT();
    };

    resetParams();

    window?.ethereum?.on('chainChanged', () => getCurrentUserNft());
    window?.ethereum?.on('accountsChanged', () => getCurrentUserNft());
  }, []);

  //* Set the wallet address to the state
  const updateCurrentWalletAddress = async () => {
    if (!ethereum) return alert("Please install metamask.");
    const accounts = await window?.ethereum?.request({ method: 'eth_requestAccounts' });

    if (accounts) setCurrentAccount(accounts[0]);
  };

  useEffect(() => {
    updateCurrentWalletAddress();

    window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);
  }, );

  useEffect(() => {
    const connectPolygon = async () => {
      console.log(ethereum.chainId);
      // testnet mumbai '0x13881'
      // polygon mainnet '0x89'
      if(ethereum.chainId !== '0x89') { // fixme: change for mainnet
        try {
          await window?.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                  chainId: '0x89', 
                  chainName:'Polygon',
                  rpcUrls:['https://polygon-rpc.com/'],                   
                  blockExplorerUrls:['https://polygonscan.com/'],  
                  nativeCurrency: { 
                    symbol:'MATIC',   
                    decimals: 18
                  }     
                }
            ]
          });
        } 
        catch (err) {
          console.log(err);
        }
      }
    };

    connectPolygon();
    window?.ethereum?.on('chainChanged', () => connectPolygon());
  }, []);
  
  //* Set the smart contract and provider to the state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      const signer = newProvider.getSigner();
      const newContract = new ethers.Contract(contractAddress, contractABI, signer);
      const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, signer);  // fixme: usdc address

      setProvider(newProvider);
      setContract(newContract);
      setUsdcContract(usdcContract);
    };

    setSmartContractAndProvider();
  }, []);

  const getAllTransactions = async () => {
    try {
      if (ethereum) { // TODO: CHANGE ETHEREUM FOR POLYGON EVERYWHERE !!!
        const availableTransactions = await contract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getCurrentUserNft(accounts[0]);
        // getAllTransactions();
      } else {
        setCurrentAccount("");
        setUserNFT("");
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const currentTransactionCount = await contract.getTransactionCount();

        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  // same as updateCurrentWalletAddress
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      // getCurrentUserNft(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await contract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await contract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const mintPass = async (_passType, _amount) => {
    try {
      if(/*ethereum*/ contract) {
        // await checkIfWalletIsConnect();

        const usdcDecimals = 10 ** 6;  // fixme 6 for usdc
        const parsedAmount = BigInt(_amount * usdcDecimals); // usdc has 6 decimals
        const approve = await usdcContract.approve(contractAddress, parsedAmount);
        
        setIsLoading(true);
        
        await approve.wait();

        const pass = await contract.mintPass(parsePassType(_passType));

        await pass.wait();
        
        // const id = Number(pass[1]);

        console.log("NFT created");
        
        // setUserNFT({passType: pass[0], id: id});
        
        setIsLoading(false);

        alert("Wait a few seconds and refresh the page to see your PASS");

        // window.location.reload();
      } 
      else {
        alert("Please wait a few seconds and refresh the page");
        console.log("No contract object");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      console.log(currentAccount);
      throw new Error("Minting failed");
    } 
  };

  const getCurrentUserNft = async (/*_addr*/) => {
    try {
      if(/*ethereum*/ contract) {
        const pass = await contract.getPlayerPass(currentAccount);
        // await pass.wait();
        const id = Number(pass[1]);
        console.log(pass[0] + " " + pass[1]);
        
        if(id > 0) {
          setUserNFT({passType: pass[0], id: id});
        }
        else {
          // setUserNFT("");
          // setUserNFT({passType: 0, id: 0});
        }
      }
    } catch (error) {
      console.log(error);
      setUserNFT("");
      console.log("No contract or no pass");
    } 
  };

  useEffect(() => {
    getCurrentUserNft();
  }, [contract, currentAccount]);

  function parsePassType(_passType) {
    switch(_passType) {
      case "Bronze":
        return 0;
      case "Silver":
        return 1;
      case "Gold":
        return 2;
      case "Diamond":
        return 3;
      default:
        throw new Error("Invalid pass type");
    }
  };

  // at the start of the app
  // useEffect(() => {
  //   checkIfWalletIsConnect();
  //   // checkIfTransactionsExists();
  // }, [transactionCount]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: 'failure',
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  return (
    <TransactionContext.Provider
      // all this data will be available in all components since we put this tag in App.jsx
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
        userNFT,
        mintPass,
        getCurrentUserNft,
        errorMessage,
        updateCurrentWalletAddress,
        contract,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
