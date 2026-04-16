🌟 Stellar-Kind



## Overview

Stellar-Kind is an open-source Web3 crowdfunding platform that reimagines how campaigns are funded and how trust is established between creators and backers. Built on the [Stellar](https://stellar.org) blockchain and powered by [Soroban](https://soroban.stellar.org) smart contracts, it replaces the traditional all-or-nothing donation model with a transparent, milestone-gated escrow system.

### The Problem

Traditional crowdfunding platforms suffer from a fundamental trust gap:

- Backers send money upfront with no guarantee it will be used as promised
- Creators receive full funds before delivering any results
- Disputes are resolved by centralized intermediaries, not transparent rules
- There is no on-chain record of how funds were spent or when milestones were reached

### The Solution

Stellar-Kind solves this by putting the rules on-chain. When a creator launches a campaign, they define a set of milestones — each with a title, a target amount, and a due date. Backer contributions are locked in a Soroban smart contract. Funds are only released to the creator when a milestone is verified as complete, enforced sequentially by the contract itself. No milestone, no money.

This creates a system where:

- **Backers** can contribute with confidence, knowing funds are protected by code, not promises
- **Creators** have a clear, structured path to funding that rewards real progress
- **Reviewers** provide an independent verification layer before funds move
- **Everyone** can audit the full campaign history on-chain at any time

### Who It's For

Stellar-Kind is designed for:

- **Open-source developers** seeking community-backed funding for software projects
- **Social impact organizations** that need transparent fund management for donors
- **Independent creators** — artists, writers, educators — who want to build trust with their audience
- **DAOs and Web3 communities** looking for a native, on-chain fundraising tool
- **Any creator** who wants to prove accountability and build long-term backer relationships

### Core Actors

| Role | Description |
|---|---|
| **Creator** | Launches campaigns, defines milestones, submits completion evidence, and requests fund releases |
| **Backer** | Browses campaigns, connects a Stellar wallet, and contributes funds held in escrow |
| **Reviewer** | Independently verifies milestone completion before the contract releases funds |
| **Admin** | Manages platform configuration, user roles, KYC status, and governance settings |

---

## Features

### Milestone-Based Escrow
Funds contributed to a campaign are locked in a Soroban smart contract. The creator defines milestones upfront — each with a specific funding amount. The contract enforces sequential completion: milestone 2 cannot be released until milestone 1 is verified complete. This prevents partial delivery and protects backers at every stage.

### Wallet-Native Authentication
There are no passwords on Stellar-Kind. Users authenticate by signing a challenge with their Stellar wallet (e.g., Freighter, Albedo). The backend verifies the signature via the `x-wallet-address` header. This means identity is tied to cryptographic ownership, not a username and password stored in a database.

### Role-Based Access Control
The platform enforces granular permissions across four roles — `admin`, `creator`, `reviewer`, and `backer`. Each role has a defined set of allowed actions. For example, only a `creator` can request a milestone release, and only a `reviewer` can approve it. Permissions are checked server-side on every protected route.

### KYC & Reputation System
Each user profile carries a `kycVerified` flag and a numeric `reputation` score. KYC verification adds a layer of identity assurance for high-value campaigns. Reputation scores are updated based on on-chain activity — successful campaigns, timely milestone completions, and backer feedback — creating a trust graph that compounds over time.

### Real-Time Notifications
The notification service supports three channels out of the box:
- **Email** — via SendGrid or Mailgun for campaign updates, milestone approvals, and fund releases
- **SMS** — via Twilio for time-sensitive alerts
- **Webhooks** — for integrations with external tools, dashboards, or DAO tooling

### On-Chain Event Indexer
Every significant contract action — campaign creation, contribution, milestone release — emits a Soroban event. The indexer service listens to these events and writes them to the off-chain database, making the full campaign history queryable via the REST API without requiring a direct RPC call to the chain for every request.

### Analytics & Search
The analytics engine tracks campaign conversion rates, donation velocity, backer retention, and milestone completion rates. The search service supports full-text discovery across campaign titles and descriptions, with filters for category, funding status, and trending campaigns — powered by ElasticSearch or Meilisearch.

### NFT Rewards *(planned)*
Backers will receive on-chain NFT badges for contributing to campaigns. Milestone completion will mint collectible NFTs for both creators and top backers, creating a permanent, tradeable record of participation.

### DAO Governance *(planned)*
A governance layer will allow token holders to vote on platform parameters — fee structures, reviewer eligibility, dispute resolution — and manage a community treasury funded by platform fees.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│   Campaign UI · Wallet Connect · Milestone Tracker · Dashboard   │
└───────────────────────────┬─────────────────────────────────────┘
                            │  REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express / Bun)                     │
