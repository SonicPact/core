"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createUser, checkUserExists } from "../actions/user";
import { uploadFile } from "../actions/storage";

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
  const { connected, publicKey, signMessage } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userExists, setUserExists] = useState(false);
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
    if (!connected) {
      // Redirect to home after a short delay
      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [connected, router]);

  // Check if user already exists
  useEffect(() => {
    const verifyWalletAndCheckUser = async () => {
      if (publicKey) {
        setIsChecking(true);
        try {
          // Check if user exists directly from server action
          const { exists } = await checkUserExists(publicKey.toString());
          setUserExists(exists);

          if (exists) {
            // If user already exists, redirect to dashboard
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error checking if user exists:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    verifyWalletAndCheckUser();
  }, [publicKey, router]);

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

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final submission
    if (!publicKey) {
      alert("Wallet not connected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload profile image to Supabase Storage if provided
      let profileImageUrl: string | undefined = undefined;
      if (formData.profileImage) {
        const uploadedUrl = await uploadFile(
          formData.profileImage,
          "profiles",
          type === "celebrity" ? "celebrities" : "studios"
        );
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      // Upload verification documents to Supabase Storage if provided
      let verificationDocumentUrl: string | undefined = undefined;
      if (formData.verificationDocuments) {
        const uploadedUrl = await uploadFile(
          formData.verificationDocuments,
          "verification",
          "documents"
        );
        if (uploadedUrl) {
          verificationDocumentUrl = uploadedUrl;
        }
      }

      // Prepare the user data for the database
      const userData = {
        wallet_address: publicKey.toString(),
        user_type: type as "studio" | "celebrity",
        name: formData.name,
        description: formData.description,
        profile_image_url: profileImageUrl,
        website: formData.website,
        twitter_url: formData.socialLinks.twitter,
        instagram_url: formData.socialLinks.instagram,
        discord_url: formData.socialLinks.discord,
        category: type === "celebrity" ? formData.category : undefined,
        verification_document_url: verificationDocumentUrl,
      };

      // Create the user profile in the database using server action
      await createUser(userData);

      // Redirect to dashboard after successful creation
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating user profile:", error);
      setIsSubmitting(false);
      alert("Failed to create profile. Please try again.");
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
        {formData.profileImage && (
          <div className="mt-2">
            <p className="text-xs text-foreground/70">
              Selected file: {formData.profileImage.name}
            </p>
            <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border border-secondary/20">
              <img
                src={URL.createObjectURL(formData.profileImage)}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
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
            {formData.verificationDocuments && (
              <p className="text-xs text-foreground/70 mt-2">
                Selected file: {formData.verificationDocuments.name}
              </p>
            )}
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
        {!connected ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="mb-6">
              You need to connect your wallet to continue with the onboarding
              process.
            </p>
            <div className="flex justify-center mb-4">
              <WalletMultiButton className="wallet-adapter-button-custom" />
            </div>
            <p className="text-sm text-foreground/70">
              You will be redirected to the home page in a few seconds...
            </p>
          </div>
        ) : isChecking ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Checking Your Account</h2>
            <p className="mb-6">
              Please wait while we check if you already have a profile...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : userExists ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Profile Already Exists</h2>
            <p className="mb-6">
              You already have a profile. Redirecting to dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <>
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
              {publicKey && (
                <div className="mt-2 p-2 bg-secondary/10 rounded-lg">
                  <p className="text-sm">
                    <span className="text-foreground/50">Wallet Address: </span>
                    <span className="font-mono">{publicKey.toString()}</span>
                  </p>
                </div>
              )}
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
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : step < 3 ? (
                    "Next"
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
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
