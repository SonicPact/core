"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

const ConnectButton: FC = () => {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      // Format the wallet address to show only the first and last few characters
      const address = publicKey.toString();
      const formattedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
      setWalletAddress(formattedAddress);
    } else {
      setWalletAddress(null);
    }
  }, [publicKey]);

  return (
    <WalletMultiButton className="wallet-adapter-button-custom">
      {connected && walletAddress ? walletAddress : "Connect Wallet"}
    </WalletMultiButton>
  );
};

export default ConnectButton;