│  Auth · Campaign Logic · Payment Routing · Notification Service  │
└──────┬──────────────────────┬──────────────────────┬────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  PostgreSQL  │    │ Soroban Contract  │    │    Data Services    │
│  (Database)  │    │  (Stellar chain)  │    │  Indexer · Search   │
│              │    │                  │    │  Analytics          │
│ users        │    │ CampaignEscrow   │    │                     │
│ campaigns    │    │ - create_campaign│    │ Listens to on-chain │
│ milestones   │    │ - contribute     │    │ events and writes   │
│ contributions│    │ - release_       │    │ queryable history   │
└─────────────┘    │   milestone      │    └─────────────────────┘
                   └──────────────────┘
```

**Layer responsibilities:**

| Layer | Responsibility |
|---|---|
| **Frontend** | Renders campaign pages, handles wallet connection, displays milestone progress, and calls the backend REST API |
| **Backend** | Validates requests, enforces business rules, manages auth sessions, routes payments, and orchestrates contract calls |
| **Soroban Contract** | Holds funds in escrow, enforces milestone sequencing, emits on-chain events, and executes fund transfers |
| **PostgreSQL** | Stores user profiles, campaign metadata, milestone records, and contribution history off-chain |
| **Indexer** | Subscribes to Soroban contract events and syncs them to the database for fast querying |
| **Search** | Indexes campaign content for full-text discovery and filtered browsing |
| **Analytics** | Aggregates campaign metrics for creator dashboards and platform reporting |

---

## Project Structure

```
Stellar-Kind/
├── frontend/                   # Next.js web application
│   └── ...                     # Pages, components, hooks, styles
│
├── backend/                    # Express API server (Bun runtime)
│   ├── src/
│   │   └── index.ts            # App entry point — starts server on port 4000
│   ├── routes/
│   │   └── api.ts              # Route definitions (/auth, /campaigns)
│   ├── controllers/
│   │   ├── authController.ts   # Sign up / sign in handlers
│   │   └── campaignController.ts # List and create campaign handlers
│   ├── models/
│   │   ├── user.ts             # User interface and UserRole type
│   │   └── campaign.ts         # Campaign and CampaignMilestone interfaces
│   ├── services/
│   │   ├── payment.ts          # Donation routing and milestone fund release
│   │   └── notification.ts     # Email, SMS, and webhook dispatch
│   ├── auth/
│   │   ├── wallet.ts           # Wallet auth middleware (x-wallet-address header)
│   │   └── permissions.ts      # Role-based access control (requireRole guard)
│   ├── db/
│   │   ├── orm.ts              # PostgreSQL pool and query helper
│   │   └── seed.ts             # Initial admin user and campaign seed data
│   ├── migrations/
│   │   └── 0001_init.sql       # Schema: users, campaigns, milestones tables
│   ├── .env.example            # Environment variable template
│   └── package.json            # Backend dependencies (express, pg, cors)
│
├── contract/                   # Soroban smart contracts (Rust)
│   └── src/
│       └── lib.rs              # CampaignEscrow contract implementation
│
├── data/
│   ├── indexer/                # On-chain event indexer (SubQuery or custom)
│   ├── analytics/              # Campaign metrics, ETL pipelines, dashboards
│   └── search/                 # Full-text search (ElasticSearch / Meilisearch)
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml  # Local stack: frontend + backend + postgres
│   └── kubernetes/
│       └── deployment.yml      # K8s Deployment + ClusterIP Service (2 replicas)
│
├── quality/                    # Testing strategy, security audits, CI tooling
├── community/                  # Creator tools, referral links, onboarding docs
├── scripts/
│   ├── local-dev.sh            # Bootstrap full local environment
│   ├── build.sh                # Build all services
│   ├── deploy.sh               # Deploy to target environment
│   └── migrate.sh              # Run database migrations
├── starter-code/               # Reference implementations and templates
│   ├── campaign-escrow.rs      # Full CampaignEscrow contract source
│   ├── stellar-utils.ts        # Stellar SDK utility functions
│   ├── CampaignCard.tsx        # React campaign card component
│   └── useCampaigns.ts         # React Query hooks for campaign data
└── CONTRIBUTING.md             # Contribution guide
```

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Bun](https://bun.sh) | >= 1.3.1 | Backend runtime and package manager |
| [Node.js](https://nodejs.org) | >= 20 | Frontend tooling |
| [Rust](https://rustup.rs) | latest stable | Smart contract compilation |
| [PostgreSQL](https://postgresql.org) | 15 | Off-chain database |
| [Docker](https://docker.com) | any | Optional — runs the full local stack |

### 1. Clone the repository

```bash
git clone https://github.com/stellar-kind/stellar-kind.git
cd stellar-kind
```

### 2. Run the full local stack with Docker

The fastest way to get everything running:

```bash
docker compose -f infra/docker/docker-compose.yml up
```

This starts three services:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

### 3. Run the backend manually

If you prefer to run the backend without Docker:

```bash
cd backend
cp .env.example .env        # copy and fill in your values
bun install
bun run dev
```

**Required environment variables (`.env`):**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stellar-kind
PORT=4000
JWT_SECRET=replace-me
```

