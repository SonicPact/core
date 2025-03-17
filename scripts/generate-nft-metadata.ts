#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface DealData {
  id: string;
  name: string;
  description: string;
  studio_id: string;
  celebrity_id: string;
  status: string;
  payment_amount: number;
  royalty_percentage?: number;
  duration_days?: number;
  usage_rights?: string;
  exclusivity?: boolean;
  completed_at?: string;
  studio?: {
    name: string;
    profile_image_url?: string;
  };
  celebrity?: {
    name: string;
    profile_image_url?: string;
  };
}

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: {
    trait_type: string;
    value: string | number | boolean;
  }[];
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    creators: {
      address: string;
      share: number;
    }[];
  };
}

// In a real application, you would create a script to programmatically generate metadata
// and upload it to IPFS or Arweave. For simplicity, this example will generate and save locally.

const OUTPUT_DIR = path.join(__dirname, '../app/public/metadata');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample function to generate NFT metadata for a deal
function generateNFTMetadata(deal: DealData): NFTMetadata {
  // Date formatting
  const completedDate = deal.completed_at ? new Date(deal.completed_at).toLocaleDateString() : 'N/A';
  
  // Create metadata
  const metadata: NFTMetadata = {
    name: `SonicPact: ${deal.name}`,
    symbol: 'SONIC',
    description: `This NFT commemorates the successful collaboration between ${deal.studio?.name || 'Studio'} and ${deal.celebrity?.name || 'Celebrity'} for "${deal.name}". ${deal.description}`,
    image: `https://sonicpact.io/generated-nft-images/${deal.id}.png`, // In a real app, this would be on IPFS/Arweave
    external_url: `https://sonicpact.io/deals/${deal.id}`,
    attributes: [
      {
        trait_type: 'Status',
        value: deal.status.charAt(0).toUpperCase() + deal.status.slice(1)
      },
      {
        trait_type: 'Deal Amount',
        value: `${deal.payment_amount} SOL`
      },
      {
        trait_type: 'Studio',
        value: deal.studio?.name || 'Unknown Studio'
      },
      {
        trait_type: 'Celebrity',
        value: deal.celebrity?.name || 'Unknown Celebrity'
      },
      {
        trait_type: 'Completion Date',
        value: completedDate
      }
    ],
    properties: {
      files: [
        {
          uri: `https://sonicpact.io/generated-nft-images/${deal.id}.png`,
          type: 'image/png'
        }
      ],
      creators: [
        {
          address: deal.studio_id,
          share: 50
        },
        {
          address: deal.celebrity_id,
          share: 50
        }
      ]
    }
  };

  // Add optional attributes if they exist
  if (deal.duration_days) {
    metadata.attributes.push({
      trait_type: 'Duration',
      value: `${deal.duration_days} days`
    });
  }

  if (deal.usage_rights) {
    metadata.attributes.push({
      trait_type: 'Usage Rights',
      value: deal.usage_rights
    });
  }

  if (deal.exclusivity !== undefined) {
    metadata.attributes.push({
      trait_type: 'Exclusivity',
      value: deal.exclusivity ? 'Yes' : 'No'
    });
  }

  if (deal.royalty_percentage) {
    metadata.attributes.push({
      trait_type: 'Royalty',
      value: `${deal.royalty_percentage}%`
    });
  }

  return metadata;
}

// Example usage with sample data
const sampleDeal: DealData = {
  id: 'sample-deal-id-123',
  name: 'Game Character Endorsement',
  description: 'Celebrity endorsement and voice acting for game character',
  studio_id: 'HN7cABqLq7wKj9VtQXdCiTVB6X4CQYn1zRbER7yHvjwQ',
  celebrity_id: 'J8oPcJwZqWntVQZCJZ5RJbAm1TutCLzirQD9pFUvir3S',
  status: 'completed',
  payment_amount: 10,
  royalty_percentage: 5,
  duration_days: 365,
  usage_rights: 'Full',
  exclusivity: true,
  completed_at: new Date().toISOString(),
  studio: {
    name: 'Awesome Studios',
    profile_image_url: 'https://example.com/studio.png'
  },
  celebrity: {
    name: 'Famous Person',
    profile_image_url: 'https://example.com/celebrity.png'
  }
};

// Generate and save sample metadata
const metadata = generateNFTMetadata(sampleDeal);
const outputPath = path.join(OUTPUT_DIR, `${sampleDeal.id}.json`);
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log(`Sample NFT metadata generated at: ${outputPath}`);
console.log('In a real application, you would upload this to IPFS or Arweave.');

// Export the function for use in other scripts
export { generateNFTMetadata };