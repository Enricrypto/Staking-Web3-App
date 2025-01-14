import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, optimism, polygon } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
})

