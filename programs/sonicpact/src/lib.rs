use anchor_lang::prelude::*;

declare_id!("GrujK4NkA76V7BvkS66t1gAPXJKJgmF6dXoRGiq7CeoM");

#[program]
pub mod sonicpact {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
