import { createPublicClient, http, formatEther, getAddress } from 'viem';
import { celo } from 'viem/chains';

export const CHAIN = celo;
export const CHAIN_ID = 42220;

export const publicClient = createPublicClient({
  chain: celo,
  transport: http('https://forno.celo.org', { retryCount: 3, retryDelay: 1000 }),
});

// G$ integrated contracts
export const CONTRACTS = {
  CoreMarketPlace:   '0x01FAD87943D1303E0083391eF4E43Cee8dB06A72' as `0x${string}`,
  EscrowService:     '0x983AB59ab1Ae967E34d72d57E3fF65b411Ad0D5B' as `0x${string}`,
  UserProfile:       '0x7DaE559f4acE0579121C22de722d1E97A6957069' as `0x${string}`,
  DisputeResolution: '0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561' as `0x${string}`,
  GDollar:           '0x62b8B11039FCFe5Ab0c56E502B1c372A3d462a4b' as `0x${string}`,
};

export const MARKETPLACE_ABI = [
  {
    name: 'createListing', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'createListingGD', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'purchaseListing', type: 'function', stateMutability: 'payable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'purchaseListingGD', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'cancelListing', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getListing', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'seller', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'uint256' },
        { name: 'currency', type: 'uint8' },  // 0 = CELO, 1 = G$
        { name: 'status', type: 'uint8' },    // 0 = Active, 1 = Sold, 2 = Cancelled
        { name: 'createdAt', type: 'uint256' },
        { name: 'expiresAt', type: 'uint256' },
      ],
    }],
  },
  {
    name: 'lastListingId', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }],
  },
] as const;

export interface Listing {
  listingId: number;
  seller: string;
  name: string;
  description: string;
  price: bigint;
  currency: number; // 0 = CELO, 1 = G$
  status: number;   // 0 = Active, 1 = Sold, 2 = Cancelled
  createdAt: bigint;
  expiresAt: bigint;
}

export const getListings = async (): Promise<Listing[]> => {
  try {
    const lastId = await publicClient.readContract({
      address: CONTRACTS.CoreMarketPlace,
      abi: MARKETPLACE_ABI,
      functionName: 'lastListingId',
    });

    if (!lastId || lastId === 0n) return [];

    const ids = Array.from({ length: Number(lastId) }, (_, i) => BigInt(i + 1));
    const results = await Promise.allSettled(
      ids.map(i =>
        publicClient.readContract({
          address: CONTRACTS.CoreMarketPlace,
          abi: MARKETPLACE_ABI,
          functionName: 'getListing',
          args: [i],
        })
      )
    );

    const listings: Listing[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled') {
        const l = r.value as any;
        if (l.status === 0) {
          listings.push({
            listingId: i + 1,
            seller: l.seller,
            name: l.name,
            description: l.description,
            price: l.price,
            currency: l.currency,
            status: l.status,
            createdAt: l.createdAt,
            expiresAt: l.expiresAt,
          });
        }
      }
    }
    return listings;
  } catch (e) {
    console.error('getListings error:', e);
    return [];
  }
};

export const formatCELO = (wei: bigint): string =>
  parseFloat(formatEther(wei)).toFixed(4);

export const formatAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const isWalletConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('celo_address');
};

export const getConnectedAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('celo_address');
};

export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  const eth = (window as any).ethereum;
  if (!eth) {
    alert('Please install MetaMask or a Celo-compatible wallet');
    return null;
  }
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts[0]) return null;

  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xA4EC' }] });
  } catch (e: any) {
    if (e.code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xA4EC',
          chainName: 'Celo',
          nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
          rpcUrls: ['https://forno.celo.org'],
          blockExplorerUrls: ['https://explorer.celo.org/mainnet'],
        }],
      });
    }
  }

  const address = getAddress(accounts[0]);
  localStorage.setItem('celo_address', address);
  return address;
};

export const disconnectWallet = (): void => {
  localStorage.removeItem('celo_address');
};

export const getWalletBalance = async (address: string): Promise<bigint> => {
  try {
    return await publicClient.getBalance({ address: address as `0x${string}` });
  } catch {
    return 0n;
  }
};
