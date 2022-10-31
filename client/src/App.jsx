import React, { useContext } from "react";

import { Navbar, Welcome, Footer, Services, Transactions, WelcomeUser } from "./components";
import { TransactionContext } from "./context/TransactionContext";

const App = () => {
  const { userNFT } = useContext(TransactionContext);
  return(
  <div className="min-h-screen gradient-bg-welcome5">
    <div>
      <Navbar />
      {/* Si tiene NFT WelcomeUser sino Welcome */
        userNFT ? <WelcomeUser /> : <Welcome />
      }
    </div>
    {/* <Services />
    <Transactions /> */}
    <Footer />
  </div>
  )
};

export default App;
