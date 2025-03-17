"use client";

import { FC, useState, useCallback, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { generateAuthMessage, verifyWalletSignature } from "@/app/actions/auth";
import { encode as bs58Encode } from "bs58";

interface WalletAuthButtonProps {
  onAuthSuccess?: (userData: any) => void;
  className?: string;
  children?: ReactNode;
}

const WalletAuthButton: FC<WalletAuthButtonProps> = ({
  onAuthSuccess,
  className = "wallet-adapter-button-custom",
  children,
}) => {
  const { publicKey, signMessage, connected, connecting } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    try {
      setIsAuthenticating(true);
      setError(null);

      // Generate a challenge message
      const message = await generateAuthMessage(publicKey.toString());

      // Convert the message to Uint8Array for signing
      const messageBytes = new TextEncoder().encode(message);

      // Request the user to sign the message
      const signature = await signMessage(messageBytes);

      // Verify the signature on the server and create a JWT session
      const result = await verifyWalletSignature(
        publicKey.toString(),
        message,
        bs58Encode(signature)
      );

      if (result.success) {
        if (onAuthSuccess) {
          onAuthSuccess(result.userData);
        }

        // If user doesn't exist, redirect to onboarding
        if (!result.exists) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      setError((err as Error).message || "Failed to authenticate");
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, router, onAuthSuccess]);

  // Attempt authentication when wallet is connected
  useEffect(() => {
    if (connected && publicKey && !connecting && !isAuthenticating) {
      handleAuth();
    }
  }, [connected, publicKey, connecting, isAuthenticating, handleAuth]);

  return (
    <div className="flex flex-col items-center">
      <WalletMultiButton className={className}>{children}</WalletMultiButton>

      {isAuthenticating && (
        <div className="mt-2 text-sm text-foreground/70">
          Please sign the message in your wallet...
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-500">Error: {error}</div>}
    </div>
  );
};

export default WalletAuthButton;
