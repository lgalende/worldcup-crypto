import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const [userNFT, setUserNFT] = useState("");

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

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
        const transactionsContract = createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();

        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

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
        const transactionsContract = createEthereumContract();
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

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

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
      if(ethereum) {
        const transactionsContract = createEthereumContract();

        // await checkIfWalletIsConnect();

        // FIXME: is discount necessary here? Or amount should have it already applied?
        // const discount = await transactionsContract.getDiscount(currentAccount);
        // await discount.wait();

        // FIXME: _amount * (1 - discount)
        const parsedAmount = ethers.utils.parseEther(_amount);

        const passId = await transactionsContract
          .mintPass(parsePassType(_passType), {value: parsedAmount._hex});
        // TODO: ipfs
        
        setIsLoading(true);
        await passId.wait();
        console.log("NFT created with id: " + passId);
        setIsLoading(false);

        getCurrentUserNft(currentAccount);

        window.location.reload();
      } 
    } catch (error) {
      console.log(error);
      console.log(currentAccount);
      throw new Error("Minting failed");
    } 
  };

  const getCurrentUserNft = async (_addr) => {
    try {
      if(ethereum) {
        const transactionsContract = createEthereumContract();
        const pass = await transactionsContract.getPlayerPass(_addr);
        // await pass.wait();
        console.log(pass[0] + " " + pass[1]);
        if(pass[1] !== 0) {
          setUserNFT({passType: pass[0], id: pass[1]});
        }
        else {
          setUserNFT("");
        }
      } 
    } catch (error) {
      console.log(error);
      setUserNFT("");
      console.log("No ethereum object");
    } 
  };

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
  useEffect(() => {
    checkIfWalletIsConnect();
    // checkIfTransactionsExists();
  }, [transactionCount]);

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
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
