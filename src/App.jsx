import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import Background from "./matrix.jpg";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  
   /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x79f97544A6965CaC01CB9Be258583E927Dff9944";
  const contractABI = abi.abi

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // call the getAllWaves method from the solidity contract

        const waves = await wavePortalContract.getAllWaves();

        // we only need address, timestamp, and message in our UI so let's pick those out

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // store our data in react state 

        setAllWaves(wavesCleaned);
        console.log("waves fetched: ", waves);
      } else {
        console.log ("Ethereum object doesn't exist")
      } 
    } catch (error) {
      console.log(error);
    }
  };

  //listening for emitter events

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [ 
        ...prevState,
        {
          address: from, 
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  /*const refreshPage = ()=>{
    *  window.location.reload();
    *   window.location.reload();
    *  } 
    * replaced with onNewWave state change to update webpage
  */

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

          getAllWaves(); 
          

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const showWaveCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
      
        alert("The Total Wave Count is" + " " + count.toNumber());
       
      } else {
        console.log ("Something went wrong at line 105");
      }

      // refreshPage();

    } catch (error) {
      console.log(error)
    }
  }
  
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error)
    }
  }
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        /*
        *  the actual wave from your smart contract
        */
        const waveMessage = prompt("Please enter in your message to be sent");
        const waveTxn = await wavePortalContract.wave(waveMessage); // , { gaslimit: 800000}); override gass error from metamask

        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        //refreshPage();
        alert("Please wait 30 seconds before waving again");

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  

  return (
    <div style={{ backgroundImage: `url(${Background})` }}>
    <div className="mainContainer">
    
      <div className="dataContainer">
        <div className="header">
        👋 Waves!
        </div>
        
        
        <div className="bio">
          I am Jack and am learning web3 development. Connect your Ethereum wallet (Rinkeby Testnet) and wave at me with a message forever stored on the blockchain! 
         
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}


        <button className="waveButton" onClick={showWaveCount}>
          Total Number of Waves
        </button>
        
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "Lightgreen", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  </div>
  );
}

export default App