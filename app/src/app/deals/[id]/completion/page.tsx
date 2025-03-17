"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDealById } from "@/app/actions/deals";
import DealCompletionNFT from "@/components/deal/DealCompletionNFT";
import { Button } from "@/components/ui/button";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DealData {
  id: string;
  name: string;
  description: string;
  status: string;
  studio: {
    name: string;
    profile_image_url: string;
  };
  celebrity: {
    name: string;
    profile_image_url: string;
  };
  terms: {
    payment_amount: number;
    duration_days: number;
    usage_rights: string;
    exclusivity: boolean;
  };
  funded_amount: number;
  created_at: string;
  completed_at: string;
  nft_mint_address?: string;
}

export default function DealCompletionPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dealId = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    async function fetchDeal() {
      if (!dealId) {
        setError("Invalid deal ID");
        setLoading(false);
        return;
      }

      try {
        const dealData = await getDealById(dealId);

        if (!dealData) {
          throw new Error("Deal not found");
        }

        if (dealData.status !== "completed") {
          // If the deal is not completed, redirect to the deal details page
          router.replace(`/deals/${dealId}`);
          return;
        }

        setDeal(dealData as unknown as DealData);
      } catch (err) {
        console.error("Error fetching deal:", err);
        setError("Failed to load deal data");
      } finally {
        setLoading(false);
      }
    }

    fetchDeal();
  }, [dealId, router]);

  if (loading) {
    return (
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-10" />

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </div>
          <div>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="container max-w-5xl py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error Loading Deal
        </h1>
        <p className="text-gray-600 mb-8">{error || "Deal not found"}</p>
        <Button onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(deal.completed_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Deal Successfully Completed
        </h1>
        <p className="text-gray-600 mt-2">
          Congratulations! Your deal has been successfully completed on{" "}
          {formattedDate}.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Deal Summary</CardTitle>
            <CardDescription>
              A summary of the completed deal between {deal.studio.name} and{" "}
              {deal.celebrity.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Deal Name</h3>
                <p className="text-lg font-semibold">{deal.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="text-sm">{deal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment</h3>
                  <p className="text-lg font-semibold">
                    {deal.funded_amount} SOL
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Duration
                  </h3>
                  <p className="text-lg font-semibold">
                    {deal.terms.duration_days} Days
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Usage Rights
                  </h3>
                  <p className="text-lg font-semibold capitalize">
                    {deal.terms.usage_rights}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Exclusivity
                  </h3>
                  <p className="text-lg font-semibold">
                    {deal.terms.exclusivity ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">
            Commemorative NFT Certificate
          </h2>
          <DealCompletionNFT dealId={dealId} nftMint={deal.nft_mint_address} />
        </div>
      </div>
    </div>
  );
}
