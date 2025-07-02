# Git Workflow & Commit Conventions

## Branch Naming

Branches should follow this naming convention:

```
{type}/{ticket}-{description}
```

### Types:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style/formatting changes
- `refactor/` - Code changes that don't fix bugs or add features
- `test/` - Adding or updating tests
- `chore/` - Build process or tooling changes
- `ci/` - CI/CD configuration changes

### Examples:
```
feat/42-audio-upload
fix/123-playback-issue
docs/update-readme
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Scopes:
- `audio` - Audio related features
- `ui` - UI components
- `auth` - Authentication
- `db` - Database changes
- `test` - Test files
- `config` - Configuration changes
- `deps` - Dependency updates
- `ci` - CI/CD configuration
- `docs` - Documentation

### Examples:
```
feat(audio): add audio upload component
fix(ui): fix button alignment issue
docs(readme): update installation instructions
```

## Pull Requests

1. **Create a Draft PR** early for WIP features to get early feedback
2. **Update PR Description** with:
   - Description of changes
   - Screenshots/GIFs for UI changes
   - Testing instructions
   - Any breaking changes
3. **Request Review** when ready

### PR Title Format:
```
<type>(<scope>): <description>
```

### PR Labels:
- `enhancement` - New features or improvements
- `bug` - Bug fixes
- `documentation` - Documentation changes
- `dependencies` - Dependency updates
- `question` - Questions about the code
- `wip` - Work in progress

## Code Review

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

## Best Practices

1. **Keep Commits Atomic**
   - Each commit should represent a single logical change
   - Avoid mixing unrelated changes in a single commit

2. **Write Good Commit Messages**
   - Use the imperative mood ("Add feature" not "Added feature")
   - Keep the subject line under 50 characters
   - Use the body to explain what and why, not how

3. **Rebase Before Pushing**
   ```bash
   git pull --rebase origin main
   ```

4. **Squash Fixup Commits**
   ```bash
   git rebase -i HEAD~3  # For last 3 commits
   ```

5. **Test Before Pushing**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

## Common Tasks

### Starting a New Feature
```bash
git checkout main
git pull
git checkout -b feat/42-awesome-feature
```

### Committing Changes
```bash
# Stage changes
git add .

# Check status
git status

# Commit with message
git commit -m "feat(audio): add audio upload component"

# Push to remote
git push -u origin feat/42-awesome-feature
```

### Updating with Latest Changes
```bash
git checkout main
git pull
git checkout your-branch
git rebase main
```

### Fixing Commit Message
```bash
git commit --amend  # For the last commit
git push --force   # If already pushed
```

## Troubleshooting

### Undo Last Commit
```bash
git reset --soft HEAD~1
```

### Undo Local Changes
```bash
git checkout -- .
```

### View Commit History
```bash
git log --oneline --graph --decorate --all
```

### Clean Up Local Branches
```bash
# Delete merged branches
git branch --merged main | grep -v '^[ *]*main$' | xargs git branch -d
```
