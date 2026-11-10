<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 5K Ads (working name)

A visual front end for Claude Code on 5K client ads. Laney and Jairus each run it locally against their own 5k-os clone and see only their assigned clients. Each client has a left menu: brand guidelines, creative studio, live ads, swipe file, competitor center and approvals, plus shared libraries. The other paid ads tools join this app later.

## Rules

- **The app doesn't call the Claude API.** Work runs as Claude Code jobs inside 5k-os (`src/lib/claude-code.ts`), using 5k-os skills. Put the instructions for a job in a 5k-os skill under `5k/sops/`, not in this repo, so it works from the app and from a chat. Grant each job only the tools it needs with `allowedTools`.
- **5k-os is the source of truth for client context.** Read it through `src/lib/five-k-os.ts` only. Don't copy client data into this repo.
- **AI makes single design elements, never a full ad.** Code lays out every ad. Products stay as real cutouts and are never redrawn.
- **Every client page checks access.** Call `requireClientAccess(slug)` in each page, not only in the layout.
- **Session reads go through `getCurrentUser()`** (`'use cache: private'`). 5k-os reads use `'use cache'` with `cacheLife`.
- **Names live in config.** The app name is `APP_NAME` in `src/config/app.ts`. The left menu is `src/config/sections.ts`. Team members and client assignments are in `src/config/team.ts`.

## Map

| Path | What it is |
| --- | --- |
| `src/config/` | App name, team and client assignments, left-menu sections |
| `src/lib/auth.ts`, `session.ts` | Encrypted cookie session (iron-session), user and client-access checks |
| `src/lib/google.ts`, `src/app/api/auth/` | Google sign-in, limited to 5k.co accounts on the team list |
| `src/lib/five-k-os.ts` | Reads `clients/<slug>/` from a local 5k-os clone |
| `src/lib/claude-code.ts` | Runs `claude -p` jobs in 5k-os and tracks their progress (`/api/jobs/[id]`) |
| `src/lib/brand-kit-store.ts` | Reads the brand kit the `5k-brand-kit` skill writes to `clients/<slug>/design/brand-kit/` |
| `src/proxy.ts` | Sends signed-out visitors to `/login` (optimistic check only) |
| `src/app/(app)/c/[client]/` | Per-client workspace: layout with the left menu, brand page, other sections |

## Roadmap

Q4 2026 roadmap: https://claude.ai/artifact/XrWbZfuqNf7xXjQ1kSJtVN

- Milestone 1 (Nov 13): app shell, creative studio with edit requests, element and font libraries, brand kit builder, motion versions.
- Milestone 2 (Dec 11): swipe interface, past winners, competitor center, design training course, approval page.
