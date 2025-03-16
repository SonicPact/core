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

function NewChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRecipientId = searchParams.get("recipient");

  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(
    null
  );
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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
          id: "4",
          name: "Sarah Williams",
          category: "influencer",
          profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        },
        {
          id: "5",
          name: "David Brown",
          category: "streamer",
          profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
        },
        {
          id: "6",
          name: "Emily Davis",
          category: "athlete",
          profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
        },
      ];

      setCelebrities(mockCelebrities);

      // If a recipient ID was provided in the URL, preselect that celebrity
      if (preselectedRecipientId) {
        const preselectedCeleb = mockCelebrities.find(
          (celeb) => celeb.id === preselectedRecipientId
        );
        if (preselectedCeleb) {
          setSelectedCelebrity(preselectedCeleb);
        }
      }

      setIsLoading(false);
    };

    fetchCelebrities();
  }, [preselectedRecipientId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedCelebrity || !initialMessage.trim()) return;

    setIsSending(true);

    // In a real implementation, this would create a new chat on the blockchain
    console.log(
      "Starting chat with:",
      selectedCelebrity.name,
      "Message:",
      initialMessage
    );

    // Simulate API call
    setTimeout(() => {
      // Redirect to the new chat
      router.push(`/chat/${selectedCelebrity.id}`);
    }, 1500);
  };

  const filteredCelebrities = celebrities.filter((celeb) =>
    celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4">
            <Icon name="arrow-left" className="text-foreground/70" />
          </Link>
          <h1 className="text-3xl font-bold">New Chat</h1>
        </div>

        <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-3">
                Select a Celebrity
              </label>

              {!selectedCelebrity && (
                <div className="mb-4">
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
              )}

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : selectedCelebrity ? (
                <div className="flex items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <img
                    src={selectedCelebrity.profileImage}
                    alt={selectedCelebrity.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold">{selectedCelebrity.name}</h3>
                    <p className="text-sm text-foreground/70 capitalize">
                      {selectedCelebrity.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCelebrity(null)}
                    className="ml-auto text-sm text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : filteredCelebrities.length === 0 ? (
                <div className="text-center py-8 bg-secondary/5 rounded-lg">
                  <Icon
                    name="user-x"
                    className="mx-auto text-4xl text-foreground/30 mb-4"
                  />
                  <h3 className="text-xl font-medium mb-2">
                    No celebrities found
                  </h3>
                  <p className="text-foreground/50">
                    Try adjusting your search or explore more celebrities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {filteredCelebrities.map((celebrity) => (
                    <div
                      key={celebrity.id}
                      className="flex items-center p-4 border border-secondary/20 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedCelebrity(celebrity)}
                    >
                      <img
                        src={celebrity.profileImage}
                        alt={celebrity.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-bold">{celebrity.name}</h3>
                        <p className="text-sm text-foreground/70 capitalize">
                          {celebrity.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="initialMessage"
                className="block text-lg font-medium mb-3"
              >
                Initial Message
              </label>
              <textarea
                id="initialMessage"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="w-full p-3 border border-secondary/20 rounded-lg bg-secondary/10 min-h-[120px]"
                placeholder="Introduce yourself and explain why you'd like to connect..."
                required
              />
            </div>

            <div className="flex justify-between">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-secondary/20 rounded-lg"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                disabled={
                  !selectedCelebrity || !initialMessage.trim() || isSending
                }
              >
                {isSending ? (
                  <span className="flex items-center">
                    <Icon name="loader" className="animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <NewChatPage />
    </Suspense>
  );
}
