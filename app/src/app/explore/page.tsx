"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/shared/components/Icon";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { getCelebrities } from "../actions/user";

interface Celebrity {
  id: string;
  wallet_address: string;
  user_type: "celebrity";
  name: string;
  category?: string;
  description?: string;
  profile_image_url?: string;
  verified?: boolean;
}

export default function ExplorePage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState<Celebrity[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  // Check if wallet is connected
  useEffect(() => {
    if (!connected) {
      // Redirect to home after a short delay
      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [connected, router]);

  // Fetch celebrities data
  useEffect(() => {
    if (!connected) return;

    const fetchCelebrities = async () => {
      setIsLoading(true);

      try {
        // Fetch celebrities from the database using server action
        const celebsData = await getCelebrities();

        // Transform the data to match our interface
        const transformedCelebs = celebsData.map((celeb) => ({
          ...celeb,
          id: celeb.id || celeb.wallet_address, // Use ID if available, otherwise use wallet address
        })) as Celebrity[];

        setCelebrities(transformedCelebs);
        setFilteredCelebrities(transformedCelebs);
      } catch (error) {
        console.error("Error fetching celebrities:", error);

        // Fallback to mock data if there's an error
        const mockCelebrities: Celebrity[] = [
          {
            id: "1",
            wallet_address: "wallet1",
            user_type: "celebrity",
            name: "John Doe",
            category: "athlete",
            description:
              "Professional basketball player with 10+ years of experience.",
            profile_image_url: "https://randomuser.me/api/portraits/men/1.jpg",
            verified: true,
          },
          {
            id: "2",
            wallet_address: "wallet2",
            user_type: "celebrity",
            name: "Jane Smith",
            category: "actor",
            description:
              "Award-winning actress known for roles in major film franchises.",
            profile_image_url:
              "https://randomuser.me/api/portraits/women/2.jpg",
            verified: true,
          },
          {
            id: "3",
            wallet_address: "wallet3",
            user_type: "celebrity",
            name: "Mike Johnson",
            category: "musician",
            description: "Grammy-nominated artist with a global fanbase.",
            profile_image_url: "https://randomuser.me/api/portraits/men/3.jpg",
            verified: true,
          },
          {
            id: "4",
            wallet_address: "wallet4",
            user_type: "celebrity",
            name: "Sarah Williams",
            category: "influencer",
            description:
              "Social media influencer with over 5 million followers.",
            profile_image_url:
              "https://randomuser.me/api/portraits/women/4.jpg",
            verified: false,
          },
          {
            id: "5",
            wallet_address: "wallet5",
            user_type: "celebrity",
            name: "David Brown",
            category: "streamer",
            description: "Popular gaming streamer with a dedicated community.",
            profile_image_url: "https://randomuser.me/api/portraits/men/5.jpg",
            verified: true,
          },
          {
            id: "6",
            wallet_address: "wallet6",
            user_type: "celebrity",
            name: "Emily Davis",
            category: "athlete",
            description: "Olympic gold medalist in swimming.",
            profile_image_url:
              "https://randomuser.me/api/portraits/women/6.jpg",
            verified: true,
          },
          {
            id: "7",
            wallet_address: "wallet7",
            user_type: "celebrity",
            name: "Alex Turner",
            category: "musician",
            description: "Indie rock musician and songwriter.",
            profile_image_url: "https://randomuser.me/api/portraits/men/7.jpg",
            verified: false,
          },
          {
            id: "8",
            wallet_address: "wallet8",
            user_type: "celebrity",
            name: "Olivia Wilson",
            category: "actor",
            description:
              "Rising star known for roles in indie films and TV series.",
            profile_image_url:
              "https://randomuser.me/api/portraits/women/8.jpg",
            verified: true,
          },
        ];

        setCelebrities(mockCelebrities);
        setFilteredCelebrities(mockCelebrities);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCelebrities();
  }, [connected]);

  // Filter celebrities based on search query and category
  useEffect(() => {
    let filtered = celebrities;

    if (searchQuery) {
      filtered = filtered.filter(
        (celeb) =>
          celeb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (celeb.description &&
            celeb.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (celeb) => celeb.category === selectedCategory
      );
    }

    setFilteredCelebrities(filtered);
  }, [searchQuery, selectedCategory, celebrities]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-7xl mx-auto">
        {!connected ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="mb-6">
              You need to connect your wallet to explore celebrities.
            </p>
            <div className="flex justify-center mb-4">
              <WalletMultiButton className="wallet-adapter-button-custom" />
            </div>
            <p className="text-sm text-foreground/70">
              You will be redirected to the home page in a few seconds...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Explore Celebrities</h1>
              <p className="text-foreground/70">
                Browse and connect with celebrities for your next gaming NFT
                collaboration.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search celebrities..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-3 pl-10 border border-secondary/20 rounded-lg bg-secondary/10"
                  />
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50"
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border border-secondary/20 rounded-lg bg-secondary/10"
                >
                  <option value="all">All Categories</option>
                  <option value="athlete">Athletes</option>
                  <option value="actor">Actors/Actresses</option>
                  <option value="musician">Musicians</option>
                  <option value="influencer">Influencers</option>
                  <option value="streamer">Streamers/Content Creators</option>
                  <option value="other">Other</option>
                </select>
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
                <h3 className="text-xl font-medium mb-2">
                  No celebrities found
                </h3>
                <p className="text-foreground/50">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCelebrities.map((celebrity) => (
                  <div
                    key={celebrity.id}
                    className="bg-background border border-secondary/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      {celebrity.profile_image_url ? (
                        <img
                          src={celebrity.profile_image_url}
                          alt={celebrity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                          <Icon
                            name="user"
                            className="text-5xl text-foreground/30"
                          />
                        </div>
                      )}
                      {celebrity.verified && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center">
                          <Icon name="check-circle" className="mr-1" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{celebrity.name}</h3>
                        {celebrity.category && (
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded capitalize">
                            {celebrity.category}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                        {celebrity.description || "No description available"}
                      </p>

                      <div className="flex justify-between">
                        <Link
                          href={`/profile/${celebrity.id}`}
                          className="text-primary text-sm hover:underline"
                        >
                          View Profile
                        </Link>

                        <Link
                          href={`/chat/new?recipient=${celebrity.id}`}
                          className="flex items-center text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <Icon name="message-circle" className="mr-1" />
                          Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
