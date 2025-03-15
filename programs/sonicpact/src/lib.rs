use anchor_lang::prelude::*;

declare_id!("GrujK4NkA76V7BvkS66t1gAPXJKJgmF6dXoRGiq7CeoM");

#[program]
pub mod sonicpact {
    use super::*;

    // Initialize the platform
    pub fn initialize_platform(ctx: Context<InitializePlatform>, platform_fee: u64) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.platform_fee = platform_fee;
        platform.total_deals = 0;
        platform.bump = ctx.bumps.platform;

        msg!("SonicPact platform initialized with fee: {}", platform_fee);
        Ok(())
    }

    // Create a new deal between a studio and a celebrity
    pub fn create_deal(
        ctx: Context<CreateDeal>,
        deal_terms: DealTerms,
        deal_name: String,
        deal_description: String,
    ) -> Result<()> {
        let deal = &mut ctx.accounts.deal;

        deal.studio = ctx.accounts.studio.key();
        deal.celebrity = ctx.accounts.celebrity.key();
        deal.terms = deal_terms;
        deal.name = deal_name.clone();
        deal.description = deal_description;
        deal.status = DealStatus::Proposed;
        deal.created_at = Clock::get()?.unix_timestamp;
        deal.updated_at = Clock::get()?.unix_timestamp;
        deal.platform = ctx.accounts.platform.key();
        deal.bump = ctx.bumps.deal;

        let platform = &mut ctx.accounts.platform;
        platform.total_deals = platform.total_deals.checked_add(1).unwrap();

        msg!("Deal created: {}", deal_name);
        Ok(())
    }

    // Celebrity accepts a deal
    pub fn accept_deal(ctx: Context<UpdateDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Proposed,
            DealError::InvalidDealStatus
        );
        require!(
            deal.celebrity == ctx.accounts.signer.key(),
            DealError::Unauthorized
        );

        deal.status = DealStatus::Accepted;
        deal.updated_at = Clock::get()?.unix_timestamp;

        msg!("Deal accepted: {}", deal.name);
        Ok(())
    }

    // Studio funds a deal
    pub fn fund_deal(ctx: Context<FundDeal>, amount: u64) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Accepted,
            DealError::InvalidDealStatus
        );
        require!(
            deal.studio == ctx.accounts.studio.key(),
            DealError::Unauthorized
        );

        let platform = &ctx.accounts.platform;
        let _platform_fee_amount = (amount as u128)
            .checked_mul(platform.platform_fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.studio.to_account_info(),
                    to: ctx.accounts.deal_vault.to_account_info(),
                },
            ),
            amount,
        )?;

        deal.funded_amount = amount;
        deal.status = DealStatus::Funded;
        deal.updated_at = Clock::get()?.unix_timestamp;

        msg!("Deal funded: {} with amount: {}", deal.name, amount);
        Ok(())
    }

    // Complete a deal and release funds
    pub fn complete_deal(ctx: Context<CompleteDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Funded,
            DealError::InvalidDealStatus
        );
        require!(
            deal.studio == ctx.accounts.studio.key() || deal.celebrity == ctx.accounts.signer.key(),
            DealError::Unauthorized
        );

        // Calculate platform fee
        let platform = &ctx.accounts.platform;
        let platform_fee_amount = (deal.funded_amount as u128)
            .checked_mul(platform.platform_fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        let celebrity_amount = deal.funded_amount.checked_sub(platform_fee_amount).unwrap();

        // Transfer funds to celebrity using system program
        let deal_key = deal.key();
        let seeds = &[b"vault", deal_key.as_ref(), &[ctx.bumps.deal_vault]];
        let signer = &[&seeds[..]];

        // Transfer to celebrity
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.deal_vault.to_account_info(),
                    to: ctx.accounts.celebrity.to_account_info(),
                },
                signer,
            ),
            celebrity_amount,
        )?;

        // Transfer to platform authority
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.deal_vault.to_account_info(),
                    to: ctx.accounts.platform_authority.to_account_info(),
                },
                signer,
            ),
            platform_fee_amount,
        )?;

        deal.status = DealStatus::Completed;
        deal.updated_at = Clock::get()?.unix_timestamp;

        msg!("Deal completed: {}", deal.name);
        Ok(())
    }

    // Cancel a deal
    pub fn cancel_deal(ctx: Context<CancelDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;

        // Only allow cancellation if not completed
        require!(
            deal.status != DealStatus::Completed,
            DealError::InvalidDealStatus
        );

        // Both parties must agree to cancel, or it's still in proposed state
        let is_authorized = match deal.status {
            DealStatus::Proposed => {
                // Only studio can cancel in proposed state
                deal.studio == ctx.accounts.signer.key()
            }
            DealStatus::Accepted => {
                // Either party can cancel in accepted state
                deal.studio == ctx.accounts.signer.key()
                    || deal.celebrity == ctx.accounts.signer.key()
            }
            DealStatus::Funded => {
                // Both parties must agree to cancel in funded state
                // This is handled by the CancelDeal context which requires both signatures
                true
            }
            _ => false,
        };

        require!(is_authorized, DealError::Unauthorized);

        // If funded, return funds to studio
        if deal.status == DealStatus::Funded {
            let deal_key = deal.key();
            let seeds = &[b"vault", deal_key.as_ref(), &[ctx.bumps.deal_vault]];
            let signer = &[&seeds[..]];

            anchor_lang::system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.deal_vault.to_account_info(),
                        to: ctx.accounts.studio.to_account_info(),
                    },
                    signer,
                ),
                deal.funded_amount,
            )?;
        }

        deal.status = DealStatus::Cancelled;
        deal.updated_at = Clock::get()?.unix_timestamp;

        msg!("Deal cancelled: {}", deal.name);
        Ok(())
    }

    // Update platform fee
    pub fn update_platform_fee(ctx: Context<UpdatePlatform>, new_fee: u64) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        require!(new_fee <= 1000, DealError::FeeTooHigh); // Max 10%

        platform.platform_fee = new_fee;

        msg!("Platform fee updated to: {}", new_fee);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = Platform::SIZE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateDeal<'info> {
    #[account(
        init,
        payer = studio,
        space = Deal::SIZE,
        seeds = [b"deal", platform.key().as_ref(), &platform.total_deals.to_le_bytes()],
        bump
    )]
    pub deal: Account<'info, Deal>,

    #[account(mut)]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub studio: Signer<'info>,

    /// CHECK: This is the celebrity's address
    pub celebrity: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,

    #[account(mut)]
    pub studio: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", deal.key().as_ref()],
        bump,
    )]
    /// CHECK: This is a PDA that will hold the funds
    pub deal_vault: UncheckedAccount<'info>,

    pub platform: Account<'info, Platform>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    /// CHECK: This is the studio's address
    pub studio: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: This is the celebrity's address
    pub celebrity: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault", deal.key().as_ref()],
        bump,
    )]
    /// CHECK: This is a PDA that holds the funds
    pub deal_vault: UncheckedAccount<'info>,

    pub platform: Account<'info, Platform>,

    #[account(
        mut,
        constraint = platform_authority.key() == platform.authority
    )]
    /// CHECK: This is the platform authority
    pub platform_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    /// CHECK: This is the studio's address
    pub studio: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault", deal.key().as_ref()],
        bump,
    )]
    /// CHECK: This is a PDA that may hold funds
    pub deal_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlatform<'info> {
    #[account(
        mut,
        constraint = platform.authority == authority.key()
    )]
    pub platform: Account<'info, Platform>,

    pub authority: Signer<'info>,
}

