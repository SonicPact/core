import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Sonicpact } from "../target/types/sonicpact";
import { expect } from "chai";

describe("sonicpact", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Sonicpact as Program<Sonicpact>;

  // Test accounts
  const platformAuthority = anchor.web3.Keypair.generate();
  const studio = anchor.web3.Keypair.generate();
  const celebrity = anchor.web3.Keypair.generate();

  // PDAs
  let platformPDA: anchor.web3.PublicKey;
  let dealPDA: anchor.web3.PublicKey;
  let dealVaultPDA: anchor.web3.PublicKey;

  // Constants
  const PLATFORM_FEE = 250; // 2.5%

  before(async () => {
    // Airdrop SOL to test accounts and WAIT for confirmation
    const airdropPlatformAuthority = await provider.connection.requestAirdrop(
      platformAuthority.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropPlatformAuthority);

    const airdropStudio = await provider.connection.requestAirdrop(
      studio.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropStudio);

    const airdropCelebrity = await provider.connection.requestAirdrop(
      celebrity.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropCelebrity);

    // Derive PDAs
    [platformPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    // Verify the accounts have received SOL
    const platformAuthorityBalance = await provider.connection.getBalance(
      platformAuthority.publicKey
    );
    console.log(
      `Platform authority balance: ${
        platformAuthorityBalance / anchor.web3.LAMPORTS_PER_SOL
      } SOL`
    );

    const studioBalance = await provider.connection.getBalance(
      studio.publicKey
    );
    console.log(
      `Studio balance: ${studioBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`
    );
  });

  it("Initializes the platform", async () => {
    try {
      await program.methods
        .initializePlatform(new anchor.BN(PLATFORM_FEE))
        .accounts({
          authority: platformAuthority.publicKey,
        })
        .signers([platformAuthority])
        .rpc();

      const platformAccount = await program.account.platform.fetch(platformPDA);
      expect(platformAccount.authority.toString()).to.equal(
        platformAuthority.publicKey.toString()
      );
      expect(platformAccount.platformFee.toNumber()).to.equal(PLATFORM_FEE);
      expect(platformAccount.totalDeals.toNumber()).to.equal(0);
    } catch (error) {
      console.error("Error initializing platform:", error);
      throw error;
    }
  });

  it("Creates a new deal", async () => {
    try {
      const dealTerms = {
        paymentAmount: new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL),
        durationDays: 30,
        usageRights: { full: {} },
        exclusivity: true,
      };

      await program.methods
        .createDeal(
          dealTerms,
          "Game Character Endorsement",
          "Celebrity will endorse and voice a character in the upcoming game"
        )
        .accounts({
          platform: platformPDA,
          studio: studio.publicKey,
          celebrity: celebrity.publicKey,
        })
        .signers([studio])
        .rpc();

      const totalDeals = await program.account.platform.fetch(platformPDA);

      [dealPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("deal"),
          platformPDA.toBuffer(),
          Buffer.from(
            new Uint8Array(
              totalDeals.totalDeals.sub(new anchor.BN(1)).toArray("le", 8)
            )
          ),
        ],
        program.programId
      );

      const dealAccount = await program.account.deal.fetch(dealPDA);
      expect(dealAccount.studio.toString()).to.equal(
        studio.publicKey.toString()
      );
      expect(dealAccount.celebrity.toString()).to.equal(
        celebrity.publicKey.toString()
      );
      expect(dealAccount.status.proposed).to.not.be.undefined;

      // Derive vault PDA for this deal
      [dealVaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), dealPDA.toBuffer()],
        program.programId
      );
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  });

  it("Celebrity accepts the deal", async () => {
    try {
      await program.methods
        .acceptDeal()
        .accounts({
          deal: dealPDA,
          signer: celebrity.publicKey,
        })
        .signers([celebrity])
        .rpc();

      const dealAccount = await program.account.deal.fetch(dealPDA);
      expect(dealAccount.status.accepted).to.not.be.undefined;
    } catch (error) {
      console.error("Error accepting deal:", error);
      throw error;
    }
  });

  it("Studio funds the deal", async () => {
    try {
      const fundAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

      await program.methods
        .fundDeal(fundAmount)
        .accounts({
          deal: dealPDA,
          studio: studio.publicKey,
          platform: platformPDA,
        })
        .signers([studio])
        .rpc();

      const dealAccount = await program.account.deal.fetch(dealPDA);
      expect(dealAccount.status.funded).to.not.be.undefined;
      expect(dealAccount.fundedAmount.toNumber()).to.equal(
        fundAmount.toNumber()
      );

      // Check that funds were transferred to the vault
      const vaultBalance = await provider.connection.getBalance(dealVaultPDA);
      expect(vaultBalance).to.equal(fundAmount.toNumber());
    } catch (error) {
      console.error("Error funding deal:", error);
      throw error;
    }
  });

  it("Completes the deal and releases funds", async () => {
    try {
      const celebrityBalanceBefore = await provider.connection.getBalance(
        celebrity.publicKey
      );
      const platformAuthorityBalanceBefore =
        await provider.connection.getBalance(platformAuthority.publicKey);

      await program.methods
        .completeDeal()
        .accounts({
          deal: dealPDA,
          signer: studio.publicKey,
          studio: studio.publicKey,
          celebrity: celebrity.publicKey,
          platform: platformPDA,
          platformAuthority: platformAuthority.publicKey,
        })
        .signers([studio])
        .rpc();

      const dealAccount = await program.account.deal.fetch(dealPDA);
      expect(dealAccount.status.completed).to.not.be.undefined;

      // Check that funds were transferred correctly
      const celebrityBalanceAfter = await provider.connection.getBalance(
        celebrity.publicKey
      );
      const platformAuthorityBalanceAfter =
        await provider.connection.getBalance(platformAuthority.publicKey);
      const vaultBalanceAfter = await provider.connection.getBalance(
        dealVaultPDA
      );

      // Calculate expected amounts
      const totalAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
      const platformFeeAmount = Math.floor(
        (totalAmount * PLATFORM_FEE) / 10000
      );
      const celebrityAmount = totalAmount - platformFeeAmount;

      expect(vaultBalanceAfter).to.equal(0);
      expect(celebrityBalanceAfter - celebrityBalanceBefore).to.equal(
        celebrityAmount
      );
      expect(
        platformAuthorityBalanceAfter - platformAuthorityBalanceBefore
      ).to.equal(platformFeeAmount);
    } catch (error) {
      console.error("Error completing deal:", error);
      throw error;
    }
  });

  it("Creates and cancels a deal", async () => {
    try {
      const dealTerms = {
        paymentAmount: new anchor.BN(2 * anchor.web3.LAMPORTS_PER_SOL),
        durationDays: 60,
        usageRights: { limited: {} },
        exclusivity: false,
      };

      await program.methods
        .createDeal(
          dealTerms,
          "Game Promotion",
          "Celebrity will promote the game on social media"
        )
        .accounts({
          platform: platformPDA,
          studio: studio.publicKey,
          celebrity: celebrity.publicKey,
        })
        .signers([studio])
        .rpc();

      const totalDeals = await program.account.platform.fetch(platformPDA);

      [dealPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("deal"),
          platformPDA.toBuffer(),
          Buffer.from(
            new Uint8Array(
              totalDeals.totalDeals.sub(new anchor.BN(1)).toArray("le", 8)
            )
          ),
        ],
        program.programId
      );

      // Derive vault PDA for this deal
      [dealVaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), dealPDA.toBuffer()],
        program.programId
      );

      // Cancel the deal
      await program.methods
        .cancelDeal()
        .accounts({
          deal: dealPDA,
          signer: studio.publicKey,
          studio: studio.publicKey,
        })
        .signers([studio])
        .rpc();

      const dealAccount = await program.account.deal.fetch(dealPDA);
      expect(dealAccount.status.cancelled).to.not.be.undefined;
    } catch (error) {
      console.error("Error creating/cancelling deal:", error);
      throw error;
    }
  });

  it("Updates platform fee", async () => {
    try {
      const newFee = 300; // 3%

      await program.methods
        .updatePlatformFee(new anchor.BN(newFee))
        .accounts({
          platform: platformPDA,
          authority: platformAuthority.publicKey,
        })
        .signers([platformAuthority])
        .rpc();

      const platformAccount = await program.account.platform.fetch(platformPDA);
      expect(platformAccount.platformFee.toNumber()).to.equal(newFee);
    } catch (error) {
      console.error("Error updating platform fee:", error);
      throw error;
    }
  });
});
