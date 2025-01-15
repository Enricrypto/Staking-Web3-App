// Type for the handleMint function
export interface HandleMintProps {
  address: `0x${string}`
  writeContract: Function
  tokenAbi: any
  depositTokenAddress: `0x${string}`
}

export interface handleApprovalAndDepositProps {
  address: `0x${string}`
  writeContract: Function
  tokenAbi: any
  stakingAbi: any
  depositTokenAddress: `0x${string}`
  stakingContractAddress: `0x${string}`
}

export interface handleWithdrawProps {
  address: `0x${string}`
  writeContract: Function
  stakingAbi: any
  stakingContractAddress: `0x${string}`
}

export interface handleClaimProps {
  address: `0x${string}`
  writeContract: Function
  stakingAbi: any
  stakingContractAddress: `0x${string}`
}

export interface handleRewardProps {
  address: `0x${string}`
  stakingAbi: any
  stakingContractAddress: `0x${string}`
  userInfo: readonly [bigint, bigint, bigint] | undefined
}

export interface UserInfo {
  shares: BigInt
  lastClaimTime: BigInt
  pendingRewards: BigInt
}
