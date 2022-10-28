import React, { useContext } from "react";

import { TransactionContext } from "../context/TransactionContext";

import { SiEthereum } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";

import useFetch from "../hooks/useFetch";
import passData from "../utils/passData";
import { shortenAddress } from "../utils/shortenAddress";
import { Loader } from ".";

const PassCard = ({ type, price, description, color }) => {
  return (
    // <div className="bg-[#181918] m-4 flex flex-1
    //   2xl:min-w-[450px]
    //   2xl:max-w-[500px]
    //   sm:min-w-[270px]
    //   sm:max-w-[300px]
    //   min-w-full
    //   flex-col p-3 rounded-md hover:shadow-2xl"
    // >
      <div className="p-5 m-1 w-24/100 flex flex-col justify-start items-center blue-glassmorphism">
            <div className={`p-3 flex justify-end items-start flex-col rounded-xl h-40 w-72 my-5 .white-glassmorphism ${color}`}>
              <div className="flex justify-between flex-col w-full h-full">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
                    <SiEthereum fontSize={21} color="#fff" />
                  </div>
                  <BsInfoCircle fontSize={17} color="#fff" />
                </div>
                <div>
                  <p className="text-white font-light text-sm">
                    {false ? shortenAddress("0x0") : <i>{description}</i>}
                  </p>
                  <p className="text-white font-semibold text-lg mt-1">
                    {type} pass
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gray-400 my-2" />
            {/*isLoading*/ false
              ? <Loader />
              : (
                <button
                type="button"
                // onClick={handleSubmit}
                className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                >
                  Buy ${price}
                </button>
              )}
          </div>
        // </div>
  );
};

const Passes = () => {
  const { transactions, currentAccount } = useContext(TransactionContext);

  return (
    // <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
    //   <div className="flex flex-col md:p-12 py-12 px-4">
    //     {currentAccount ? (
    //       <h3 className="text-white text-3xl text-center my-2">
    //         Latest Transactions
    //       </h3>
    //     ) : (
    //       <h3 className="text-white text-3xl text-center my-2">
    //         Connect your account to see the latest transactions
    //       </h3>
    //     )}

        <div className="flex flex-wrap justify-center items-center mt-10">
          <PassCard
          type="Bronze"
          price="1"
          description="One round"
          color="bronze2"
          />
          <PassCard
          type="Silver"
          price="2"
          description="One round, unlimited"
          color="silver2"
          />
          <PassCard
          type="Gold"
          price="3"
          description="All rounds"
          color="gold2"
          />
          <PassCard
          type="Diamond"
          price="5"
          description="All rounds, unlimited"
          color="emerald2"
          />
        </div>
    //   </div>
    // </div>
  );
};

export default Passes;
