# GitHub Workflow Guide

This guide shows you how to work with GitHub using the CLI for this and future projects.

## Prerequisites

### Install GitHub CLI (if not already installed)
```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

### Login to GitHub (one-time setup)
```bash
gh auth login
# Follow the prompts:
# - Choose GitHub.com
# - Choose HTTPS
# - Authenticate via browser
```

## Initial Project Setup (What We Just Did)

### 1. Create Local Git Repository
```bash
cd /path/to/your/project
git init
```

### 2. Add and Commit Files
```bash
git add -A
git commit -m "Initial commit: Project description"
```

### 3. Create GitHub Repository and Push (One Command!)
```bash
gh repo create YOUR-REPO-NAME \
  --public \
  --source=. \
  --description="Your project description" \
  --push
```

**Flags explained:**
- `--public` - Makes repository public (use `--private` for private)
- `--source=.` - Uses current directory as source
- `--description` - Adds repository description
- `--push` - Automatically pushes code after creating repo

### Alternative: Manual Method
```bash
# Create repo on GitHub (without pushing)
gh repo create YOUR-REPO-NAME --public --description="Description"

# Add remote manually
git remote add origin https://github.com/YOUR_USERNAME/YOUR-REPO-NAME.git

# Push code
git branch -M main
git push -u origin main
```

## Daily Workflow

### Making Changes
```bash
# 1. Make your changes to files

# 2. Check what changed
git status

# 3. Add changes
git add -A              # Add all files
# or
git add file1.txt      # Add specific files

# 4. Commit with message
git commit -m "Description of what you changed"

# 5. Push to GitHub
git push
```

### Quick Commit Shortcut
```bash
# Add, commit, and push in sequence
git add -A && git commit -m "Your message" && git push
```

## Useful GitHub CLI Commands

### View Your Repository in Browser
```bash
gh repo view --web
```

### List Your Repositories
```bash
gh repo list
```

### Clone a Repository
```bash
gh repo clone YOUR_USERNAME/REPO_NAME
```

### Create Pull Request
```bash
gh pr create --title "PR Title" --body "Description"
```

### Check Repository Status
```bash
gh repo view
```

### Create Issue
```bash
gh issue create --title "Issue title" --body "Description"
```

## Checking Your Setup

### Check if GitHub CLI is installed
```bash
gh --version
```

### Check authentication status
```bash
gh auth status
```

### Check git remotes
```bash
git remote -v
```

### Check current branch
```bash
git branch
```

## Common Scenarios

### Scenario 1: Start New Project from Scratch
```bash
# 1. Create project directory
mkdir my-new-project
cd my-new-project

# 2. Initialize git
git init

# 3. Create some files
echo "# My Project" > README.md

# 4. First commit
git add -A
git commit -m "Initial commit"

# 5. Create GitHub repo and push
gh repo create my-new-project --public --source=. --push
```

### Scenario 2: Push Existing Project to GitHub
```bash
# 1. Navigate to project
cd /path/to/existing/project

# 2. Initialize git (if not already)
git init

# 3. Add files
git add -A
git commit -m "Initial commit"

# 4. Create and push to GitHub
gh repo create project-name --public --source=. --push
```

### Scenario 3: Daily Updates
```bash
# After making changes:
git add -A
git commit -m "Add new feature X"
git push
```

### Scenario 4: Check What Changed Before Committing
```bash
git status              # See which files changed
git diff                # See exact changes
git add -A
git commit -m "Message"
git push
```

## Git Best Practices

### Commit Messages
```bash
# Good commit messages:
git commit -m "Add user authentication feature"
git commit -m "Fix bug in payment processing"
git commit -m "Update README with installation steps"
git commit -m "Refactor database connection logic"

# Bad commit messages:
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### Commit Frequency
- Commit when you complete a logical unit of work
- Commit before switching tasks
- Commit before trying something experimental
- Don't commit broken code to main branch

### What to Commit
```bash
# DO commit:
- Source code
- Configuration files
- Documentation
- Tests

# DON'T commit (add to .gitignore):
- node_modules/
- .env files with secrets
- Build artifacts (.next/, dist/)
- IDE-specific files
- OS files (.DS_Store)
```

## Troubleshooting

### "Already exists" error
```bash
# If repo name is taken, use a different name:
gh repo create my-project-v2 --public --source=. --push
```

### "Not a git repository" error
```bash
# Initialize git first:
git init
git add -A
git commit -m "Initial commit"
```

### Authentication errors
```bash
# Re-authenticate:
gh auth logout
gh auth login
```

### Check remote URL
```bash
# See where your code is being pushed:
git remote -v

# Change remote URL if needed:
git remote set-url origin https://github.com/USERNAME/REPO.git
```

## Your Current Project Status

**Repository:** https://github.com/alubin/system-design-study-platform
**Local Path:** `/Users/andylubin/Documents/Projects/AI Learn/system-design-course-app`

**Quick commands for this project:**
```bash
# Navigate to project
cd "/Users/andylubin/Documents/Projects/AI Learn/system-design-course-app"

# Check status
git status

# Make changes, then:
git add -A && git commit -m "Your message" && git push

# View on GitHub
gh repo view --web
```

## Next Step: Deploy to Vercel

Once your code is on GitHub, deploy to Vercel:

```bash
# Option 1: Use Vercel CLI
npm i -g vercel
vercel

# Option 2: Use Vercel website
# 1. Go to https://vercel.com
# 2. Click "New Project"
# 3. Import from GitHub
# 4. Select: system-design-study-platform
# 5. Click "Deploy" (zero config needed!)
```

---

## Quick Reference Cheat Sheet

```bash
# Setup (one-time)
gh auth login

# Create new repo from existing code
gh repo create NAME --public --source=. --push

# Daily workflow
git add -A
git commit -m "Description"
git push

# Shortcuts
git add -A && git commit -m "Message" && git push  # All at once
gh repo view --web                                  # Open in browser
git status                                          # Check changes
git log --oneline                                   # View history
```

Save this file for future reference!
