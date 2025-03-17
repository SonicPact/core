# NFT Minting on Deal Completion

## Overview

SonicPact will mint a commemorative NFT when a deal between a studio and celebrity is successfully completed. This NFT serves as:

1. A permanent on-chain record of the collaboration
2. A certificate of authenticity for the partnership
3. A collectible that can be displayed or traded

## Implementation Plan

The NFT minting logic will be integrated into the `complete_deal` instruction in the Solana smart contract. Here's how it will work:

### Required Dependencies

To implement NFT minting, we'll need these dependencies in the `Cargo.toml` file:

```toml
[dependencies]
anchor-lang = "0.31.0"
anchor-spl = "0.31.0"
mpl-token-metadata = { version = "3.0.0", features = ["no-entrypoint"] }
```

### Account Structure

The `CompleteDeal` context will be extended to include these additional accounts:

```rust
// NFT-related accounts
/// NFT mint account
#[account(mut)]
pub nft_mint: Account<'info, Mint>,

/// NFT mint authority (PDA)
#[account(
    seeds = [b"mint_authority", deal.key().as_ref()],
    bump,
)]
/// CHECK: This is a PDA that will be the mint authority
pub nft_mint_authority: UncheckedAccount<'info>,

/// Studio token account to receive the NFT
#[account(mut)]
pub studio_token_account: Account<'info, TokenAccount>,

/// NFT metadata account
/// CHECK: This account will be initialized by the metadata program
#[account(mut)]
pub nft_metadata: UncheckedAccount<'info>,

/// SPL token program
pub token_program: Program<'info, Token>,

/// Metadata program
/// CHECK: This is the Metaplex metadata program
pub metadata_program: UncheckedAccount<'info>,

/// Associated token program
pub associated_token_program: Program<'info, AssociatedToken>,

pub rent: Sysvar<'info, Rent>,
```

### Minting Process

1. **Create Mint Account**: If not provided by the user, create a new mint account with 0 decimals (NFT standard)
2. **Create Token Account**: Ensure the studio has a token account to receive the NFT
3. **Mint One Token**: Mint a single token to the studio's token account
4. **Create Metadata**: Create metadata for the NFT with:
   - Name: "SonicPact: [Deal Name]"
   - Symbol: "SONIC"
   - URI: URL to metadata JSON (hosted on Arweave or IPFS)
   - Creators: Both the studio and celebrity with 50% share each
   - Royalty: 5% (500 basis points)

### Metadata JSON Structure

The off-chain metadata JSON will contain:

```json
{
  "name": "SonicPact: [Deal Name]",
  "description": "Official collaboration between [Studio Name] and [Celebrity Name]",
  "image": "https://sonicpact.io/nft-images/[Deal ID].png",
  "attributes": [
    {
      "trait_type": "Deal Type",
      "value": "Gaming Collaboration"
    },
    {
      "trait_type": "Studio",
      "value": "[Studio Name]"
    },
    {
      "trait_type": "Celebrity",
      "value": "[Celebrity Name]"
    },
    {
      "trait_type": "Payment Amount",
      "value": "[Payment Amount] SOL"
    },
    {
      "trait_type": "Duration",
      "value": "[Duration] Days"
    },
    {
      "trait_type": "Completed On",
      "value": "[Timestamp]"
    }
  ]
}
```

## Future Extensions

In future versions, we may implement:

1. **Split NFT Ownership**: Mint a pair of NFTs, with one going to each party
2. **Certificate NFT**: Create a special NFT with a visual certificate design
3. **NFT Marketplace Integration**: Enable easy listing of the NFT on marketplaces
4. **Royalty Enforcement**: Ensure royalties are respected in secondary sales

## Implementation Notes

When integrating this feature, the front-end will need to:

1. Prepare and upload the metadata JSON to Arweave or IPFS
2. Create the necessary accounts (mint, token accounts)
3. Call the complete_deal instruction with all required accounts
4. Display the minted NFT to the user with options to view in a wallet or explorer

This documentation outlines the planned NFT minting feature that will serve as a key differentiator for the SonicPact platform, creating tangible, on-chain proof of collaborations between studios and celebrities. 