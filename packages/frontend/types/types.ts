// Type for the handleMint function
export interface HandleMintProps {
  address: string | null
  writeContract: Function
  tokenAbi: any
  depositTokenAddress: string
}

export interface handleApprovalAndDepositProps {
  address: string | null
  writeContract: Function
  tokenAbi: any
  stakingAbi: any
  depositTokenAddress: string
  stakingContractAddress: string
  amountToApprove: BigInt
}

export interface handleWithdrawProps {
  address: string | null
  writeContract: Function
  stakingAbi: any
  stakingContractAddress: string
  amountToWithdraw: BigInt
}

export interface handleClaimProps {
  address: string | null
  writeContract: Function
  stakingAbi: any
  stakingContractAddress: string
}

export interface handleRewardProps {
  address: `0x${string}` | null
  writeContract: Function
  stakingAbi: any
  stakingContractAddress: `0x${string}`
}

export interface UserInfo {
  shares: BigInt
  lastClaimTime: BigInt
  pendingRewards: BigInt
}
