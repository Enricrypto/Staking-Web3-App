import Head from 'next/head';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import BlockchainData from '@/components/contract/BlockChainData';
import { UserInfo } from '../../frontend/types/types'; 

export default function Home() {
  const [balanceDepositToken, setBalanceDepositToken] = useState<string | null>(null);
  const [balanceRewardToken, setBalanceRewardToken] = useState<string | null>(null);
  const [balanceStakingContract, setBalanceStakingContract] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null); 

  return (
    <div className={''}>
      <Head>
        <title>Create-Web3 App</title>
        <meta name="description" content="Generated by npx create-web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header style={{ padding: '1rem' }}>
        <ConnectButton />
      </header>

      <main
        style={{
          minHeight: '60vh',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>ERC-20 Token Balance</h1>
        {account && <p>Account: {account}</p>}
        {balanceDepositToken !== null ? (
          <p>Balance Deposit Token: {balanceDepositToken}</p>
        ) : (
          <p>Loading balance...</p>
        )}
        {balanceRewardToken !== null ? (
          <p>Balance Reward Token: {balanceRewardToken}</p>
        ) : (
          <p>Loading balance...</p>
        )}
        {balanceStakingContract !== null ? (
          <p>Balance Staking Contract: {balanceStakingContract}</p>
        ) : (
          <p>Loading balance...</p>
        )}
        {user !== null ? (
          <p>Pending Rewards: {user.pendingRewards.toString()}</p>
        ) : (
          <p>Loading Rewards...</p>
        )}
        <BlockchainData setAccount={setAccount} setBalanceDepositToken={setBalanceDepositToken} setBalanceRewardToken={setBalanceRewardToken} setBalanceStakingContract={setBalanceStakingContract} setUser={setUser} />
      </main>
    </div>
  );
}
