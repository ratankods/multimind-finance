"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

import "@rainbow-me/rainbowkit/styles.css";
import { Button } from "@/components/ui/button";
import { BLOCKCHAIN_NAME } from "rubic-sdk";
import { ethers } from "ethers";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import CircleImage from "@/app/CircleImage.svg";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckBalance } from "./Ai-Routing/checkbalance";
// import CalculateTokenPrice from "./Ai-Routing/GetPrice";
import calculateTrades from "./Ai-Routing/Trades";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { Input } from "@/components/ui/input";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";
import MobileHome from "./mobileMUltiMind";
import DialogModal from "@/components/dialogModal";

type MyBlockchainName = "ETHEREUM" | "POLYGON" | "AVALANCHE" | "SOLANA";

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
  const [isBalance, setIsBalance] = useState(false);

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice: "",
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice: "",
  });
  const { isConnected, address } = useAccount();
  const [showAccordion1, setShowAccordion1] = useState(false);
  const [showAccordion2, setShowAccordion2] = useState(false);
  const [coinData, setCoinData] = useState<CoinData>({ chains: [] });
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [selectedToken2, setSelectedToken2] = useState<Token | null>(null);
  const [value, setValue] = useState<any[]>([]);
  const [walletClicked, setWalletClicked] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [openDilog, setOpenDilog] = useState(false);
  const [providerArray, setProviderArray] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await axios.get("https://li.quest/v1/chains");
        const temp = response?.data?.chains?.filter(
          (res: any) =>
            res?.name === "Ethereum" ||
            res?.name === "Polygon" ||
            res?.name === "Avalanche"
        );
        const solanaobj = {
          id: 1399811149,
          name: "solana",
          logoURI:
            "https://app.rubic.exchange/assets/images/icons/coins/solana.svg",
        };
        temp.push(solanaobj);
        setCoinData(temp);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCoinData();
  }, []);

  async function fetchTrades() {
    try {
      debugger;
      console.log("fromData in fetchTrades", typeof fromData.token);
      console.log("toData in fetchTrades", typeof toData.token);
      const blockchainFrom = fromData.token.toUpperCase() as MyBlockchainName;
      const blockchainTo = toData.token.toUpperCase() as MyBlockchainName;
      console.log(blockchainFrom);
      console.log(blockchainTo);
      const result = await calculateTrades(
        blockchainFrom,
        fromData.tokenAddress,
        blockchainTo,
        toData.tokenAddress,
        fromData.amount
      );
      setProviderArray(result);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  }

  const calculateToAmount = async () => {
    try {
      let USDPriceFromToken: any = fromData.usdprice;
      let USDPriceToToken: any = toData.usdprice;

      const amountInUSD: any = fromData.amount * USDPriceFromToken;
      const toAmount = amountInUSD / USDPriceToToken;

      setToData({ ...toData, amount: toAmount });
      fetchTrades();
    } catch (error) {
      console.error("Error in calculating toToken amount:", error);
    }
  };

  useEffect(() => {
    if (fromData.tokenAddress && toData.tokenAddress && fromData.amount) {
      calculateToAmount();
    }
  }, [fromData.tokenAddress, toData.tokenAddress, fromData.amount]);

  const handleNetworkRender = async (tokenName: any, type: any) => {
    debugger;
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validNumber = new RegExp(/^\d*\.?\d*$/);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    const amount = e.target.value;

    if (validNumber.test(amount)) {
      setFromData({ ...fromData, amount: Number(amount) });
    } else {
      // If the input is not a valid number, revert to the last valid value
      e.target.value = fromData.amount.toString();
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
  const handleNetworkset = (
    value: any,
    networkValue: any,
    networkSymbol: any
  ) => {
    setToData({
      ...toData,
      network: value,
      tokenAddress: networkValue?.address,
      tokenSymbol: networkSymbol,
      usdprice: networkValue.usdPrice,
    });
  };
  const handleNetworkset1 = (
    value: any,
    networkValue: any,
    networkSymbol: any
  ) => {
    setFromData({
      ...fromData,
      network: value,
      tokenAddress: networkValue?.address,
      tokenSymbol: networkSymbol,
      usdprice: networkValue.usdPrice,
    });
  };
  return (
    <>
      <div className="webView z-[10]">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "white",
            alignItems: "center",
            height: "100vh",
          }}
          className="bgImg"
        >
          <nav className="flex w-full justify-start items-start">
            <Image src="/MUFI.png" width={100} height={100} alt="navicon" className="pl-4 ml-5 mt-2 object-cover" />
            {/* <button></button> */}
          </nav>
          <div
            style={{
              marginTop: "6vh",
              width: "50%",
              background: "#18181B",
              borderRadius: "20px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              height: "55vh",
              zIndex: "10",
            }}
          >
            <div
              style={{ fontSize: "20px", fontWeight: "600" }}
              className="w-full flex px-5 py-4  justify-between"
            >
              <h1>MultiMind Finance</h1> <TbRefresh />
            </div>
            <div className="border-[1px] border-[#27272A]"></div>
            <div>
              <div
                style={{
                  background: "#18181B",
                  height: "90%",
                  width: "100%",
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  padding: "20px",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: "45%",
                    height: "180px",
                    borderRadius: "24px",
                    padding: "20px",
                    gap: "11px",
                    background: "#27272A",
                    border: "1px solid var(--Dark-70, #3F3F46)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      height: "40%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "22px",
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="bg-transparent text-white hover:bg-transparent hover:text-white w-[29%] h-[137px] space-x-2"
                      onClick={() => setShowAccordion1(!showAccordion1)}
                    >
                      {selectedToken1?.image ? (
                        <div className="relative">
                          <img
                            src={selectedToken1?.image}
                            alt="bt-image"
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <img
                            src={fromData?.tokenSymbol}
                            alt="bt-image"
                            style={{
                              width: "30px",
                              height: "30px",
                              maxWidth: "30px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className=""
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <img
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <img
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            style={{
                              width: "35px",
                              height: "35px",
                              maxWidth: "35px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      )}
                    </Button>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "-15px",
                      }}
                    >
                      <span className="font-bold text-lg">
                        {" "}
                        {fromData?.token ? fromData?.token : "Coin name"}{" "}
                      </span>
                      <span className="font-normal text-xl text-[#52525B]">
                        {" "}
                        {fromData?.network
                          ? fromData?.network
                          : "Network name"}{" "}
                      </span>
                    </div>
                  </div>
                  {showAccordion1 && coinData && (
                    <DialogModal
                      coinData={coinData}
                      handleNetworkset={handleNetworkset1}
                      value={value}
                      handleNetworkRender={handleNetworkRender}
                      handleTokenSelection={handleTokenSelection1}
                      type={'from'}
                      // setShowAccord={setShowAccordion1}
                    />
                  )}
                  <input
                    type="number"
                    placeholder="Enter an Amount"
                    className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px] inputclass"
                    value={fromData.amount}
                    step="0.01"
                    onInput={handleInput}
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "row", gap: "2px" }}
                >
                  <Image
                    src={CircleImage}
                    alt="arrow"
                    width={50}
                    height={50}
                    className="rounded-full mt-2"
                  />
                  {/* <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " /> */}
                </div>

                <div
                  style={{
                    width: "45%",
                    height: "180px",
                    borderRadius: "24px",
                    padding: "20px",
                    gap: "11px",
                    background: "#27272A",
                    border: "1px solid var(--Dark-70, #3F3F46)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      height: "40%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "22px",
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-[29%] h-[137px] bg-transparent text-white hover:bg-transparent hover:text-white"
                      onClick={() => setShowAccordion2(!showAccordion2)}
                    >
                      {selectedToken2?.image ? (
                        <div className="relative">
                          <img
                            src={selectedToken2?.image}
                            alt="bt-image"
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <img
                            src={toData?.tokenSymbol}
                            alt="bt-image"
                            style={{
                              width: "30px",
                              height: "30px",
                              maxWidth: "30px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative ">
                          <img
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <img
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            style={{
                              width: "35px",
                              height: "35px",
                              maxWidth: "35px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      )}
                    </Button>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "-15px",
                      }}
                    >
                      <span className="font-normal text-md">
                        {" "}
                        {toData?.token ? toData?.token : "Coin name"}{" "}
                      </span>
                      <span className="font-bold text-lg">
                        {" "}
                        {toData?.network
                          ? toData?.network
                          : "Network name"}{" "}
                      </span>
                    </div>
                  </div>
                  {showAccordion2 && coinData && (
                    <DialogModal
                      coinData={coinData}
                      handleNetworkset={handleNetworkset}
                      value={value}
                      handleNetworkRender={handleNetworkRender}
                      handleTokenSelection={handleTokenSelection2}
                      type={'to'}
                      // setShowAccord={setShowAccordion2}
                    />
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
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 0,
                }}
              >
                  <CheckBalance
                    tokenAddress={fromData.tokenAddress}
                    fromAmount={fromData.amount}
                  />
              </div>
            </div>
          </div>
          {providerArray?.length > 0 && (
            <div
              style={{
                fontSize: "20px",
                width: "50%",
                fontWeight: "600",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                background: "#18181b",
                padding: "15px 33px",
                marginTop: "26px",
                zIndex: "10",
              }}
              className="w-full flex px-5 justify-between"
            >
              <h1>AI Routing</h1> <TbRefresh />
            </div>
          )}
          {providerArray?.length > 0 && (
            <div
              style={{
                width: "50%",
                overflowX: "scroll",
                height: "200px",
                background: "#18181b",
                padding: "15px",
                display: "flex",
                flexDirection: "row",
                paddingTop: "10px",
                gap: "10px",
                zIndex: "10",
              }}
            >
              {providerArray?.map((data, index) => (
                <div key={index}>
                  <RouteCard data={data} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mobileView mobbgImg">
        <MobileHome />
      </div>
    </>
  );
}
