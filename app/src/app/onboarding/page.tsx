"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react";

interface FormData {
  name: string;
  description: string;
  profileImage: File | null;
  website: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    discord: string;
  };
  category: string;
  verificationDocuments: File | null;
}

function Onboarding() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "studio";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    profileImage: null,
    website: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      discord: "",
    },
    // For celebrities only
    category: "",
    verificationDocuments: null,
  });

  // Check if wallet is connected, if not redirect to home
  useEffect(() => {
    // This would be replaced with actual wallet connection check
    const isWalletConnected = false; // Placeholder

    if (!isWalletConnected) {
      // For now, we'll just show a message instead of redirecting
      console.log("Wallet not connected");
    }
  }, [router]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof FormData] as Record<string, string>),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here you would connect to the Sonic SVM blockchain and create the user profile
    // For now, we'll just simulate success and redirect

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final submission
      console.log("Submitting profile:", formData);

      // Redirect to dashboard after successful creation
      router.push("/dashboard");
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div className="form-group">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10 min-h-[100px]"
          required
        />
      </div>

      <div className="form-group">
        <label
          htmlFor="profileImage"
          className="block text-sm font-medium mb-1"
        >
          Profile Image
        </label>
        <input
          type="file"
          id="profileImage"
          name="profileImage"
          onChange={handleFileChange}
          className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
          accept="image/*"
        />
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-4">
      <div className="form-group">
        <label htmlFor="website" className="block text-sm font-medium mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Social Links</label>

        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-24">Twitter:</span>
            <input
              type="text"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-secondary/20 rounded-lg bg-secondary/10"
            />
          </div>

          <div className="flex items-center">
            <span className="w-24">Instagram:</span>
            <input
              type="text"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-secondary/20 rounded-lg bg-secondary/10"
            />
          </div>

          <div className="flex items-center">
            <span className="w-24">Discord:</span>
            <input
              type="text"
              name="socialLinks.discord"
              value={formData.socialLinks.discord}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-secondary/20 rounded-lg bg-secondary/10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-4">
      {type === "celebrity" && (
        <>
          <div className="form-group">
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              required
            >
              <option value="">Select a category</option>
              <option value="athlete">Athlete</option>
              <option value="actor">Actor/Actress</option>
              <option value="musician">Musician</option>
              <option value="influencer">Influencer</option>
              <option value="streamer">Streamer/Content Creator</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="verificationDocuments"
              className="block text-sm font-medium mb-1"
            >
              Verification Documents
            </label>
            <input
              type="file"
              id="verificationDocuments"
              name="verificationDocuments"
              onChange={handleFileChange}
              className="w-full p-2 border border-secondary/20 rounded-lg bg-secondary/10"
              accept=".pdf,.jpg,.png"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Please upload documents that verify your identity. This will be
              used for verification purposes only.
            </p>
          </div>
        </>
      )}

      <div className="form-group">
        <div className="bg-secondary/10 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Terms and Conditions</h4>
          <p className="text-sm text-foreground/70">
            By creating an account, you agree to SonicPact's Terms of Service
            and Privacy Policy. You also agree to receive communications from
            SonicPact.
          </p>

          <div className="mt-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" required />
              <span className="text-sm">
                I agree to the terms and conditions
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {type === "studio"
              ? "Gaming Studio Onboarding"
              : "Celebrity Onboarding"}
          </h1>
          <p className="text-foreground/70">
            {type === "studio"
              ? "Set up your gaming studio profile to start connecting with celebrities for NFT collaborations."
              : "Set up your celebrity profile to start receiving collaboration requests from gaming studios."}
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
              <div></div>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              {step < 3 ? "Next" : "Complete Setup"}
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
      <Onboarding />
    </Suspense>
  );
}
