import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';  
import { formatUnits } from 'viem';
import { stakingAbi } from '@/utils/stakingAbi';
import { tokenAbi } from '@/utils/tokenAbi';  
import { UserInfo, HandleMintProps, handleApprovalAndDepositProps, handleWithdrawProps, handleClaimProps, handleRewardProps  } from '../../types/types'; 

// Contract addresses 
const depositTokenAddress = '0xa292e6ba7317E3A240d401C782C6906621E6F820';
const rewardTokenAddress = '0x3711B3D206CfdAf9a03BBd82e04C36Aa3761c391';
const stakingContractAddress = '0x5BBb1166F884eC26DdaB9CAC37112DED0B008cCf';

interface BlockchainDataProps {
  setAccount: (account: string | null) => void;
  setBalanceDepositToken: (balance: string | null) => void;
  setBalanceRewardToken: (balance: string | null) => void;
  setBalanceStakingContract: (balance: string | null) => void;
  setUser: (balance: UserInfo | null) => void;
}

// Amount to mint 
const amountToMint = BigInt(10_000 * 10 ** 18); 

// Amount to Approve and Deposit
const amountToApprove = BigInt(10_000);

// Amount to Withdraw
const amountToWithdraw = BigInt(5_000);  

const BlockchainData: React.FC<BlockchainDataProps> = ({ setAccount, setBalanceDepositToken, setBalanceRewardToken, setBalanceStakingContract, setUser }) => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // Read balanceOf DepositToken
  const { data: depositBalance } = useReadContract({
    abi: tokenAbi,
    address: depositTokenAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    account: address,
    query: {
      enabled: !!address,
    },
  });

  // Read balanceOf RewardToken
  const { data: rewardBalance } = useReadContract({
    abi: tokenAbi,
    address: rewardTokenAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    account: address,
    query: {
      enabled: !!address,
    },
  });

  // Read balanceOf Staking Contract
  const { data: stakingContractBalance } = useReadContract({
    abi: stakingAbi,
    address: stakingContractAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    account: address,
    query: {
      enabled: !!address,
    },
  });

  // Mint new tokens
  const handleMint = async ({ address, writeContract, tokenAbi, depositTokenAddress }: HandleMintProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
    await writeContract({
      abi: tokenAbi,
      address: depositTokenAddress,
      functionName: 'mint',
      args: [address, amountToMint],
    });
  };

  // Approve and Deposit Tokens in Staking Contract
  const handleApprovalAndDeposit = async ({
    address,
    writeContract,
    tokenAbi,
    stakingAbi,
    depositTokenAddress,
    stakingContractAddress,
    amountToApprove,
  }: handleApprovalAndDepositProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
  
    try {
      // Step 1: Call the approve function on the depositToken contract
      await writeContract({
        abi: tokenAbi,
        address: depositTokenAddress,
        functionName: 'approve',
        args: [stakingContractAddress, amountToApprove],
      });
  
      console.log('Approval successful! Now you can deposit.');
  
      // Step 2: After successful approval, call the deposit function in the staking contract
      await writeContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'depositVault',
        args: [amountToApprove],
      });
  
      console.log('Deposit successful!');
    } catch (error) {
      console.error('Transaction failed', error);
    }
  };

  // Withdraw tokens from the staking contract
  const handleWithdraw = async ({
    address,
    writeContract,
    stakingAbi,
    stakingContractAddress,
    amountToWithdraw
  }: handleWithdrawProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
    try {
      await writeContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'withdrawVault',
        args: [amountToWithdraw]
      });
      console.log('Withdrawal successful!');
    } catch (error) {
      console.error('Withdrawal failed', error);
    }
  };

  // Read balanceOf User Account
  const { data: userInfo } = useReadContract({
    abi: stakingAbi,
    address: stakingContractAddress,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  console.log('Raw userInfo tuple:', userInfo);

  // Use readContract to fetch the pending rewards using `calculatePendingRewards`
  const { data: calculatedRewards, isError: rewardsError, isLoading: rewardsLoading } = useReadContract({
    abi: stakingAbi,
    address: stakingContractAddress,
    functionName: 'calculatePendingRewards',
    args: userInfo ? [userInfo] : undefined, 
  query: {
    enabled: !!userInfo, 
  },
  });

  console.log('Calculated Rewards:', calculatedRewards);
  

  // Claim reward tokens from the staking contract
  const handleClaim = async ({
    address,
    writeContract,
    stakingAbi,
    stakingContractAddress,
  }: handleClaimProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
    try {
      await writeContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'claim',
        args: [],
      })
      console.log('Claim successful!');
    } catch (error) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
  };

  // Update parent component states
  useEffect(() => {
    if (!address) {
      console.error('Address is undefined. Waiting for connection.');
      return;
    }
    if (isConnected) {
      setAccount(address); 
    }

    if (userInfo) {
      const [shares, lastClaimTime, pendingRewards] = userInfo;
      // Set the user data in the parent state using setUser
      setUser({
        shares: BigInt(shares),       
        lastClaimTime: BigInt(lastClaimTime),
        pendingRewards: BigInt(pendingRewards),
      }); 
    }

    if (depositBalance) {
      const formattedDepositBalance = formatUnits(depositBalance, 18);
      setBalanceDepositToken(formattedDepositBalance);
    }

    if (rewardBalance) {
      const formattedRewardBalance = formatUnits(rewardBalance, 18);
      setBalanceRewardToken(formattedRewardBalance);
    }

    if (stakingContractBalance) {
      const formattedStakingContractBalance = formatUnits(stakingContractBalance, 18);
      setBalanceStakingContract(formattedStakingContractBalance);
    }
  }, [
    address,
    isConnected,
    depositBalance,
    rewardBalance,
    stakingContractBalance,
    userInfo,
    setAccount,
    setBalanceDepositToken,
    setBalanceRewardToken,
    setBalanceStakingContract, 
    setUser, 
  ]);

  
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start' }}>
      <button
        style={{
          backgroundColor: '#D3D3D3',
          borderRadius: '12px',
          padding: '10px 20px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => {
          if (address) {
            handleMint({ address, writeContract, tokenAbi, depositTokenAddress });
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Mint
      </button>
      <button
        style={{
          backgroundColor: '#90EE90',
          borderRadius: '12px',
          padding: '10px 20px',
          border: '1px solid #ccc',     // Light border color
          cursor: 'pointer',            // Pointer cursor on hover
          fontSize: '16px',              // Font size
          transition: 'background-color 0.3s ease', // Smooth hover effect
        }}
        onClick={() => {
          if (address) {
            handleApprovalAndDeposit({
              address,
              writeContract,
              tokenAbi,
              stakingAbi,
              depositTokenAddress,
              stakingContractAddress,
              amountToApprove,
            })
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Deposit
      </button>
      <button
        style={{
          backgroundColor: '#FF7F7F',  // Light red color
          borderRadius: '12px',        // Rounded corners
          padding: '10px 20px',        // Padding for better spacing
          border: '1px solid #ccc',    // Light border color
          cursor: 'pointer',           // Pointer cursor on hover
          fontSize: '16px',            // Font size
          transition: 'background-color 0.3s ease', // Smooth hover effect
        }}
        onClick={() => {
          if (address) {
            handleWithdraw({
              address,
              writeContract,
              stakingAbi,
              stakingContractAddress,
              amountToWithdraw,
            });
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Withdraw
      </button>
      <button
        style={{
          backgroundColor: '#FFFACD',
          borderRadius: '12px',
          padding: '10px 20px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => {
          if (address) {
            handleClaim({ address, writeContract, stakingAbi, stakingContractAddress });
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Claim
      </button>
    </div>
  )
}; 

export default BlockchainData;

