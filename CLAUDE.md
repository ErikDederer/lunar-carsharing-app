# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Rules

1. Before writing any code, read the relevant files and produce a plan of the changes (files, models, endpoints, migrations, risks). Do not write code until the plan is confirmed.
2. Follow the repo's existing patterns: module structure, DTOs + `class-validator`, error handling, naming, test style. If a pattern is ambiguous, present two options with a recommendation — don't pick one silently.
3. Any schema change goes through a Prisma migration. No manual DB edits.
4. No secrets in code: env vars only, and keep `.env.example` up to date.
5. Don't break existing endpoints. Breaking changes only when explicit and versioned.
6. Every new module needs: unit tests for the business logic, plus e2e tests for the happy path and key error cases.
7. For external APIs (Stripe, etc.), check the current official documentation — don't rely on memory. If the API version used in the repo differs from the docs, call that out.
8. Money is always integer cents (`Int`) or `Decimal`. `Float` is forbidden.

## Git Flow

### Branches

| Branch | Role |
|---|---|
| `main` | Production. Deploys to prod automatically. |
| `dev` | Pre-production/staging. All PRs land here first; this is where we test. |
| `feature/[nameUser]/[CAR-[Linear task number]-description]` | Tasks (new features), prefixed with `feature`. If there's no task number, skip it. |
| `fix/[nameUser]/[CAR-[Linear task number]-description]` | Bugs (fixes), prefixed with `fix`. If there's no task number, skip it. |

**Important:** don't push directly to `main` (once the initial setup is done and configured, and especially once team work starts). Ideally `main` is protected so only PRs can merge into it, no direct pushes. We're not enforcing this strictly via settings yet, but follow the rule manually.

### Developer flow

**1. Start of work — sync `dev`**

```bash
git checkout dev
git pull
```

**2. Create a branch from `dev`** (while on `dev`)

```bash
git checkout -b feature/[nameUser]/[CAR-[task number]-description]
```

**3. Work, commit**

```bash
git add .
git commit -m "feat: added booking form"
git push --set-upstream origin feature/[nameUser]/[CAR-[task number]-description]
```

**4. For long-running tasks — pull in `dev`**

While you were working on your branch, others may have merged their PRs into `dev`. Before opening your PR, pull those changes into your feature branch:

```bash
git checkout dev
git pull
git checkout feature/[nameUser]/[CAR-[task number]-description]
git merge dev
git push
```

If multiple developers edited the same file in parallel, conflicts may appear. Your IDE will highlight the conflicting spots — resolve them manually.

**5. Done → open a PR into `dev`**

Right before creating the PR, update the branch one more time:

```bash
git checkout dev
git pull
git checkout feature/[nameUser]/[CAR-[task number]-description]
git merge dev
git push
```

Then:
- Create the PR on GitHub (manually, not from the terminal): `feature/... → dev`
- Assign a reviewer (optional if you're reviewing your own work; on larger projects it's set up so a PR can't merge without approval)
- Wait for approval → merge

### Release to production

Once `dev` is stable and tested:

```bash
git checkout main
git pull
git merge dev
git push
```

The PR into `main` is picked up automatically and triggers a deploy to prod.

### Hotfix (urgent production fix)

```bash
git checkout main
git pull
git checkout -b fix/[nameUser]/[CAR-[task number]-description]

# ... fix it ...

git push --set-upstream origin fix/[nameUser]/[CAR-[task number]-description]
```

Open **two** PRs so the fix reaches prod and isn't lost from `dev`:

| PR | Purpose |
|---|---|
| `fix/... → main` | Ship urgently to prod |
| `fix/... → dev` | So the fix isn't lost |

### Diagram

```
feature/... ──PR──→ dev ──merge──→ main (prod)
fix/...     ──PR──→ main + dev
```

### Commit naming (optional, but encouraged)

| Prefix | When |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Refactor without functional changes |
| `chore:` | Chores (dependencies, configs) |

Examples:

```
feat: added car card
fix: fixed booking price calculation
docs: updated API endpoints
```
