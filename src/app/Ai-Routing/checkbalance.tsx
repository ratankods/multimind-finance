import React, { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ethers } from 'ethers';
import {ConnectButton} from "@rainbow-me/rainbowkit";

const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

interface CheckBalanceProps {
    tokenAddress: string;
    fromAmount: number;
  }

  export const CheckBalance: React.FC<CheckBalanceProps> = ({ tokenAddress, fromAmount }) => {
    const { address, isConnected } = useAccount();
    const [isSufficientBalance, setIsSufficientBalance] = useState(false);
  
    const { data, isError, isLoading } = useContractRead({
      addressOrName: tokenAddress,
      contractInterface: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
  
    useEffect(() => {
      if (data) {
        const balanceInEther = ethers.utils.formatEther(data);
        setIsSufficientBalance(parseFloat(balanceInEther) >= fromAmount);
      }
    }, [data, fromAmount]);
  
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error occurred</div>;
  
    return (
      <div>
        {isConnected && (
          isSufficientBalance ? <ConnectButton /> : <div>Insufficient Balance</div>
        )}
      </div>
    );
  };