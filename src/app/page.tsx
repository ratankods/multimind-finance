"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

import '@rainbow-me/rainbowkit/styles.css';
import { Button } from "@/components/ui/button";
import { BLOCKCHAIN_NAME } from "rubic-sdk";
import { ethers } from 'ethers';
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import CircleImage from '@/app/CircleImage.svg'
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import CalculateTokenPrice from "./Ai-Routing/GetPrice";
import calculateTrades from './Ai-Routing/Trades' 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";
import MobileHome from "./mobileMUltiMind";


declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider; 
  }
  interface CoinData {
    chains: Array<Chain>; 
  }
}
interface Chain {
  id: string;
  name: string;
  logoURI: string;
}
interface IWalletProvider {
  [key: string]: { crossChain?: string; onChain?: string };
}

interface CoinData {
  [x: string]: any;
  chains?: Chain[]; 
}
interface Token {
  name: string;
  image: string;
}

export default function Home() {
  
  const [isBalance,setIsBalance] = useState(false);

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol:""
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol:""
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
        const temp = response?.data?.chains?.filter((res:any)=> res?.name === "Ethereum" || res?.name === "Optimism" || res?.name === "Polygon" || res?.name === "Avalanche")
        setCoinData(temp);
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

  function getBlockchainName(networkName: any) {
    switch (networkName.toLowerCase()) {
      case "ethereum":
        return BLOCKCHAIN_NAME.ETHEREUM;
      case "polygon":
        return BLOCKCHAIN_NAME.POLYGON;
      case "optimism":
        return BLOCKCHAIN_NAME.OPTIMISM;
      case "avalanche":
        return BLOCKCHAIN_NAME.AVALANCHE;
      default:
        throw new Error(`Unsupported network: ${networkName}`);
    }
  }

  const calculateToAmount = async () => {
    try {
      const blockchainFrom = getBlockchainName(fromData.token);
      const blockchainTo = getBlockchainName(toData.token);

      const USDPriceFromToken = await CalculateTokenPrice(
        fromData.tokenAddress,
        blockchainFrom
      );
      console.log("USD PRICE for TOKEN1 ",USDPriceFromToken)
      const USDPriceToToken = await CalculateTokenPrice(
        toData.tokenAddress,
        blockchainTo
        );
        console.log("USD PRICE for TOKEN1 ",USDPriceToToken)

      const amountInUSD = fromData.amount * USDPriceFromToken.toNumber();
      const toAmount = amountInUSD / USDPriceToToken.toNumber();
      console.log(toAmount);

      setToData({ ...toData, amount: toAmount });
    } catch (error) {
      console.error("Error in calculating toToken amount:", error);
    }
  };

  useEffect(() => {
    if (fromData.tokenAddress && toData.tokenAddress && fromData.amount) {
      calculateToAmount();
    }
  }, [fromData.tokenAddress, toData.tokenAddress, fromData.amount]);
  
  const RequiredBalance = async (tokenAddress: string, forAmount: number, setWalletClicked: (value: boolean) => void, setIsBalance: (value: boolean) => void) => {
    setWalletClicked(true);
    try {
      const ERC20_ABI = [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
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
  const handleNetworkset=(value:any, networkValue:any,networkSymbol:any )=>{  
    setToData({ ...toData, network: value,  tokenAddress: networkValue?.address, tokenSymbol:networkSymbol });
  }
  const handleNetworkset1=(value:any, networkValue:any,networkSymbol:any )=>{
    setFromData({ ...fromData, network: value, tokenAddress:networkValue?.address,tokenSymbol:networkSymbol });
  }


  // useEffect(() => {
  //   if(fromData?.network){
  //     const timer = setTimeout(async () => {
  //       try {
  //         const coingeckoApi = new CoingeckoApi(httpClient);
  //         const convertedValue:any = await coingeckoApi.convertTokenValue(fromData?.network);
  //         const tempValue = fromData?.network.toLowerCase()
  //         setConvertedAmount(convertedValue[tempValue]['usd']);
  //         console.log(convertedValue[tempValue]['usd']);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     }, 3000);
  
  //     return () => clearTimeout(timer);
  //   }
  // }, [ fromData?.network ]);

  // useEffect(() => {
  //   if (convertedAmount && toData?.network) {
  //     console.log("Printing the converted amount", convertedAmount);

  //     const timer = setTimeout(async () => {
  //       try {
  //         const coingeckoApi = new CoingeckoApi(httpClient);
  //         const convertedValue: any = await coingeckoApi.convertTokenValue(
  //           toData?.network
  //         );
  //         const tempValue: any  = toData?.network.toLowerCase();
  //         const amountInUSD = fromData?.amount * convertedAmount;
  //         const amountInTargetToken = amountInUSD / convertedValue[tempValue]['usd'];
  //         console.log(amountInTargetToken);
  //         setToData({...toData,amount:amountInTargetToken})
  //         fetchTrades();
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [convertedAmount, toData?.network ]);



  return (
    <>
    <div className="webView z-[10]">
      <div
        style={{ display: "flex", flexDirection:"column", color: "white", backgroundColor: "#0E111C", alignItems:"center",height:"100vh" }}
      >
        <div
          style={{ marginTop: "6vh", width: "50%", background: "#18181B", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", paddingTop:"10px", height:"55vh", zIndex: "10" }}
        >
          <div style={{ fontSize: "20px", fontWeight: "600" }} className="w-full flex px-5 py-4  justify-between"><h1>MultiMind Finance</h1> <TbRefresh /></div>
          <div className="border-[1px] border-[#27272A]"></div>
          <div>
          <div
            style={{ background: "#18181B", height: "90%", width: "100%", borderRadius: "24px", display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap:'wrap', padding: "20px", alignItems: "center", marginTop:"4px" }}
          >
            <div
              style={{ width: "45%", height:"180px", borderRadius: "24px", padding: "20px",gap:"11px",background:"#27272A",border: "1px solid var(--Dark-70, #3F3F46)", display:"flex",flexDirection:"column",justifyContent:"center" }}
            >
              <div style={{height:"40%",display:"flex",flexDirection:"row",alignItems:"center",gap:"22px"}}>
                <Button variant="ghost" className="bg-transparent text-white hover:bg-transparent hover:text-white w-[29%] h-[137px] space-x-2" onClick={() => setShowAccordion1(!showAccordion1)}>
                      {selectedToken1?.image ? (
                        <div className="relative">
                        <img src={selectedToken1?.image} alt="bt-image" style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}/>
                        <img src={fromData?.tokenSymbol} alt="bt-image"  style={{width:"30px",height:"30px", maxWidth:"30px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}/>
                        </div>
                      ) : (
                        <div className="" style={{display:"flex",flexDirection:"column"}}>
                          <img
                          src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                          alt="bt-image"
                          style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}
                        />
                        <img
                          src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                          alt="bt-image"
                          style={{width:"35px",height:"35px", maxWidth:"35px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}
                        />
                        </div>
                        
                      )}
                    </Button>
                      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",marginTop:"-15px"}}>
                        <span className="font-bold text-lg"> {fromData?.token ? fromData?.token : "Coin name"} </span>
                        <span className="font-normal text-xl text-[#52525B]"> {fromData?.network ? fromData?.network : "Network name"} </span>
                        </div>
              </div>
                {showAccordion1 && coinData && (
                  <Accordion 
                    type="single"
                    collapsible className="w-full h-80 overflow-y-auto text-md no-scrollbar  bg-[#27272A] px-4 rounded-md mt-2 z-9 absolute"
                    style={{ position:"absolute",width:"280px",marginTop:"400px",  zIndex:9 }}>
                    {coinData?.map((coin:any) => (
                      <AccordionItem key={coin?.id} value={coin?.id}>
                        <AccordionTrigger onClick={()=>handleNetworkRender(coin?.name,'from')}>
                          <Image src={coin?.logoURI} alt={coin?.name} width={25} height={25} className="rounded-md"/>
                          {coin?.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-start text-decoration list-none">
                        <li onClick={() => {
                          
                              handleTokenSelection1(coin?.name, coin?.logoURI)
                              console.log("coin",coin);
                              }
                            }>
                            {value?.map((network:any,index:any)=>(
                                <div key={index} className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm" onClick={()=>handleNetworkset1(network?.name,network,network?.image)}>
                                  <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full "/><span className="text-md">{network?.symbol}</span>
                                </div>
                            ))}
                          </li>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>)}
                  
                  <input
                    type="number"
                    placeholder="Enter an Amount"
                    className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px]"
                    value={fromData?.amount}
                    onChange={(e)=>setFromData({ ...fromData, amount:parseFloat(e.target.value) })}
                  />
            </div>

            <div style={{display:"flex",flexDirection:"row",gap:"2px"}}>
              <Image src={CircleImage} alt="arrow" width={50} height={50} className="rounded-full mt-2" />
              {/* <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " /> */}
            </div>

            <div
            style={{ width: "45%", height:"180px", borderRadius: "24px", padding: "20px",gap:"11px",background:"#27272A",border: "1px solid var(--Dark-70, #3F3F46)", display:"flex",flexDirection:"column",justifyContent:"center" }}
            >
            <div
            style={{height:"40%",display:"flex",flexDirection:"row",alignItems:"center",gap:"22px"}}
            >
              <Button variant="ghost" className="w-[29%] h-[137px] bg-transparent text-white hover:bg-transparent hover:text-white" onClick={() => setShowAccordion2(!showAccordion2)}>
                    {selectedToken2?.image ? (
                      <div className="relative">
                      <img src={selectedToken2?.image} alt="bt-image" style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}/>
                      <img src={toData?.tokenSymbol} alt="bt-image"  style={{width:"30px",height:"30px", maxWidth:"30px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}/>
                      </div>
                    ) : (
                      <div className="relative ">
                        <img
                        src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                        alt="bt-image"
                        style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}
                      />
                      <img
                        src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                        alt="bt-image"
                        style={{width:"35px",height:"35px", maxWidth:"35px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}
                      />
                      </div>
                    )}
                  </Button>
                  <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",marginTop:"-15px"}}>
                      <span className="font-normal text-md"> {toData?.token ? toData?.token : "Coin name"} </span>
                      <span className="font-bold text-lg"> {toData?.network ? toData?.network :  "Network name"} </span>
                    </div>
            </div>
                {showAccordion2 && coinData && (
                  <Accordion type="single" collapsible className="w-full h-80 overflow-y-auto text-md no-scrollbar bg-[#27272A] px-4 rounded-md  z-9 relative"style={{ position:"absolute",width:"280px", marginTop:"430px",  zIndex:9 }}>
                    {coinData?.map((coin:any) => (
                      <AccordionItem key={coin?.id} value={coin?.id}>
                        <AccordionTrigger onClick={()=>handleNetworkRender(coin?.name,'to')}>
                          <Image src={coin?.logoURI} alt={coin?.name} width={25} height={25} className="rounded-md"/>
                          {coin?.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-start text-decoration list-none">
                          <li onClick={() => handleTokenSelection2(coin?.name, coin?.logoURI)}>
                            {value?.map((network:any,index:any)=>(
                                <div key={index} className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm" onClick={()=>handleNetworkset(network?.name,network,network?.image)}>
                                  <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full "/><span className="text-md">{network?.symbol}</span>
                                </div>
                            ))}
                          </li>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )} 
                  <input
                  disabled
                  type="number"
                  placeholder="Enter an Amount"
                  className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px]"
                  value={toData?.amount}
                />
            </div>
            
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px", zIndex:0 }} onClick={() => RequiredBalance(fromData?.tokenAddress, fromData?.amount, setWalletClicked, setIsBalance)}>
            {/* <ConnectButton label={ walletClicked ? isBalance ? "Insufficient Balance": "Exchange Now" : "Connect Wallet"} />   */}
            <Button style={{
              background: "linear-gradient(92deg, #FF7438 27.61%, #FF9F76 123.51%)",
              boxShadow: "16px 11px 50.9px 0px rgba(255, 127, 73, 0.35)"}} className="w-full px-2 py-6 rounded-lg text-white">Connect Button</Button>
          </div>
          </div>
        </div>
        { providerArray?.length > 0 && <div style={{ fontSize: "20px",  width: "50%",fontWeight: "600",borderTopLeftRadius: "20px",borderTopRightRadius: "20px", background: "#3b3d4f",padding: "15px 33px",marginTop:"26px", zIndex: "10" }} className="w-full flex px-5 justify-between"><h1>AI Routing</h1> <TbRefresh /></div>}
        {providerArray?.length > 0 && <div
          style={{ width: "50%", overflowX:"scroll", height: "200px", background: "#3b3d4f", padding: "15px", display: "flex", flexDirection: "row",  paddingTop:"10px", gap:"10px", zIndex: "10" }}
        >
          {providerArray?.map((data, index) => (
            <div key={index}>
              <RouteCard data={data} index={index} />
          </div>
          ))}
        </div>}
      </div>
    </div>
    <div className="mobileView">
      <MobileHome/>
    </div>
    </>
  );
}