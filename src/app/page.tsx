"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import axios from "axios";
import '@rainbow-me/rainbowkit/styles.css';
import { HttpClient } from './http-client/HttpClient';
import { CoingeckoApi } from './Coingecko-API/coingecko-API';
const httpClient = new HttpClient('http://localhost:3000');
import { BLOCKCHAIN_NAME } from "rubic-sdk";
import { ethers } from 'ethers';
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import { DropdownMenu, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import calculateTrades from './Ai-Routing/Trades'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Input } from "../components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const imageArray = [
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/symbiosis.png',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/lifuel.png',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/lifi.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/optimism-gateway.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/cbridge.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/avalanche-bridge.svg'
]
// type BLOCKCHAIN_NAME = {
//   ETHEREUM: string;
//   POLYGON: string;
//   // Add other blockchain names as needed
// };
interface ProviderData {
  id: number;
  name: string;
  // Add other properties as needed
}
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
  interface CoinData {
    chains: Array<Chain>; // Define the structure of chains if it's an array of objects
    // Other properties...
  }
}
interface Chain {
  id: string;
  name: string;
  logoURI: string;
  // Define other properties of the Chain if needed
}
interface IWalletProvider {
  [key: string]: { crossChain?: string; onChain?: string };
  // Add other properties or constraints as needed
}

// Update the CoinData interface using Chain type
interface CoinData {
  chains?: Chain[]; // Array of objects conforming to the Chain interface
  // Other properties...
}
interface Token {
  name: string;
  image: string;
}

