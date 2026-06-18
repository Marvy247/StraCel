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
   CoreMarketPlace:   '0x0Db0b61bd15B642305faDC91e3bBd6cD45ecf179' as `0x${string}`,
  EscrowService:     '0xc30e7A642E150d392FfC7D4AE56C87b549Ed3500' as `0x${string}`,
  UserProfile:       '0x7DaE559f4acE0579121C22de722d1E97A6957069' as `0x${string}`,
  DisputeResolution: '0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561' as `0x${string}`,
  GDollar:           '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A' as `0x${string}`,
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

export const GD_ABI = [
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance', type: 'function', stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
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

export const getAllListings = async (): Promise<Listing[]> => {
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
    return listings;
  } catch (e) {
    console.error('getAllListings error:', e);
    return [];
  }
};

export interface PurchaseRecord {
  listingId: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  seller: string;
  txHash: string;
  timestamp: number;
}

const PURCHASE_STORAGE_KEY = 'stracel_orders';

export const recordPurchase = (purchase: PurchaseRecord): void => {
  if (typeof window === 'undefined') return;
  const existing = getPurchaseHistory();
  existing.unshift(purchase);
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(existing));
};

export const getPurchaseHistory = (): PurchaseRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PURCHASE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
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

export const getGDBalance = async (address: string): Promise<bigint> => {
  try {
    const bal = await publicClient.readContract({
      address: CONTRACTS.GDollar,
      abi: [
        { name: 'balanceOf', type: 'function', stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
      ],
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    return bal as bigint;
  } catch {
    return 0n;
  }
};

export const getEstimatedGas = async (address: string, to: string, value: bigint): Promise<bigint> => {
  try {
    const eth = (window as any).ethereum;
    if (!eth) return 0n;
    const gas = await eth.request({
      method: 'eth_estimateGas',
      params: [{ from: address, to, value: `0x${value.toString(16)}` }],
    });
    const price = await eth.request({ method: 'eth_gasPrice' });
    return BigInt(gas) * BigInt(price);
  } catch {
    return 0n;
  }
};
