// apps/contract/contracts/campaign-escrow/src/lib.rs
use soroban_sdk::{contract, contractimpl, Address, Env, Vec, Symbol, Map, contracterror};

#[contract]
pub struct CampaignEscrow;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    Unauthorized = 2,
    CampaignNotFound = 3,
    InsufficientFunds = 4,
    CampaignNotActive = 5,
    InvalidAmount = 6,
    MilestoneNotFound = 7,
    MilestoneAlreadyCompleted = 8,
}

#[derive(Clone)]
#[contracttype]
pub struct Campaign {
    pub creator: Address,
    pub goal_amount: u64, // Amount in stroops (1 XLM = 10^7 stroops)
    pub current_amount: u64,
    pub status: CampaignStatus,
    pub created_at: u64,
    pub end_date: u64,
    pub milestones: Vec<Milestone>,
}

#[derive(Clone)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub title: Symbol,
    pub description: Symbol,
    pub amount: u64,
    pub status: MilestoneStatus,
    pub completed_at: Option<u64>,
}

#[derive(Clone, Copy)]
#[contracttype]
pub enum CampaignStatus {
    Draft = 0,
    Active = 1,
    Funded = 2,
    Cancelled = 3,
    Completed = 4,
}

#[derive(Clone, Copy)]
#[contracttype]
pub enum MilestoneStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Campaign(u32), // campaign_id -> Campaign
    CampaignCounter,
    Contribution(Address, u32), // (contributor, campaign_id) -> amount
    MilestoneRelease(u32, u32), // (campaign_id, milestone_id) -> released_amount
}

#[contractimpl]
impl CampaignEscrow {
    /// Initialize the contract with admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CampaignCounter, &0u32);
    }

    /// Create a new campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        goal_amount: u64,
        end_date: u64,
        milestones: Vec<Milestone>,
    ) -> u32 {
        creator.require_auth();

        // Validate inputs
        if goal_amount == 0 {
            panic!("Goal amount must be greater than 0");
        }

        if end_date <= env.ledger().timestamp() {
            panic!("End date must be in the future");
        }

        if milestones.is_empty() {
            panic!("Campaign must have at least one milestone");
        }

        // Get next campaign ID
        let mut counter: u32 = env.storage().instance().get(&DataKey::CampaignCounter).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&DataKey::CampaignCounter, &counter);

        // Create campaign
        let campaign = Campaign {
            creator: creator.clone(),
            goal_amount,
            current_amount: 0,
            status: CampaignStatus::Active,
            created_at: env.ledger().timestamp(),
            end_date,
            milestones,
        };

        env.storage().persistent().set(&DataKey::Campaign(counter), &campaign);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "campaign_created"), creator, counter),
            (goal_amount, end_date)
        );

        counter
    }

    /// Contribute to a campaign
    pub fn contribute(env: Env, contributor: Address, campaign_id: u32, amount: u64) {
        contributor.require_auth();

        if amount == 0 {
            panic!("Contribution amount must be greater than 0");
        }

        // Get campaign
        let mut campaign: Campaign = env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic!("Campaign not found"));

        if !matches!(campaign.status, CampaignStatus::Active) {
            panic!("Campaign is not active");
        }

        if env.ledger().timestamp() > campaign.end_date {
            panic!("Campaign has ended");
        }

        // Update campaign amount
        campaign.current_amount += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        // Record contribution
        let existing_contribution: u64 = env.storage()
            .persistent()
            .get(&DataKey::Contribution(contributor.clone(), campaign_id))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::Contribution(contributor.clone(), campaign_id), &(existing_contribution + amount));

        // Check if campaign is now funded
        if campaign.current_amount >= campaign.goal_amount {
            campaign.status = CampaignStatus::Funded;
            env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        }

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "contribution_made"), contributor, campaign_id),
            amount
        );
    }

    /// Release milestone funds (only campaign creator)
    pub fn release_milestone(env: Env, campaign_id: u32, milestone_id: u32) {
        // Get campaign
        let mut campaign: Campaign = env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic!("Campaign not found"));

        campaign.creator.require_auth();

        if !matches!(campaign.status, CampaignStatus::Funded) {
            panic!("Campaign must be funded to release milestones");
        }

        // Find and validate milestone
        let milestone_index = campaign.milestones
            .iter()
            .position(|m| m.id == milestone_id)
            .unwrap_or_else(|| panic!("Milestone not found"));

        let mut milestone = campaign.milestones.get(milestone_index).unwrap();

        if matches!(milestone.status, MilestoneStatus::Completed) {
            panic!("Milestone already completed");
        }

        // Check if previous milestones are completed (if not the first)
        if milestone_id > 0 {
            for i in 0..milestone_id {
                let prev_milestone = campaign.milestones.get(i as u32).unwrap();
                if !matches!(prev_milestone.status, MilestoneStatus::Completed) {
                    panic!("Previous milestones must be completed first");
                }
            }
        }

        // Mark milestone as completed
        milestone.status = MilestoneStatus::Completed;
        milestone.completed_at = Some(env.ledger().timestamp());

        // Update milestone in campaign
        campaign.milestones.set(milestone_index as u32, milestone.clone());

        // Check if all milestones are completed
        let all_completed = campaign.milestones
            .iter()
            .all(|m| matches!(m.status, MilestoneStatus::Completed));

        if all_completed {
            campaign.status = CampaignStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        // Record milestone release
        env.storage()
            .persistent()
            .set(&DataKey::MilestoneRelease(campaign_id, milestone_id), &milestone.amount);

        // Transfer funds to creator (in a real implementation, this would use token transfer)
        // For now, just emit event
        env.events().publish(
            (Symbol::new(&env, "milestone_released"), campaign.creator, campaign_id, milestone_id),
            milestone.amount
        );
    }

    /// Get campaign details
    pub fn get_campaign(env: Env, campaign_id: u32) -> Campaign {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic!("Campaign not found"))
    }

    /// Get contribution amount for a user and campaign
    pub fn get_contribution(env: Env, contributor: Address, campaign_id: u32) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(contributor, campaign_id))
            .unwrap_or(0)
    }

    /// Get total campaigns count
    pub fn get_campaign_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::CampaignCounter).unwrap_or(0)
    }
}