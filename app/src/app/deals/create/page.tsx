"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/shared/components/Icon";

interface Celebrity {
  id: string;
  name: string;
  profileImage: string;
  category: string;
}

function CreateDeal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCelebId = searchParams.get("celebrity");

  const [step, setStep] = useState(1);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(
    null
  );
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [dealData, setDealData] = useState({
    name: "",
    description: "",
    paymentAmount: 5,
    royaltyPercentage: 5,
    durationDays: 365,
    exclusivity: false,
    usageRights: "limited",
    additionalTerms: "",
  });

  // Fetch celebrities data
  useEffect(() => {
    const fetchCelebrities = async () => {
      setIsLoading(true);

      // Mock data for now
      const mockCelebrities: Celebrity[] = [
        {
          id: "1",
          name: "John Doe",
          category: "athlete",
          profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          id: "2",
          name: "Jane Smith",
          category: "actor",
          profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        },
        {
          id: "3",
          name: "Mike Johnson",
          category: "musician",
          profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        },
        {
          id: "6",
          name: "Emily Davis",
          category: "athlete",
          profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
        },
      ];

      setCelebrities(mockCelebrities);

      // If a celebrity ID was provided in the URL, preselect that celebrity
      if (preselectedCelebId) {
        const preselectedCeleb = mockCelebrities.find(
          (celeb) => celeb.id === preselectedCelebId
        );
        if (preselectedCeleb) {
          setSelectedCelebrity(preselectedCeleb);
          setStep(2);
        }
      }

      setIsLoading(false);
    };

    fetchCelebrities();
  }, [preselectedCelebId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setDealData({
      ...dealData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final submission
    if (!selectedCelebrity) {
      alert("Please select a celebrity");
      setStep(1);
      return;
    }

    // Here you would connect to the Sonic SVM blockchain and create the deal
    console.log("Creating deal with:", {
      celebrity: selectedCelebrity,
      ...dealData,
    });

    // Redirect to the dashboard after successful creation
    router.push("/dashboard");
  };

  const filteredCelebrities = celebrities.filter((celeb) =>
    celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStepOne = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Select a Celebrity</h2>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search celebrities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-secondary/20 rounded-lg bg-secondary/10"
          />
          <Icon
            name="search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCelebrities.length === 0 ? (
        <div className="text-center py-16 bg-secondary/5 rounded-lg">
          <Icon
            name="user-x"
            className="mx-auto text-4xl text-foreground/30 mb-4"
          />
          <h3 className="text-xl font-medium mb-2">No celebrities found</h3>
          <p className="text-foreground/50">
            Try adjusting your search or explore more celebrities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCelebrities.map((celebrity) => (
            <div
              key={celebrity.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCelebrity?.id === celebrity.id
                  ? "border-primary bg-primary/5"
                  : "border-secondary/20 hover:border-primary/50"
              }`}
              onClick={() => setSelectedCelebrity(celebrity)}
            >
              <img
                src={celebrity.profileImage}
                alt={celebrity.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="font-bold">{celebrity.name}</h3>
                <p className="text-sm text-foreground/70 capitalize">
                  {celebrity.category}
                </p>
              </div>
              {selectedCelebrity?.id === celebrity.id && (
                <div className="ml-auto">
                  <Icon name="check-circle" className="text-primary text-xl" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStepTwo = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Deal Details</h2>

      {selectedCelebrity && (
        <div className="flex items-center p-4 bg-secondary/5 rounded-lg mb-6">
          <img
            src={selectedCelebrity.profileImage}
            alt={selectedCelebrity.name}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-bold">{selectedCelebrity.name}</h3>
            <p className="text-sm text-foreground/70 capitalize">
              {selectedCelebrity.category}
            </p>
          </div>
          <button
            className="ml-auto text-sm text-primary hover:underline"
            onClick={() => setStep(1)}
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Deal Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={dealData.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
            placeholder="e.g., Character NFT Collaboration"
            required
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={dealData.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10 min-h-[100px]"
            placeholder="Describe the details of the collaboration..."
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Deal Terms</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label
              htmlFor="paymentAmount"
              className="block text-sm font-medium mb-1"
            >
              Payment Amount (SOL)
            </label>
            <input
              type="number"
              id="paymentAmount"
              name="paymentAmount"
              value={dealData.paymentAmount}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              required
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="royaltyPercentage"
              className="block text-sm font-medium mb-1"
            >
              Royalty Percentage (%)
            </label>
            <input
              type="number"
              id="royaltyPercentage"
              name="royaltyPercentage"
              value={dealData.royaltyPercentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label
              htmlFor="durationDays"
              className="block text-sm font-medium mb-1"
            >
              Duration (Days)
            </label>
            <input
              type="number"
              id="durationDays"
              name="durationDays"
              value={dealData.durationDays}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              required
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="usageRights"
              className="block text-sm font-medium mb-1"
            >
              Usage Rights
            </label>
            <select
              id="usageRights"
              name="usageRights"
              value={dealData.usageRights}
              onChange={handleInputChange}
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              required
            >
              <option value="limited">Limited (Specific Game Only)</option>
              <option value="full">Full (All Games by Studio)</option>
              <option value="custom">
                Custom (Specify in Additional Terms)
              </option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="exclusivity"
              checked={dealData.exclusivity}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span>
              Exclusivity (Celebrity cannot work with competing studios)
            </span>
          </label>
        </div>

        <div className="form-group">
          <label
            htmlFor="additionalTerms"
            className="block text-sm font-medium mb-1"
          >
            Additional Terms (Optional)
          </label>
          <textarea
            id="additionalTerms"
            name="additionalTerms"
            value={dealData.additionalTerms}
            onChange={handleInputChange}
            className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10 min-h-[100px]"
            placeholder="Any additional terms or conditions..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a New Deal</h1>
          <p className="text-foreground/70">
            Set up a collaboration deal with a celebrity for your gaming NFTs.
          </p>
        </div>

        <div className="flex items-center mb-8">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? "bg-primary" : "bg-secondary/20"
            }`}
          >
            <span className="text-sm font-medium">1</span>
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 2 ? "bg-primary" : "bg-secondary/20"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? "bg-primary" : "bg-secondary/20"
            }`}
          >
            <span className="text-sm font-medium">2</span>
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 3 ? "bg-primary" : "bg-secondary/20"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? "bg-primary" : "bg-secondary/20"
            }`}
          >
            <span className="text-sm font-medium">3</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg"
        >
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-secondary/20 rounded-lg"
              >
                Back
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-secondary/20 rounded-lg"
              >
                Cancel
              </Link>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              disabled={
                (step === 1 && !selectedCelebrity) ||
                (step === 2 && (!dealData.name || !dealData.description))
              }
            >
              {step < 3 ? "Next" : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CreateDeal />
    </Suspense>
  );
}
