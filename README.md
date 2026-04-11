# Stellar-Kind Project Overview

Stellar-Kind is an open-source Web3 crowdfunding platform designed for the Stellar ecosystem. It combines a modern frontend, a backend service layer, smart contracts, and support tooling to enable creators, backers, and community participants to launch and manage milestone-based campaigns.

## Vision

Stellar-Kind empowers mission-driven creators to raise funds transparently and securely using Stellar smart contracts. Donors can support campaigns, track milestone progress, and receive rewards while the platform manages payments, on-chain tracking, notifications, and governance support.

## How the Project Works

### 1. Frontend

The `frontend/` app is the user-facing interface. It lets users:
- browse and discover campaigns
- create and manage campaigns
- connect wallets and authenticate
- view campaign milestones, donations, and progress
- complete support workflows and share campaigns

The frontend communicates with the backend API to perform actions, and it may also interact with Stellar smart contracts for on-chain operations.

### 2. Backend / Service Layer

The `backend/` service is the project’s core runtime layer. It handles:
- REST/GraphQL APIs for the frontend and external apps
- authentication and wallet identity
- user profiles, roles, and permissions
- campaign creation, funding, milestone tracking
- payment routing, escrow release, refunds
- notifications by email, SMS, or webhook
- database persistence, migrations, and data seeding
- contract orchestration and event processing

### 3. Contracts

The `contract/` layer contains Soroban/Rust contracts for Stellar. These contracts enforce platform rules on-chain, such as:
- campaign lifecycle and milestone release
- escrow and donor fund custody
- reputation, rewards, and NFT issuance
- governance voting and proposal execution

### 4. Data / Indexing

The `data/` domain supports analytics and search:
- `data/indexer/` indexes on-chain events for campaign and donation history
- `data/analytics/` builds performance dashboards and campaign metrics
- `data/search/` provides filtering, discovery, ranking, and full-text search

### 5. Infrastructure & Tooling

The `infra/` domain contains deployment and runtime configuration:
- Docker and Docker Compose for local development
- Kubernetes manifests for staging or production
- deployment pipelines and hosting configuration

### 6. Quality & Security

The `quality/` folder defines QA workflows:
- automated testing strategies (unit, integration, E2E, contract)
- static analysis and linting guidance
- security workflows such as audits and dependency scans

### 7. Community & Growth

The `community/` section supports platform growth and engagement:
- creator dashboard planning
- campaign analytics and author tools
- referral and social sharing workflows
- feedback, support, and contributor programs

### 8. Scripts

The `scripts/` folder contains helper automation utilities:
- local development bootstrapping
- build and deploy helper scripts
- migration helpers

## Project Structure

- `frontend/` — Web application source and UI components
- `backend/` — API, business logic, auth, database, payments, notifications
- `contract/` — Soroban/Rust smart contracts and tests
- `infra/` — Infrastructure config for Docker and Kubernetes
- `data/` — Indexing, analytics, and search/discovery services
- `quality/` — Testing, security, and QA guidance
- `community/` — Growth and engagement planning
- `scripts/` — Automation and workflow helpers
- `starter-code/` — Example snippets and templates
- `CONTRIBUTING.md` — Contribution workflow and standards
- `RENAMING_SUMMARY.md` — Rename history and project updates

## Key Features and Flow

### Campaign lifecycle
1. A creator signs in and creates a campaign.
2. The campaign defines funding goals, milestones, and rewards.
3. Donors connect wallets, browse campaigns, and commit funds.
4. Donations are routed through escrow and contract-managed milestones.
5. Milestone completion triggers review, release, and rewards.
6. On-chain events are indexed, analyzed, and displayed in dashboards.

### Authentication and identity
- Wallet-based auth for Stellar users
- User profiles with KYC/verification status
- Role-based access control for creators, reviewers, admins, backers
- Reputation and badge systems for contributors

### Payments and escrow
- Donation routing tracks funds per campaign and milestone
- Escrow contracts hold donor capital until milestones are verified
- Partial releases and refunds are supported
- Payment events generate notifications and updates

### Data and discovery
- Blockchain indexer tracks contract events and histories
- Analytics engines derive campaign performance metrics
- Search services enable campaign discovery and filtering

### Advanced product capabilities
- DAO/governance planning for voting and treasury decisions
- Recurring contributions and subscription support
- NFT/reward support for donor badges and milestone collectibles
- Cross-chain or oracle integration for price feeds and identity attestations

## How to Run the Project

### Backend
- `cd backend`
- `bun install` or `npm install`
- `bun run dev` or `node src/index.ts`
- configure `.env` from `backend/.env.example`

### Scripts
- `./scripts/local-dev.sh` — local development bootstrap
- `./scripts/build.sh` — build helper
- `./scripts/deploy.sh` — deploy helper
- `./scripts/migrate.sh` — migration helper

### Infrastructure
- `infra/docker/docker-compose.yml` — local Docker environment
- `infra/kubernetes/deployment.yml` — Kubernetes deployment example

## Notes

- This README is the central source of truth for the current project structure.
- Standalone doc files were removed to focus the repository on code and live workflows.
- The project is intentionally organized for modular development and future expansion.

## Contribution and Community

See `CONTRIBUTING.md` for:
- branch naming and commit rules
- PR workflow
- code quality standards
- testing expectations

Join the community:
- Telegram: https://t.me/+CWeVHOZb5no1NmQx
