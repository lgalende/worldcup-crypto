import React, { useContext } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { FaTrophy } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import { IoMdFootball } from "react-icons/io";
import { SiFifa } from "react-icons/si";
import {GiSoccerKick} from "react-icons/gi";

import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress, parsePass, passColor } from "../utils/shortenAddress";
import { Loader, Passes, Accordion, Tabs } from ".";

const companyCommonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.0001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
  />
);

const WelcomeUser = () => {
  const { currentAccount, userNFT } = useContext(TransactionContext);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-1 justify-start items-start flex-col mf:mr-20">
          {/* <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Let's make some predictions!
          </h1> */}
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            A few days before the<br/>cup begins you will<br/>be able to start making predictions!
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base text-l sm:text-xl">
            <i> Make Qatar 2022 matches even more exciting with World Cup Crypto. </i>
          </p>
        </div>

        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
          <h1 className="text-3xl sm:text-5xl text-white py-1">
            My Pass
          </h1>
          <div className={`p-3 flex justify-end items-start flex-col rounded-xl h-48 sm:w-80 w-full my-5 mb-1 .white-glassmorphism ${passColor(userNFT.passType)}`}>
            <div className="flex justify-between flex-col w-full h-full">
            <div className="flex justify-between items-start mr-1 mt-2">
                  {/* <div className="w-12 h-12 rounded-full border-2 border-white flex justify-center items-center"> */}
                    <GiSoccerKick fontSize={46} color="#fff" className="mt-1"/>
                  {/* </div> */}
                  <SiFifa fontSize={44} color="#fff" />
                </div>
              <div>
                <p className="text-white font-light text-md">
                  {shortenAddress(currentAccount)}
                </p>
                <p className="text-white font-semibold text-lg mt-1">
                  {parsePass(userNFT.passType)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end w-80">
          <div className="p-1 sm:w-16 w-full flex flex-col justify-start items-center red-glassmorphism">
            {/* <div className="h-[1px] w-full bg-gray-400 my-2" /> */}
            BURN
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeUser;
