import React, { useContext } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { FaExternalLinkAlt } from "react-icons/fa";

import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";

import logo from "../../images/4.png";

const NavBarItem = ({ title, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);
  const { currentAccount, connectWallet, updateCurrentWalletAddress } = useContext(TransactionContext);

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
      <div className="md:flex-[0.7] flex-initial justify-center items-center">
        <img src={logo} alt="logo" className="w-36 cursor-pointer" />
      </div>
      <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
        {/* {["Home", "My predictions", "How it works?"].map((item, index) => (
          <NavBarItem key={item + index} title={item} />
        ))} */}

        <li>
          <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://worldcups-organization.gitbook.io/world-cup-crypto/v/english/', '_blank', 'noopener,noreferrer');
                }}
              className="flex flex-row justify-center items-center my-5 blue-glassmorphism p-2  cursor-pointer hover:bg-[#672446]"
            >
              <FaExternalLinkAlt className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Whitepaper
              </p>
            </button>
        </li>
        <li>
          {!currentAccount ? 
              <button
                type="button"
                onClick={updateCurrentWalletAddress}
                className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
              >
                {/* <AiFillPlayCircle className="text-white mr-2" /> */}
                <p className="text-white text-base font-semibold">
                  Connect Wallet
                </p>
              </button>
              : 
              <div className="bg-[#2952e3] py-2 px-7 mx-4 rounded-full">
                {shortenAddress(currentAccount)}
              </div>
            }
        </li>
      </ul>
      <div className="flex relative">
        {!toggleMenu && (
          <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
        )}
        {toggleMenu && (
          <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
        )}
        {toggleMenu && (
          <ul
            className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in"
          >
            <li className="text-xl w-full my-2"><AiOutlineClose onClick={() => setToggleMenu(false)} /></li>
            <li>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://worldcups-organization.gitbook.io/world-cup-crypto/v/english/', '_blank', 'noopener,noreferrer');
                }}
              className="flex flex-row justify-center items-center my-5 blue-glassmorphism p-2  cursor-pointer hover:bg-[#672446]"
            >
              <FaExternalLinkAlt className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Whitepaper
              </p>
            </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
