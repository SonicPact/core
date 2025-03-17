# SonicPact

SonicPact is a decentralized platform that facilitates deal-making between gaming studios and celebrities using smart contracts on the Solana blockchain.

## Overview

SonicPact enables gaming studios to collaborate with celebrities for NFT projects by providing:

- Secure wallet connection using Solana wallet adapters
- User profiles for both gaming studios and celebrities
- Deal creation and negotiation
- Real-time messaging and chat requests
- Smart contract integration for secure transactions
- Commemorative NFT minting upon deal completion

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Blockchain**: Solana (Rust smart contracts)
- **Authentication**: Solana wallet authentication
- **Real-time**: Supabase Realtime for chat and notifications
- **NFT Standards**: SPL Token and Metaplex Token Metadata

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Rust (for Solana smart contract development)
- Solana CLI tools & Anchor framework (for smart contract development)
- Supabase account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sonicpact.git
   cd sonicpact
   ```

2. Install dependencies for web app:
   ```bash
   cd app
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `app` directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Contract Development

1. Install Anchor framework if you haven't already:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked
   avm install latest
   avm use latest
   ```

2. Build the smart contract:
   ```bash
   anchor build
   ```

3. Update the IDL for the frontend:
   ```bash
   npm run update-idl
   ```

4. Run tests:
   ```bash
   anchor test
   ```

5. Deploy to a Solana cluster (localnet, devnet, or mainnet):
   ```bash
   anchor deploy
   ```

### Utility Scripts

The project includes several utility scripts to help with development:

- **Update IDL**:
  ```bash
  npm run update-idl      # JavaScript version
  npm run update-idl:ts   # TypeScript version
  ```

- **NFT Metadata**:
  ```bash
  npm run generate-nft-metadata  # Generate sample NFT metadata
  npm run upload-nft-metadata    # Mock upload to Arweave
  ```

See the [scripts README](./scripts/README.md) for more details.

## Project Structure

- `/app` - Next.js application
  - `/src` - Source code
    - `/app` - Next.js app router pages
      - `/actions` - Server actions for API endpoints
      - `/chat` - Chat pages and components
    - `/components` - React components
    - `/services` - Service layer for data access and business logic
    - `/shared` - Shared utilities and components
      - `/utils` - Utility functions including Supabase clients
    - `/styles` - Global styles
  - `/public` - Static assets
  - `/supabase` - Supabase migrations and configuration

- `/programs` - Solana smart contracts (Anchor framework)
  - `/sonicpact` - Main contract
    - `/src` - Contract source code
    - `/lib.rs` - Main contract implementation
- `/tests` - Contract integration tests
- `/scripts` - Utility scripts
  - `update-idl.js` - Updates IDL TypeScript files
  - `generate-nft-metadata.ts` - Generates NFT metadata
  - `upload-nft-metadata.ts` - Mock script for Arweave uploads

## Architecture

SonicPact follows a layered architecture pattern:

1. **UI Layer**: React components and pages that handle user interactions
2. **Server Actions Layer**: Next.js server actions that provide API endpoints
3. **Service Layer**: Business logic and data access services
4. **Data Layer**: Supabase database and Solana blockchain

This separation of concerns makes the codebase more maintainable and testable.

## Features

### User Onboarding

- Connect Solana wallet
- Create profile as either a gaming studio or celebrity
- Upload profile images and verification documents

### Explore

- Browse verified celebrities
- Filter by category
- Search by name or description

### Deal Creation

- Create deal proposals with customizable terms
- Set payment amount and royalty percentages
- Define usage rights and exclusivity

### Dashboard

- View all deals and their statuses
- Manage messages
- Update profile information

### Messaging System

- **Chat Requests**: Send and manage chat requests to initiate conversations
- **Real-time Chat**: Instant messaging with real-time updates
- **Notifications**: Get notified of new messages and chat requests
- **Message Status**: Track read/unread status of messages
- **User Presence**: See when users are online or offline

### Smart Contract

The SonicPact smart contract handles the complete deal lifecycle between gaming studios and celebrities:

- **Initialize Platform**: Set up the SonicPact platform with configurable fees
- **Create Deal**: Studios can create deals with specific terms, payment amounts, and rights
- **Accept Deal**: Celebrities can accept proposed deals
- **Fund Deal**: Studios can fund accepted deals (funds held in escrow)
- **Complete Deal**: 
  - Releases funds to celebrity (minus platform fee)
  - Mints commemorative NFT to acknowledge the collaboration
  - NFT includes both parties as creators with equal attribution
- **Cancel Deal**: 
  - Deals can be cancelled before completion
  - Return funds to studio if already funded
  - Different authorization rules based on deal status
- **Platform Management**: Update platform fees (capped at 10%)

### NFT Certification

- **Commemorative NFTs**: Automatic minting of a certificate NFT when a deal completes
- **On-chain Proof**: Permanent record of collaboration between studios and celebrities
- **Customized Metadata**: NFT containing deal details, collaborators, and terms
- **Joint Creators**: Both parties recognized as creators in the NFT metadata
- **Collectible Asset**: Tradable NFT that can be displayed or sold on marketplaces

## Authentication

SonicPact uses Solana wallet-based authentication with cryptographic signature verification:

1. **Wallet Connection**: Users connect their Solana wallet (Phantom, Solflare, etc.)
2. **Challenge Message**: The server generates a unique challenge message
3. **Signature**: The user signs the challenge message with their wallet's private key
4. **Verification**: The server verifies the signature using the wallet's public key
5. **Session**: Upon successful verification, a JWT session is created with Supabase

This approach ensures that users actually own the wallet they're connecting with, providing a secure and seamless authentication experience without requiring passwords.

## Database Schema

The main tables in the database include:

- `users` - User profiles for both studios and celebrities
- `deals` - Deal information and terms
- `chat_requests` - Requests to initiate conversations between users
- `chats` - Chat conversations between users
- `chat_participants` - Users participating in each chat
- `messages` - Messages sent in chats
- `nft_certificates` - Records of NFTs minted upon deal completion

## Real-time Features

SonicPact leverages Supabase's real-time capabilities to provide:

- Instant message delivery
- Live updates for chat requests
- Real-time notifications
- Message read status updates

This is implemented using Supabase's Postgres Changes feature, which uses PostgreSQL's built-in replication to stream database changes to connected clients.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Solana Foundation
- Supabase
- Next.js team 