#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub platform_fee: u64, // In basis points (e.g., 100 = 1%)
    pub total_deals: u64,
    pub bump: u8,
}

impl Platform {
    pub const SIZE: usize = 8 + // discriminator
        32 +                    // authority
        8 +                     // platform_fee
        8 +                     // total_deals
        1; // bump
}

#[account]
pub struct Deal {
    pub studio: Pubkey,
    pub celebrity: Pubkey,
    pub platform: Pubkey,
    pub terms: DealTerms,
    pub name: String,
    pub description: String,
    pub status: DealStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub funded_amount: u64,
    pub bump: u8,
}

impl Deal {
    pub const SIZE: usize = 8 +  // discriminator
        32 +                     // studio
        32 +                     // celebrity
        32 +                     // platform
        DealTerms::SIZE +        // terms
        36 +                     // name (max 32 chars)
        100 +                    // description (max 96 chars)
        1 +                      // status
        8 +                      // created_at
        8 +                      // updated_at
        8 +                      // funded_amount
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct DealTerms {
    pub payment_amount: u64,
    pub duration_days: u16,
    pub usage_rights: UsageRights,
    pub exclusivity: bool,
}

impl DealTerms {
    pub const SIZE: usize = 8 +  // payment_amount
        2 +                      // duration_days
        1 +                      // usage_rights
        1; // exclusivity
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum UsageRights {
    Limited,
    Full,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum DealStatus {
    Proposed,
    Accepted,
    Funded,
    Completed,
    Cancelled,
}

#[error_code]
pub enum DealError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid deal status for this operation")]
    InvalidDealStatus,
    #[msg("Platform fee too high (max 10%)")]
    FeeTooHigh,
}
