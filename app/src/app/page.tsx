"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkUserExists } from "./actions/user";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [userStatus, setUserStatus] = useState<{
    isChecking: boolean;
    exists: boolean;
    userType?: "studio" | "celebrity";
  }>({
    isChecking: false,
    exists: false,
  });

  // Check if user exists when wallet is connected
  useEffect(() => {
    const checkUser = async () => {
      if (connected && publicKey) {
        setUserStatus((prev) => ({ ...prev, isChecking: true }));
        try {
          const { exists, userData } = await checkUserExists(
            publicKey.toString()
          );
          setUserStatus({
            isChecking: false,
            exists,
            userType: userData?.user_type as "studio" | "celebrity" | undefined,
          });

          // If user exists, redirect to dashboard
          if (exists) {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error checking user:", error);
          setUserStatus((prev) => ({ ...prev, isChecking: false }));
        }
      }
    };

    checkUser();
  }, [connected, publicKey, router]);

  return (
    <div>
      <section className="relative h-[90vh] bg-radial from-secondary/30 to-transparent">
        <figure
          className="bg-[url(/logo-bg.png)] absolute inset-0 animate-bg-infinite-scroll"
          style={{
            backgroundSize: "124px",
          }}
        >
          <figure className="absolute inset-0 bg-radial from-transparent to-65% to-background" />

          <figure className="absolute bottom-0 left-0 w-full bg-background h-10 translate-y-1/2 blur-lg" />
        </figure>

        <div className="relative z-1 w-full h-full flex justify-center items-center flex-col drop-shadow-lg gap-y-5">
          <h2 className="text-6xl text-center font-bold leading-[1.3]">
            Plan and execute NFT pacts on a<br />
            single collaboration platform
          </h2>

          <h3 className="text-foreground/75 text-center">
            Join now and instantly start a chat with whoever you want to
            collaborate with to draft up a deal
            <br />
            We will take care of everything else.
          </h3>

          {connected ? (
            userStatus.isChecking ? (
              <div className="flex flex-col items-center gap-y-4">
                <p className="text-foreground/75">Checking your account...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : userStatus.exists ? (
              <div className="flex flex-col items-center gap-y-4">
                <p className="text-foreground/75">
                  Welcome back! Redirecting to dashboard...
                </p>
                <Link
                  href="/dashboard"
                  className="w-52 py-2 rounded-lg bg-primary text-primary-foreground font-medium tracking-wider text-center"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex gap-x-5">
                <Link
                  href="/onboarding?type=studio"
                  className="w-52 py-2 rounded-lg bg-primary text-primary-foreground font-medium tracking-wider text-center"
                >
                  Join as a Studio
                </Link>
                <Link
                  href="/onboarding?type=celebrity"
                  className="w-52 py-2 rounded-lg bg-background border border-primary shadow-[inset_-0.5px_1px_6px_var(--primary)] text-center"
                >
                  Join as a Celeb
                </Link>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-y-4">
              <p className="text-foreground/75">
                Connect your wallet to get started
              </p>
              <WalletMultiButton className="wallet-adapter-button-custom" />
            </div>
          )}

          <div className="mt-4">
            <Link href="/explore" className="text-primary underline">
              Explore Celebrities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