### 4. Apply database migrations

Creates the `users`, `campaigns`, and `milestones` tables:

```bash
./scripts/migrate.sh
```

### 5. Seed the database (optional)

Inserts a default admin user and a sample active campaign:

```bash
cd backend && bun run db/seed.ts
```

### Helper scripts

| Script | What it does |
|---|---|
| `./scripts/local-dev.sh` | Bootstraps the full local environment in one command |
| `./scripts/build.sh` | Builds frontend, backend, and contracts |
| `./scripts/deploy.sh` | Deploys to the configured target environment |
| `./scripts/migrate.sh` | Runs all pending database migrations |

---

## Smart Contracts

Contracts live in `contract/` and are written in **Rust** using the [Soroban SDK](https://soroban.stellar.org). The starter implementation is also available in `starter-code/campaign-escrow.rs`.

### CampaignEscrow

The `CampaignEscrow` contract is the heart of the platform. It manages the complete campaign lifecycle on-chain — from creation through funding to milestone-by-milestone fund release.

**Storage layout:**

| Key | Type | Description |
|---|---|---|
| `Admin` | `Address` | Platform admin set at initialization |
| `CampaignCounter` | `u32` | Auto-incrementing campaign ID |
| `Campaign(id)` | `Campaign` | Full campaign state |
| `Contribution(addr, id)` | `u64` | Total contributed by an address to a campaign |
| `MilestoneRelease(cid, mid)` | `u64` | Amount released for a specific milestone |

**Contract functions:**

| Function | Access | Description |
|---|---|---|
| `initialize(admin)` | One-time | Deploys the contract and sets the platform admin |
| `create_campaign(creator, goal, end_date, milestones)` | Creator | Creates a new campaign; validates goal > 0, end date in future, at least one milestone; returns `campaign_id` |
| `contribute(contributor, campaign_id, amount)` | Any | Donates to an active campaign; auto-transitions status to `Funded` when goal is reached |
| `release_milestone(campaign_id, milestone_id)` | Creator | Marks a milestone complete and releases its funds; enforces sequential order |
| `get_campaign(campaign_id)` | Read | Returns full campaign state |
| `get_contribution(contributor, campaign_id)` | Read | Returns total contributed by an address |
| `get_campaign_count()` | Read | Returns total number of campaigns created |

**Campaign lifecycle:**

```
Draft ──► Active ──► Funded ──► Completed
                 └──► Cancelled
```

**Milestone lifecycle:**

```
Pending ──► InProgress ──► Completed
                       └──► Cancelled
```

**On-chain events emitted:**

| Event | Trigger | Payload |
|---|---|---|
| `campaign_created` | `create_campaign` | `(goal_amount, end_date)` |
| `contribution_made` | `contribute` | `amount` |
| `milestone_released` | `release_milestone` | `milestone.amount` |

All amounts are denominated in **stroops** (1 XLM = 10,000,000 stroops).

### Building contracts

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

### Running contract tests

```bash
cd contract
cargo test
```

---

## API Reference

Base URL: `http://localhost:4000/api`

All responses are JSON. Protected routes require the wallet authentication header.

### Authentication header

```http
x-wallet-address: G...YOUR_STELLAR_PUBLIC_KEY
```

---

### Auth endpoints

#### `POST /auth/signup`

Register a new user account.

**Request body:**
```json
{
  "email": "creator@example.com",
  "password": "...",
  "walletAddress": "G..."
}
```

**Response `201`:**
```json
{
  "email": "creator@example.com",
  "walletAddress": "G...",
  "message": "User created"
}
```

---

#### `POST /auth/signin`

Sign in and receive a session token.

**Request body:**
```json
{
  "email": "creator@example.com",
  "password": "..."
}
```

**Response `200`:**
```json
{
  "token": "jwt-token",
  "email": "creator@example.com"
}
```

---

### Campaign endpoints

#### `GET /campaigns`

List all campaigns.

**Response `200`:**
```json
[
  {
    "id": "campaign-1",
    "title": "Stellar crowdfunding pilot",
    "status": "active"
  }
]
```

---

#### `POST /campaigns` *(requires wallet auth)*

Create a new campaign.

**Request body:**
```json
{
  "title": "My Campaign",
  "description": "What this campaign is about",
  "goalAmount": 5000,
  "currency": "USDC",
  "milestones": [
    { "title": "Phase 1", "amount": 2000, "dueDate": "2026-06-01" },
    { "title": "Phase 2", "amount": 3000, "dueDate": "2026-09-01" }
  ]
}
```

**Response `201`:**
```json
{
  "id": "campaign-1",
  "status": "draft",
  ...
}
```

---

### Data models

**User**
```ts
interface User {
  id: string
  email: string
  walletAddress?: string
  role: 'admin' | 'creator' | 'reviewer' | 'backer'
  reputation: number       // on-chain reputation score
  kycVerified: boolean     // identity verification status
  badges: string[]         // earned NFT badge identifiers
  createdAt: string
  updatedAt: string
}
```

**Campaign**
```ts
interface Campaign {
  id: string
  title: string
  description: string
  creatorId: string
  goalAmount: number
  currentAmount: number
  currency: string           // default: 'USDC'
  status: 'draft' | 'active' | 'funded' | 'cancelled'
  milestones: CampaignMilestone[]
  createdAt: string
  updatedAt: string
}
```

**CampaignMilestone**
```ts
interface CampaignMilestone {
  id: string
  title: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
}
```

---

## Database Schema

The PostgreSQL schema is defined in `backend/migrations/0001_init.sql`.

```sql
-- Users
CREATE TABLE users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  wallet_address  TEXT,
  role            TEXT NOT NULL,
  reputation      INTEGER DEFAULT 0,
  kyc_verified    BOOLEAN DEFAULT FALSE,
  badges          TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  creator_id      TEXT NOT NULL REFERENCES users(id),
  goal_amount     NUMERIC(20, 7) NOT NULL,
  current_amount  NUMERIC(20, 7) DEFAULT 0,
  currency        TEXT DEFAULT 'USDC' NOT NULL,
  status          TEXT DEFAULT 'draft' NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id              TEXT PRIMARY KEY,
  campaign_id     TEXT NOT NULL REFERENCES campaigns(id),
  title           TEXT NOT NULL,
  amount          NUMERIC(20, 7) NOT NULL,
  status          TEXT DEFAULT 'pending' NOT NULL,
  due_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Infrastructure

### Local development (Docker Compose)

```bash
docker compose -f infra/docker/docker-compose.yml up
```

The compose file wires up three containers:

| Container | Image | Port | Notes |
|---|---|---|---|
| `frontend` | Built from `./frontend` | 3000 | Next.js dev server |
| `backend` | Built from `./backend` | 4000 | Express API, connects to `db` |
| `db` | `postgres:15` | 5432 | Credentials: `postgres/postgres` |

### Production (Kubernetes)

```bash
kubectl apply -f infra/kubernetes/deployment.yml
```

The manifest creates:
- A `Deployment` named `stellar-kind-backend` with **2 replicas**
- A `ClusterIP` Service exposing port `4000` internally

Extend this with your own:
- `Ingress` for external traffic routing and TLS termination
- `Secret` resources for `DATABASE_URL` and `JWT_SECRET`
- `PersistentVolumeClaim` for the PostgreSQL data directory
- Horizontal Pod Autoscaler for traffic-based scaling

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **State management** | TanStack Query (React Query) |
| **Backend** | Express.js, TypeScript, Bun runtime |
| **Database** | PostgreSQL 15, raw `pg` driver |
| **Smart contracts** | Rust, Soroban SDK |
| **Blockchain** | Stellar network (testnet / mainnet) |
| **Auth** | Stellar wallet signatures (`x-wallet-address`) |
| **Notifications** | SendGrid / Mailgun (email), Twilio (SMS), webhooks |
| **Search** | ElasticSearch or Meilisearch |
| **Indexer** | SubQuery or custom Soroban event listener |
| **Infra** | Docker Compose (local), Kubernetes (production) |
| **Code formatting** | Biome |

---

## Contributing

We welcome contributions of all kinds — code, tests, documentation, bug reports, and feedback.

### Quick start for contributors

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) — covers branch naming, commit conventions, PR process, and code standards
2. Browse [GitHub Issues](https://github.com/stellar-kind/stellar-kind/issues) for open tasks
3. Look for `good first issue` labels if you're just getting started
4. Join the [Telegram community](https://t.me/+CWeVHOZb5no1NmQx) to introduce yourself

### Branch naming

```bash
feat/123-wallet-authentication    # new features
fix/456-milestone-release-bug     # bug fixes
docs/789-api-reference            # documentation
```

### Commit format

We use [Conventional Commits](https://www.conventionalcommits.org):

```
feat(auth): add wallet signature verification
fix(contract): enforce sequential milestone release
docs(readme): expand architecture section
```

### High-priority contribution areas

| Area | Skills needed |
|---|---|
| Smart contract development | Rust, Soroban SDK |
| Frontend components | React, TypeScript, Tailwind |
| Backend API endpoints | Express, TypeScript, PostgreSQL |
| Blockchain indexer | TypeScript, Stellar SDK |
| Testing | Jest, Playwright, Rust test framework |
| Documentation | Technical writing |

---

## Community

- **Telegram:** [t.me/+CWeVHOZb5no1NmQx](https://t.me/+CWeVHOZb5no1NmQx) — main community chat
- **GitHub Discussions:** for questions, proposals, and design decisions
- **GitHub Issues:** for bug reports and feature requests
- **Security vulnerabilities:** email `security@stellar-kind.org` — do **not** open public issues for security problems

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ | Soroban escrow contract with milestone sequencing |
| ✅ | Express REST API with wallet authentication |
| ✅ | PostgreSQL schema for users, campaigns, milestones |
| ✅ | Role-based access control (admin, creator, reviewer, backer) |
| ✅ | Email, SMS, and webhook notification service |
| ✅ | Docker Compose local stack and Kubernetes manifests |
| 🔄 | On-chain event indexer (SubQuery integration) |
| 🔄 | Full-text campaign search (Meilisearch) |
| 🔄 | Analytics dashboards for creators |
| 🔄 | KYC verification workflow |
| 📋 | NFT donor badges and milestone collectibles |
| 📋 | DAO governance and community treasury |
| 📋 | Mobile wallet support |
| 📋 | Multi-currency support beyond USDC |

---

## License

Stellar-Kind is open-source software. See [LICENSE](./LICENSE) for details.

---

**Trustless, milestone-gated crowdfunding on the Stellar blockchain**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-blueviolet)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-orange)](https://soroban.stellar.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-stable-orange)](https://www.rust-lang.org)

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Smart Contracts](#smart-contracts) · [API Reference](#api-reference) · [Infrastructure](#infrastructure) · [Contributing](#contributing) · [Community](#community)


---

Built with ❤️ on [Stellar](https://stellar.org) · Formerly known as KindFi
