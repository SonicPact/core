"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

interface DealCompletionNFTProps {
  dealId: string;
  nftMint?: string;
}

export default function DealCompletionNFT({
  dealId,
  nftMint,
}: DealCompletionNFTProps) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOwnsNFT, setUserOwnsNFT] = useState(false);

  useEffect(() => {
    async function fetchNFTData() {
      if (!nftMint) {
        setError("No NFT has been minted for this deal yet");
        setLoading(false);
        return;
      }

      try {
        // In a real app, this would fetch from Arweave or IPFS
        // For this example, we'll simulate with a URL that follows our format
        const metadataUrl = `https://sonicpact.io/metadata/${dealId}.json`;
        const response = await fetch(metadataUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch NFT metadata");
        }

        const data = await response.json();
        setMetadata(data);

        // Check if connected wallet owns this NFT
        if (connected && publicKey) {
          try {
            const mintPubkey = new PublicKey(nftMint);
            const tokenAccounts = await connection.getTokenAccountsByOwner(
              publicKey,
              { mint: mintPubkey }
            );

            if (tokenAccounts.value.length > 0) {
              // Check if the account has a balance
              const tokenAccount = tokenAccounts.value[0];
              const accountInfo = await getAccount(
                connection,
                tokenAccount.pubkey
              );

              if (Number(accountInfo.amount) > 0) {
                setUserOwnsNFT(true);
              }
            }
          } catch (err) {
            console.error("Error checking NFT ownership:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching NFT data:", err);
        setError("Failed to load NFT data");
      } finally {
        setLoading(false);
      }
    }

    fetchNFTData();
  }, [dealId, nftMint, connection, publicKey, connected]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading NFT data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-sm">
        <div className="w-16 h-16 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          NFT Not Available
        </h3>
        <p className="mt-1 text-sm text-gray-600">{error}</p>
        {!connected && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-600">
              Connect your wallet to check for the NFT
            </p>
            <WalletMultiButton />
          </div>
        )}
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  const renderAttributes = () => {
    return metadata.attributes.map((attr, index) => (
      <div
        key={index}
        className="flex flex-col px-3 py-2 bg-gray-50 rounded-lg"
      >
        <span className="text-xs font-medium text-gray-500 uppercase">
          {attr.trait_type}
        </span>
        <span className="mt-1 text-sm font-semibold">{attr.value}</span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col overflow-hidden bg-white rounded-xl shadow-lg">
      <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {metadata.image && (
          <Image
            src={metadata.image}
            alt={metadata.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-lg">
          <span className="text-xs font-medium text-white">
            {userOwnsNFT ? "In Your Wallet" : "Commemorative NFT"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">{metadata.name}</h2>
        <p className="mt-2 text-gray-600">{metadata.description}</p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Deal Details</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {renderAttributes()}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">NFT Contract</span>
            <span className="text-xs text-gray-900 font-mono">
              {nftMint?.slice(0, 6)}...{nftMint?.slice(-4)}
            </span>
          </div>

          {userOwnsNFT ? (
            <button
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() =>
                window.open(
                  `https://explorer.solana.com/address/${nftMint}?cluster=devnet`,
                  "_blank"
                )
              }
            >
              View on Explorer
            </button>
          ) : (
            <div className="text-sm text-gray-500 italic">
              NFT owned by deal parties
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
