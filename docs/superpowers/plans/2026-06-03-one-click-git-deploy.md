# One Click Git Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing macOS one-click GitHub sync command so it commits, pushes, builds, deploys to the demo server, restarts the app, and verifies the public URL.

**Architecture:** Keep deployment logic in the existing clickable `.command` script for product-manager-friendly operation. Store server password in a local ignored file (`.deploy.local`) so the committed script remains safe while still allowing one-click execution on this machine.

**Tech Stack:** Bash, Git, npm/Vite, rsync, expect, ssh, curl.

---

### Task 1: Add local deployment config pattern

**Files:**
- Create: `.deploy.local`
- Modify: `.env.example`

- [ ] Create `.deploy.local` with server settings and password for this machine only.
- [ ] Add non-secret deployment config comments to `.env.example` so future maintainers know the local file shape.

### Task 2: Upgrade one-click script

**Files:**
- Modify: `一键同步代码到Github.command`

- [ ] Replace the script with a guarded Bash workflow: load `.deploy.local`, build, commit if changes exist, push, rsync `dist/`, upload `server.mjs`, restart remote Node service on port 9001, verify public `HTTP 200`, and append local deployment log.
- [ ] Keep all user-facing messages in Chinese.
- [ ] Do not print the server password.

### Task 3: Verify without publishing unintended changes

**Files:**
- Test command only.

- [ ] Run `bash -n 一键同步代码到Github.command` to verify shell syntax.
- [ ] Run a dry local dependency check by confirming required commands exist: `git`, `npm`, `rsync`, `expect`, `ssh`, `curl`.
- [ ] Do not run the full script during implementation because it would commit and push the current dirty worktree.