export default function Home() {

  const [isBalance, setIsBalance] = useState(false);

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: ""
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: ""
  })
  const { isConnected, address } = useAccount();
  const [showAccordion1, setShowAccordion1] = useState(false);
  const [showAccordion2, setShowAccordion2] = useState(false);
  const [coinData, setCoinData] = useState<CoinData>({ chains: [] });
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [selectedToken2, setSelectedToken2] = useState<Token | null>(null);
  const [value, setValue] = useState<any[]>([]);
  const [walletClicked, setWalletClicked] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [providerArray, setProviderArray] = useState<any[]>([]);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
  const fromTokenAddress = '0x0000000000000000000000000000000000000000';
  const toBlockchain = BLOCKCHAIN_NAME.POLYGON;
  const toTokenAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  const fromAmount = 1;


  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await axios.get(
          "https://li.quest/v1/chains"
        );
        setCoinData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCoinData();
  }, []);

  async function fetchTrades() {
    try {
      const result = await calculateTrades(fromBlockchain, fromTokenAddress, toBlockchain, toTokenAddress, fromAmount);
      setProviderArray(result)
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  }

  const RequiredBalance = async (tokenAddress: string, forAmount: number, setWalletClicked: (value: boolean) => void, setIsBalance: (value: boolean) => void) => {
    setWalletClicked(true);
    try {
      const ERC20_ABI = [
        {
          "constant": true,
          "inputs": [{ "name": "_owner", "type": "address" }],
          "name": "balanceOf",
          "outputs": [{ "name": "balance", "type": "uint256" }],
          "type": "function"
        }
      ];

      if (!provider) {
        console.error('Ethereum provider not found.');
        return;
      }

      const signer = provider.getSigner();
      const account = await signer.getAddress();

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const balance = await tokenContract.balanceOf(account);

      const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
      debugger;
      if (parseFloat(formattedBalance) >= forAmount) {
        setIsBalance(true);
      } else {
        setIsBalance(false);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      setIsBalance(false);
    }
  };

  useEffect(() => {
    async function loadEthereumProvider() {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = ethProvider.getSigner();
          const acc = await signer.getAddress();
          setProvider(ethProvider);
          setAccount(acc);
        } catch (error) {
          console.error('Error loading Ethereum provider:', error);
        }
      } else {
        console.error('Ethereum provider (window.ethereum) not found.');
        // Handle the case when window.ethereum is undefined or not available
      }
    }

    loadEthereumProvider();
  }, []);

  const handleNetworkRender = async (tokenName: any, type: any) => {
    // const {isConnected}=useAccount();
    // https://tokens.rubic.exchange/api/v1/tokens/?page=1&pageSize=200&network=polygon
    try {
      const res = await axios.get(
        `https://tokens.rubic.exchange/api/v1/tokens/?page=1&pageSize=200&network=${tokenName}`
      );
      if (type === "from") {
        setFromData({ ...fromData, token: tokenName });
      }
      if (type === "to") {
        setToData({ ...toData, token: tokenName });
      }
      setValue(res.data.results);
      console.log("Tokens ss", res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleTokenSelection1 = (tokenName: string, tokenImage: string) => {
    const selectedToken: Token = {
      name: tokenName,
      image: tokenImage,
    };
    setSelectedToken1(selectedToken);
    setShowAccordion1(false);
  };

  const handleTokenSelection2 = (tokenName: string, tokenImage: string) => {
    const selectedToken2: Token = {
      name: tokenName,
      image: tokenImage,
    };
    setSelectedToken2({ name: tokenName, image: tokenImage });
    setShowAccordion2(false);
  };
  const handleNetworkset = (value: any, networkValue: any) => {
    setToData({ ...toData, network: value, tokenAddress: networkValue?.address });
  }
  const handleNetworkset1 = (value: any, networkValue: any) => {
    setFromData({ ...fromData, network: value, tokenAddress: networkValue?.address });
  }


  useEffect(() => {
    if (fromData?.network) {
      const timer = setTimeout(async () => {
        try {
          const coingeckoApi = new CoingeckoApi(httpClient);
          const convertedValue: any = await coingeckoApi.convertTokenValue(fromData?.network);
          const tempValue = fromData?.network.toLowerCase()
          setConvertedAmount(convertedValue[tempValue]['usd']);
          console.log(convertedValue[tempValue]['usd']);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fromData?.network]);

  useEffect(() => {
    if (convertedAmount && toData?.network) {
      console.log("Printing the converted amount", convertedAmount);

      const timer = setTimeout(async () => {
        try {
          const coingeckoApi = new CoingeckoApi(httpClient);
          const convertedValue: any = await coingeckoApi.convertTokenValue(
            toData?.network
          );
          debugger;
          const tempValue: any = toData?.network.toLowerCase();
          const amountInUSD = fromData?.amount * convertedAmount;
          const amountInTargetToken = amountInUSD / convertedValue[tempValue]['usd'];
          console.log(amountInTargetToken);
          setToData({ ...toData, amount: amountInTargetToken })
          fetchTrades();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [convertedAmount, toData?.network]);

  useEffect(() => {
    console.log("Prinintng isBalance", isBalance);

  }, [isBalance])

  return (
    <div>
      <nav className="w-full flex justify-between items-center  bg-black py-8 px-[24px] sticky">
        <Image src="https://65809abe70b5410a08804127--fanciful-peony-4aeb4e.netlify.app/images/6361ced8050220282fb340e9_logo-dataplus-template.png" width={100} height={100} alt="nav-logo" className="h-[50px] w-[200px]" />

        <ConnectButton label={walletClicked ? isBalance ? "Insufficient Balance" : "Exchange Now" : "Connect to a Wallet"} />
      </nav>

      <div
      className="px-20 space-x-[100px]"
        style={{ display: "flex", flexDirection: "row", width: "100vw", height: "100vh", background: "#000000", color: "white", justifyContent: "center", alignItems: "center" }}
      >
        <div className="flex-cols justify-center item-center text-start px-[40px] text-2xl space-y-8 w-[800px]">
          <h3 className="text-lg">
            Welcome To
          </h3>
          <h1 className="text-5xl font-bold">
            Multimind Finance
          </h1>
          <p className="text-md">
            At Multichain Exchange, we bring together the world of blockchain and decentralized finance in a way that's innovative, seamless, and comprehensive.
          </p>
        </div>
        <div >
          <Image src="https://65809abe70b5410a08804127--fanciful-peony-4aeb4e.netlify.app/images/6362b8c632be3d1c56cdc377_image-1-hero-v1-dataplus-template.png" width={800} height={800} alt="bg" className="absolute z-1 right-40 " />
          <div
            className="glasscard border-2 border-gray-700/100 rounded-md w-[500px] h-[550px] p-6 "
          >
            <div style={{ fontSize: "20px", fontWeight: "600" }} className="w-full flex px-5 justify-between"><h1>Swap</h1> <TbRefresh /></div>
             {/* card1 */}
            <div className="flex pt-6 space-x-4 z-2">
              <div className="flex-cols border-2 border-gray-700/100 rounded-lg p-3 mt-5 h-[260px]">
                <div
                  className="flex inline-flex"
                >
                  {selectedToken1?.image ? (
                    <Image src={selectedToken1.image} alt="bt-image" width={25} height={25} className="rounded-xl mr-4 " />
                  ) : (
                    <Image
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      width={30} height={30}
                      className="rounded-xl mr-4"
                    />
                  )}
                  <span className="font-bold text-xl"> {fromData?.network ? fromData?.network : "Network"} </span>
                </div>
                <DropdownMenu >
                  <DropdownMenuTrigger asChild >
                    <Button variant="ghost" className="bg-transparent  text-white hover:bg-transparent hover:text-white" onClick={() => setShowAccordion1(!showAccordion1)}>
                      <span className="font-normal text-xl"> {fromData?.token ? fromData?.token : "Coin name"} </span>
                    </Button>
                  </DropdownMenuTrigger>
                  {showAccordion1 && coinData ? (
                    <Accordion
                      type="single"
                      collapsible className="w-full h-80 overflow-y-auto text-md no-scrollbar rounded-sm bg-[#0E111C] px-4 rounded-md mt-2 z-9 relative"
                      style={{ position: "relative", zIndex: 9 }}>
                      {coinData?.chains?.map((coin) => (
                        <AccordionItem key={coin?.id} value={coin?.id}>
                          <AccordionTrigger onClick={() => handleNetworkRender(coin?.name, 'from')}>
                            <Image src={coin?.logoURI} alt={coin?.name} width={25} height={25} className="rounded-md" />
                            {coin?.name}
                          </AccordionTrigger>
                          <AccordionContent className="text-start text-decoration list-none">
                            <li onClick={() => {

                              handleTokenSelection1(coin?.name, coin?.logoURI)
                              console.log("coin", coin);
                            }
                            }>
                              {value?.map((network: any, index: any) => (
                                <div key={index} className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm" onClick={() => handleNetworkset1(network?.name, network)}>
                                  <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full " /><span className="text-md">{network?.symbol}</span>
                                </div>
                              ))}
                            </li>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="mt-4">
                      <div className="border-2 border-gray-[600]"></div>
                      <h1 className="text-xl mt-2">You Send</h1>
                    <Input
                      type="number"
                      placeholder="Eg. 2.26366 ETH"
                      className="amount-comp text-neutral-400 w-full flex mt-5 bg-transparent text-4xl border-none focus:border-none float-right"
                      value={fromData?.amount}
                      onChange={(e) => setFromData({ ...fromData, amount: parseInt(e.target.value, 10) })}
                    />
                    </div>
                  )}
                </DropdownMenu>
            </div>
           {/* card 2 */}
           <div className="flex-cols border-2 border-gray-700/100 rounded-lg p-3 mt-5 h-[260px]">
                <div
                  className="flex inline-flex"
                >
                  {selectedToken2?.image ? (
                    <Image src={selectedToken2.image} alt="bt-image" width={25} height={25} className="rounded-xl mr-4 " />
                  ) : (
                    <Image
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      width={30} height={30}
                      className="rounded-xl mr-4"
                    />
                  )}
                  <span className="font-bold text-xl"> {fromData?.network ? fromData?.network : "Network"} </span>
                </div>
                <DropdownMenu >
                  <DropdownMenuTrigger asChild >
                    <Button variant="ghost" className="bg-transparent  text-white hover:bg-transparent hover:text-white" onClick={() => setShowAccordion2(!showAccordion2)}>
                      <span className="font-normal text-xl"> {fromData?.token ? fromData?.token : "Coin name"} </span>
                    </Button>
                  </DropdownMenuTrigger>
                  {showAccordion2 && coinData ? (
                    <Accordion
                      type="single"
                      collapsible className="w-full h-80 overflow-y-auto text-md no-scrollbar rounded-sm bg-[#0E111C] px-4 rounded-md mt-2 z-9 relative"
                      style={{ position: "relative", zIndex: 9 }}>
                      {coinData?.chains?.map((coin) => (
                        <AccordionItem key={coin?.id} value={coin?.id}>
                          <AccordionTrigger onClick={() => handleNetworkRender(coin?.name, 'from')}>
                            <Image src={coin?.logoURI} alt={coin?.name} width={25} height={25} className="rounded-md" />
                            {coin?.name}
                          </AccordionTrigger>
                          <AccordionContent className="text-start text-decoration list-none">
                            <li onClick={() => {

handleTokenSelection2(coin?.name, coin?.logoURI)
                              console.log("coin", coin);
                            }
                            }>
                              {value?.map((network: any, index: any) => (
                                <div key={index} className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm" onClick={() => handleNetworkset(network?.name, network)}>
                                  <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full " /><span className="text-md">{network?.symbol}</span>
                                </div>
                              ))}
                            </li>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="mt-4">
                      <div className="border-2 border-gray-[600]"></div>
                      <h1 className="text-xl mt-2">You Receive</h1>
                    <Input
                      type="number"
                      placeholder="Eg. 2.26366 ETH"
                      className="amount-comp text-neutral-400 w-full flex mt-5 bg-transparent text-4xl border-none focus:border-none float-right"
                      value={fromData?.amount}
                      onChange={(e) => setFromData({ ...fromData, amount: parseInt(e.target.value, 10) })}
                    />
                    </div>
                  )}
                </DropdownMenu>
            </div>
            <div className="absolute right-[220px] z-5 top-[190px]">
              <AiOutlineSwap className="text-3xl mr-3 rounded-full border-2 " />
            </div>
            </div>
            <div className="w-full flex-cols h-[100px] justify-end items-end pt-[20px]">
              <p>Available Funds = 3.2323 ETH <br/>
              1 ETH = 0.03BTC
              </p>
            <Button className="bg-blue-400 w-full px-3 py-3 text-center mt-5 text-xl">Swap</Button>
            </div>
          </div>
          {/* <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px", zIndex: 0 }} onClick={() => RequiredBalance(fromData?.tokenAddress, fromData?.amount, setWalletClicked, setIsBalance)}>
            <ConnectButton label={walletClicked ? isBalance ? "Insufficient Balance" : "Exchange Now" : "Connect Wallet"} />
          </div> */}
          {providerArray?.length > 0 && <div style={{ fontSize: "20px", width: "615px", fontWeight: "600", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", background: "#3b3d4f", padding: "15px 33px", marginLeft: "-16px", marginTop: "26px" }} className="w-full flex px-5 justify-between"><h1>AI Routing</h1> <TbRefresh /></div>}
        </div>
        {providerArray?.length > 0 && <div
          style={{ marginTop: "9vh", width: "40%", overflowX: "scroll", height: "100%", background: "#3b3d4f", padding: "15px", display: "flex", flexDirection: "column", flexWrap: "wrap", paddingTop: "10px", gap: "10px" }}
        >
          {providerArray?.map((data, index) => (
            <div
              key={index}
              style={{ background: "#222331", width: "280px", height: "90%", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px", marginTop: "10px", flex: "1 1 100px" }}
            >
              <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", borderBottom: "1px solid #ffffff38" }}>
                <div className="font-normal text-md" style={{ display: "flex", gap: "4px", alignItems: "center" }} ><Image src={imageArray[index]} alt="token" style={{ height: "30px", borderRadius: "50%" }} /> {data?.dexName} </div>
                <div style={{ fontSize: "14px", fontWeight: "400", color: "white" }}> ~{data?.tokenAmount}{" "}{data?.tokenSymbol === "USDT" ? "$" : data?.tokenSymbol} </div>
              </div>
              <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                <div className="font-normal text-md" style={{ display: "flex", gap: "4px", alignItems: "center" }}><Image src="https://app.rubic.exchange/assets/images/icons/money.svg" alt="protocol fees" style={{ height: "20px" }} /> {" "} ~{data?.protocolFee} </div>
                <div className="font-normal text-md" style={{ display: "flex", gap: "4px", alignItems: "center" }}><Image src="https://app.rubic.exchange/assets/images/icons/time.svg" alt="protocol fees" style={{ height: "17px" }} /> {" "} 3M </div>
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
