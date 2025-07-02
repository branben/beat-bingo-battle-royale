# Sound Royale Development Workflow

## Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Code Review Process](#code-review-process)
- [Deployment](#deployment)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Docker (for local Supabase)

### Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Start development server: `pnpm dev`

## Development Workflow

### Branch Naming
Format: `{type}/{ticket}-{description}`

Examples:
- `feat/42-audio-upload`
- `fix/87-playback-issues`
- `refactor/123-audio-validation`

### Commit Message Format
```
{type}({scope}): {description}

[optional body]

[optional footer]
```

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Pull Requests
1. Create a draft PR early for WIP features
2. Update PR description with:
   - Description of changes
   - Screenshots/GIFs for UI changes
   - Testing instructions
   - Any breaking changes
3. Request review when ready

## Testing Strategy

### Unit Tests
- Test individual functions and components in isolation
- Mock external dependencies
- File naming: `ComponentName.test.tsx` or `functionName.test.ts`
- Run tests: `pnpm test:unit`

### Integration Tests
- Test component interactions
- Mock only external APIs
- File naming: `ComponentName.integration.test.tsx`
- Run tests: `pnpm test:integration`

### E2E Tests
- Test complete user flows
- Use real backend in test environment
- File naming: `featureName.e2e.test.ts`
- Run tests: `pnpm test:e2e`

### Test Coverage
- Minimum coverage: 90%
- Run coverage: `pnpm test:coverage`
- Exclude non-critical paths from coverage requirements

## Code Review Process

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are present and pass
- [ ] TypeScript types are properly defined
- [ ] Error handling is in place
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed
- [ ] Documentation is updated

### Review Guidelines
- Be constructive and specific
- Focus on code, not the author
- Suggest alternatives when possible
- Keep discussions solution-oriented

## Audio Feature Implementation Guide (Phase 2B)

### Audio Upload Flow
1. Validate file (type, size, duration)
2. Show upload progress
3. Store in Supabase Storage
4. Create database record
5. Update UI with success/error state

### Real-time Voting
1. Subscribe to vote changes
2. Update UI in real-time
3. Handle race conditions
4. Validate votes

### Error Handling
- Network failures
- Invalid files
- Rate limiting
- Storage limits

## Deployment

### Environments
- `main` → Production
- `staging` → Staging
- `develop` → Development

### Deployment Process
1. Merge to `staging` for testing
2. Run all tests
3. Deploy to staging environment
4. Verify functionality
5. Create release PR to `main`

## Troubleshooting

### Common Issues
- **Type errors**: Run `pnpm typecheck`
- **Test failures**: Run `pnpm test --watch`
- **Build issues**: Clear cache with `pnpm clean`

## Resources
- [Project Documentation](/docs/)
- [Supabase Setup Guide](/docs/SUPABASE_SETUP_GUIDE.md)
- [Engineering Notes](/docs/ENGINEERING_NOTES.md)
