import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';  
import { formatUnits, zeroAddress } from 'viem';
import { stakingAbi } from '@/utils/stakingAbi';
import { tokenAbi } from '@/utils/tokenAbi';  
import { UserInfo, HandleMintProps, handleApprovalAndDepositProps, handleWithdrawProps, handleClaimProps, handleRewardProps  } from '../../types/types'; 

// Contract addresses 
const depositTokenAddress = '0xa292e6ba7317E3A240d401C782C6906621E6F820';
const rewardTokenAddress = '0x3711B3D206CfdAf9a03BBd82e04C36Aa3761c391';
const stakingContractAddress = '0x48205953F4ef7B432D0a4f3D0880b21A9BC97A44';

interface BlockchainDataProps {
  setAccount: (account: string | null) => void;
  setBalanceDepositToken: (balance: string | null) => void;
  setBalanceRewardToken: (balance: string | null) => void;
  setBalanceStakingContract: (balance: string | null) => void;
  setUser: (balance: UserInfo | null) => void;
} 

const BlockchainData: React.FC<BlockchainDataProps> = ({ setAccount, setBalanceDepositToken, setBalanceRewardToken, setBalanceStakingContract, setUser }) => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [fetchRewards, setFetchRewards] = useState(false);
  const [updatedRewards, setUpdatedRewards] = useState(BigInt(0));
  const [mintAmount, setMintAmount] = useState<string>(''); // state for the mint
  const [depositAmount, setDepositAmount] = useState<string>(''); // State for the deposit input
  const [withdrawAmount, setWithdrawAmount] = useState<string>(''); // State for the withdraw input

  // Read balanceOf DepositToken
  const { data: depositBalance } = useReadContract({
    abi: tokenAbi,
    address: depositTokenAddress,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
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
    args: [address || zeroAddress],
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
    args: [address || zeroAddress],
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
    if (!mintAmount || isNaN(Number(mintAmount))) {
      console.error('Invalid mint amount.');
      return;
    }
    try {
      const mintValue = BigInt(Number(mintAmount) * 1e18);
      await writeContract({
        abi: tokenAbi,
        address: depositTokenAddress,
        functionName: 'mint',
        args: [address, mintValue],
      });
      console.log('Mint succesful');
    } catch (error) {
      console.error('Mint failed', error); 
    }
  };

  // Approve and Deposit Tokens in Staking Contract
  const handleApprovalAndDeposit = async ({
    address,
    writeContract,
    tokenAbi,
    stakingAbi,
    depositTokenAddress,
    stakingContractAddress
  }: handleApprovalAndDepositProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }

    if (!depositAmount || isNaN(Number(depositAmount))) {
      console.error('Invalid deposit amount.');
      return;
    }
  
    try {
      const depositValue = BigInt(Number(depositAmount) * 1e18); 
      // Step 1: Call the approve function on the depositToken contract
      await writeContract({
        abi: tokenAbi,
        address: depositTokenAddress,
        functionName: 'approve',
        args: [stakingContractAddress, depositValue],
      });
  
      console.log('Approval successful! Now you can deposit.');
  
      // Step 2: After successful approval, call the deposit function in the staking contract
      await writeContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'depositVault',
        args: [depositValue],
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
  }: handleWithdrawProps) => {
    if (!address) {
      console.error('Wallet address is undefined. Please connect your wallet.');
      return;
    }
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      console.error('Invalid withdraw amount.');
      return;
    }

    try {
      const withdrawValue = BigInt(Number(withdrawAmount) * 1e18); 
      await writeContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'withdrawVault',
        args: [withdrawValue]
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
    args: [address || zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  // Use readContract to fetch the pending rewards using `calculatePendingRewards`

      const { data: calculatedRewards } = useReadContract({
        abi: stakingAbi,
        address: stakingContractAddress,
        functionName: 'calculatePendingRewards',
        args: [
          {
            shares: BigInt(userInfo?.[0] || 0),
            lastClaimTime: BigInt(userInfo?.[1] || 0),
            pendingRewards: BigInt(userInfo?.[2] || 0),
          },
        ],
        query: {
          enabled: !!userInfo && fetchRewards,
        },
      });
  console.log('Calculated Rewards:', calculatedRewards);
  
    // Trigger re-fetch of rewards when the button is clicked
    const handleRewards = () => {
      setFetchRewards(!fetchRewards);  // Toggle the fetchRewards state to trigger the re-fetch
    };

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

    if (calculatedRewards) {
      setUpdatedRewards(calculatedRewards);
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
    calculatedRewards,
    setAccount,
    setBalanceDepositToken,
    setBalanceRewardToken,
    setBalanceStakingContract, 
    setUser, 
  ]);

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="mintAmount" style={{ marginRight: '10px' }}>
          Enter amount to mint:
        </label>
        <input
          id="mintAmount"
          type="number"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
      <button
        style={{
          backgroundColor: '#FFFF00',
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
        <button style={{
      backgroundColor: '#D3D3D3',
      borderRadius: '12px',
      padding: '10px 20px',
      border: '1px solid #ccc',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
    }} onClick={() => setMintAmount('')}>Clear</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="depositAmount" style={{ marginRight: '10px' }}>
          Enter amount to deposit:
        </label>
        <input
          id="depositAmount"
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
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
            });
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Deposit
        </button>
        <button style={{
      backgroundColor: '#D3D3D3',
      borderRadius: '12px',
      padding: '10px 20px',
      border: '1px solid #ccc',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
    }} onClick={() => setDepositAmount('')}>Clear</button>
    </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="withdrawAmount" style={{ marginRight: '10px' }}>
          Enter amount to deposit:
        </label>
        <input
          id="withdrawAmount"
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
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
              stakingContractAddress
            });
          } else {
            console.error('Wallet address is undefined. Please connect your wallet.');
          }
        }}
      >
        Withdraw
        </button>
        <button style={{
      backgroundColor: '#D3D3D3',
      borderRadius: '12px',
      padding: '10px 20px',
      border: '1px solid #ccc',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
    }} onClick={() => setWithdrawAmount('')}>Clear</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
      <button
        style={{
          backgroundColor: '#FFA07A',
          borderRadius: '12px',
          padding: '10px 20px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
        }}
        onClick={handleRewards}
      >
        Pending Rewards
      </button>
      {updatedRewards !== null ? (
          <p>Balance Reward Token: {updatedRewards?.toString()}</p>
        ) : (
          <p>Loading balance...</p>
      )}
      </div>
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

