#!/usr/bin/env ts-node

/**
 * This script demonstrates how to upload NFT metadata to Arweave
 * In a real application, you would:
 * 1. Connect to a real Arweave node
 * 2. Use a funded wallet to pay for storage
 * 3. Implement proper error handling and retry logic
 * 
 * For this example, we'll mock the upload process
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateNFTMetadata } from './generate-nft-metadata';

// In a real app, you would:
// import Arweave from 'arweave';
// import { JWKInterface } from 'arweave/node/lib/wallet';

// Mock function to simulate Arweave upload
async function mockUploadToArweave(metadata: any): Promise<string> {
  // Create a deterministic "transaction ID" based on content hash for demo purposes
  const mockTxId = Buffer.from(JSON.stringify(metadata)).toString('base64').substring(0, 43);
  return mockTxId;
}

// Function to upload metadata for a deal
async function uploadDealMetadata(dealId: string, metadata: any): Promise<string> {
  try {
    // In a real implementation:
    // 1. Connect to Arweave
    // const arweave = Arweave.init({
    //   host: 'arweave.net',
    //   port: 443,
    //   protocol: 'https'
    // });
    
    // 2. Load wallet (in production, handle this securely!)
    // const wallet = JSON.parse(fs.readFileSync('wallet.json', 'utf-8')) as JWKInterface;

    // 3. Create and sign transaction
    // const transaction = await arweave.createTransaction({
    //   data: JSON.stringify(metadata)
    // }, wallet);
    
    // transaction.addTag('Content-Type', 'application/json');
    // transaction.addTag('App-Name', 'SonicPact');
    // transaction.addTag('Deal-ID', dealId);

    // await arweave.transactions.sign(transaction, wallet);
    // await arweave.transactions.post(transaction);
    
    // 4. Return transaction ID
    // return transaction.id;

    // For this demo, we'll use a mock implementation
    console.log(`Uploading metadata for deal: ${dealId}...`);
    const txId = await mockUploadToArweave(metadata);
    
    // In a real application, you'd persist this mapping in a database
    console.log(`Upload complete! Transaction ID: ${txId}`);
    console.log(`Metadata would be available at: https://arweave.net/${txId}`);
    
    return txId;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
}

// Example usage with our sample metadata
async function main() {
  // Create the output directory for our mock data
  const OUTPUT_DIR = path.join(__dirname, '../app/public/metadata');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Create a sample deal (normally you'd fetch this from your database)
  const sampleDeal = {
    id: 'sample-deal-id-456',
    name: 'Streaming Exclusivity Deal',
    description: 'Exclusive streaming rights for the celebrity\'s content',
    studio_id: 'BrW7qv2qBhZ5fQNgUL39ZXVsXEYEj8tFKL1L87VaNu1w',
    celebrity_id: 'CMQXoTQbk1HKKsAPdR7dtmxUpKXpnX9sFKdj1YLHvVRZ',
    status: 'completed',
    payment_amount: 25,
    royalty_percentage: 10,
    duration_days: 180,
    usage_rights: 'Limited',
    exclusivity: true,
    completed_at: new Date().toISOString(),
    studio: {
      name: 'Streaming Studios Inc',
      profile_image_url: 'https://example.com/streaming-studio.png'
    },
    celebrity: {
      name: 'Content Creator X',
      profile_image_url: 'https://example.com/creator.png'
    }
  };

  // Generate metadata
  const metadata = generateNFTMetadata(sampleDeal);
  
  // Upload to "Arweave" (mocked)
  const txId = await uploadDealMetadata(sampleDeal.id, metadata);
  
  // Save the mapping locally
  const mappingDir = path.join(__dirname, '../app/src/utils/nft');
  if (!fs.existsSync(mappingDir)) {
    fs.mkdirSync(mappingDir, { recursive: true });
  }
  
  // Create the mock URL that would be used in the real app
  const arweaveUrl = `https://arweave.net/${txId}`;
  
  // Store the mapping
  const mappingPath = path.join(mappingDir, 'metadata-urls.json');
  let mappings = {};
  
  if (fs.existsSync(mappingPath)) {
    mappings = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  }
  
  mappings[sampleDeal.id] = arweaveUrl;
  
  fs.writeFileSync(mappingPath, JSON.stringify(mappings, null, 2));
  console.log(`Mapping saved to: ${mappingPath}`);
  
  // Also save a local copy for testing
  const testMetadataPath = path.join(OUTPUT_DIR, `${sampleDeal.id}.json`);
  fs.writeFileSync(testMetadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Test metadata saved to: ${testMetadataPath}`);
}

// Run the script
main().catch(console.error);