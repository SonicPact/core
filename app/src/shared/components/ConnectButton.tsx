"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import WalletAuthButton from "./WalletAuthButton";

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
    <WalletAuthButton>
      {connected && walletAddress ? walletAddress : "Connect Wallet"}
    </WalletAuthButton>
  );
};

export default ConnectButton;
