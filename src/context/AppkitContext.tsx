import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, base, polygon, type AppKitNetwork } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import ChainConfig from '../config/chain-config.json'
import Ethlogo from '../assets/etherum_2.svg'
import baseLogo from '../assets/base.svg'
import arbitrumLogo from '../assets/arbitrum.svg'
import polygonLogo from '../assets/polygon.svg'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '3b369a8754749cfced1a3c2ad22da0f3'

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}


const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  {
    ...mainnet,
    ...ChainConfig.ethereum,
    logo:Ethlogo
  } as AppKitNetwork, 
  {
    ...arbitrum,
    ...ChainConfig.arbitrum,
    logo:arbitrumLogo
  } as AppKitNetwork,
  {
    ...base,
    ...ChainConfig.base,
    logo:baseLogo
  } as AppKitNetwork,
  {
    ...polygon,
    ...ChainConfig.polygon,
    logo:polygonLogo
  } as AppKitNetwork
]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}