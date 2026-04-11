# Contributing to Stellar-Kind

Welcome to Stellar-Kind! We're excited that you're interested in contributing to our open-source Web3 crowdfunding platform. This document provides comprehensive guidelines for contributors of all experience levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)
- [Security](#security)

## 🤝 Code of Conduct

All contributors must follow our [Code of Conduct](./CODE_OF_CONDUCT.md). It outlines our community standards, values, and expectations for respectful collaboration.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Bun** >= 1.3.1 (see [package.json](./package.json) for exact version)
- **Node.js** >= 20 (for some tooling)
- **Rust** (for smart contract development)
- **Git** with GPG signing configured
- **VS Code** with recommended extensions

### Quick Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/stellar-kind.git
   cd stellar-kind
   ```

2. **Install Dependencies**
   ```bash
   bun run init  # Installs deps and sets up git hooks
   ```

3. **Set up Environment**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp services/supabase/.env.example services/supabase/.env.local
   ```

4. **Start Development**
   ```bash
   task web:dev  # Start web app
   task indexer:dev  # Start indexer (in another terminal)
   ```

## 🛠️ Development Setup

### Environment Configuration

#### Web Application (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
STELLAR_NETWORK=testnet
PINATA_API_KEY=your-pinata-key
```

#### Supabase Service (.env.local)
```env
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ACCESS_TOKEN=your-access-token
DATABASE_URL=postgresql://localhost:54322/postgres
```

### IDE Setup

#### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "rust-lang.rust-analyzer",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode"
  ]
}
```

#### Biome Configuration
The project uses Biome for code formatting. Make sure it's set as your default formatter:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "biome.enabled": true
}
```

## 🔄 Contribution Workflow

### 1. Choose an Issue

- Browse [GitHub Issues](https://github.com/stellar-kind/stellar-kind/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

Follow our branch naming convention:

```bash
# Feature branches
git checkout -b feat/123-user-authentication

# Bug fixes
git checkout -b fix/456-login-validation

# Documentation
git checkout -b docs/789-api-reference

# Always branch from develop
git checkout develop
git pull origin develop
```

### 3. Make Changes

- Write clear, focused commits
- Test your changes thoroughly
- Follow our code standards
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
bun run test

# Run linting
bun run lint

# Run type checking
bun run type-check

# Run specific app tests
cd apps/web && bun run test
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Create a PR against the `develop` branch
- Fill out the PR template completely
- Link to the issue you're solving

## 📝 Code Standards

### TypeScript/JavaScript

#### File Structure
```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── forms/
│   ├── InputField.tsx
│   └── SelectField.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx
```

#### Component Patterns
```tsx
// Good: Clear component structure
interface UserProfileProps {
  user: User
  onUpdate: (user: User) => void
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="user-profile">
      {isEditing ? (
        <EditForm user={user} onSave={onUpdate} />
      ) : (
        <ProfileView user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}
```

#### Custom Hooks
```tsx
// hooks/useAuth.ts
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  }
}
```

### Rust (Smart Contracts)

#### Contract Structure
```rust
// contracts/reputation/src/lib.rs
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    pub fn initialize(env: Env, admin: Address) {
        // Implementation
    }

    pub fn get_reputation(env: Env, user: Address) -> u32 {
        // Implementation
    }
}
```

#### Error Handling
```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    Unauthorized = 2,
    InvalidAmount = 3,
}
```

## 🧪 Testing Guidelines

### Unit Tests
```tsx
// components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests
```tsx
// Integration test for auth flow
describe('Authentication Flow', () => {
  it('allows user to sign in and access protected route', async () => {
    // Test implementation
  })
})
```

### Smart Contract Tests
```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReputationContract);
        let client = ReputationContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        assert_eq!(client.get_admin(), admin);
    }
}
```

## 📋 Commit Guidelines

We use conventional commits:

```bash
# Features
feat: add user authentication with WebAuthn
feat(auth): implement passkey registration flow

# Bug fixes
fix: resolve login validation error
fix(ui): correct button alignment on mobile

# Documentation
docs: update API reference for campaigns
docs(readme): add deployment instructions

# Refactoring
refactor: simplify campaign creation logic
refactor(auth): extract authentication utilities

# Testing
test: add unit tests for user profile component
test(auth): cover edge cases in login flow

# Chores
chore: update dependencies to latest versions
chore(ci): add automated testing workflow
```

### Commit Requirements

- ✅ **Signed commits**: All commits must be GPG signed
- ✅ **Conventional format**: Follow the pattern `type(scope): description`
- ✅ **Clear messages**: Under 72 characters, lowercase
- ✅ **Atomic commits**: Each commit should be a single logical change

## 🔄 Pull Request Process

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD runs linting, tests, and type checking
2. **CodeRabbit AI**: Automated code review for quality and standards
3. **Peer Review**: At least one maintainer reviews the code
4. **Approval**: PR is approved and merged by a maintainer

### Merging

- All PRs are merged using **Squash and merge**
- The squash commit message should be clear and follow conventional commit format
- Delete the feature branch after merging

## 🐛 Issue Reporting

### Bug Reports

**Template:**
```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., macOS, Linux, Windows]
- Browser: [e.g., Chrome 91, Firefox 89]
- Version: [e.g., v1.0.0]

## Additional Context
Add any other context about the problem.
```

### Feature Requests

**Template:**
```markdown
## Feature Summary
Brief description of the feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
Describe your proposed solution.

## Alternative Solutions
Describe any alternative solutions considered.

## Additional Context
Add any other context or screenshots.
```

## 📚 Documentation

### Code Documentation

- **JSDoc/TSDoc** for TypeScript functions and components
- **Rustdoc** for Rust functions and structs
- **README files** for each major component

```tsx
/**
 * User profile component that displays user information and allows editing
 * @param user - The user object containing profile data
 * @param onUpdate - Callback function called when user data is updated
 */
interface UserProfileProps {
  user: User
  onUpdate: (user: User) => void
}
```

### API Documentation

- REST API endpoints documented with OpenAPI/Swagger
- GraphQL schemas self-documenting
- Smart contract functions documented in code

## 🔒 Security

### Security Considerations

- **Never commit secrets** to version control
- **Use environment variables** for sensitive configuration
- **Validate all inputs** on both client and server
- **Follow OWASP guidelines** for web security
- **Regular dependency updates** for security patches

### Reporting Security Issues

- **DO NOT** create public GitHub issues for security vulnerabilities
- Email security concerns to: security@stellar-kind.org
- Include detailed reproduction steps and potential impact

## 🎯 Areas for Contribution

### High Priority
- Smart contract development (Rust/Soroban)
- Frontend component development (React/TypeScript)
- Testing and quality assurance
- Documentation improvements

### Medium Priority
- API development and optimization
- Database schema improvements
- Performance optimizations
- UI/UX enhancements

### Good for Beginners
- Documentation updates
- Unit test writing
- Bug fixes with clear reproduction steps
- Small feature implementations

## 💬 Communication

- **GitHub Issues**: For bugs, features, and general discussion
- **GitHub Discussions**: For questions and community discussion
- **Telegram**: [Stellar-Kind Community](https://t.me/+CWeVHOZb5no1NmQx)

## 🙏 Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Community shoutouts
- Potential future contributor rewards program

## 📞 Getting Help

If you need help:

1. Check existing documentation
2. Search GitHub issues and discussions
3. Ask in our Telegram community
4. Create a GitHub discussion

---

**Thank you for contributing to Stellar-Kind!** 🚀

Your contributions help build a more accessible and transparent crowdfunding platform on Stellar.