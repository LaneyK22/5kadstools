# 5K Ads

A visual way to work with Claude Code on 5K client ads. Each person runs it on their own machine against their own [5k-os](https://github.com/5K-co/5k-os) clone. Buttons and uploads in the app start Claude Code jobs inside 5k-os, which use the 5k-os skills, and the app shows the results. Shared work travels through 5k-os git.

## Needs

- A 5k-os clone next to this repo (`../5k-os`), or `FIVEK_OS_PATH` set to its location
- Claude Code (`claude`) installed and signed in. Jobs use that login, or `ANTHROPIC_API_KEY` when it's set.
- poppler (`brew install poppler`) and Python 3 with Pillow, for the brand kit skill

## Run it

1. Copy `.env.example` to `.env.local` and set `SESSION_PASSWORD` (`openssl rand -base64 32`).
2. From a normal terminal (not inside a Claude Code session):

   ```bash
   pnpm install
   pnpm dev
   ```

3. Open http://localhost:3000 and sign in with your name.

## Who sees which clients

Edit `src/config/team.ts`. Each person lists the 5k-os client folder names they should see.

## Google sign-in

Only needed if the app is ever shared from one server. Create an OAuth client (type "Web application") for the 5k.co workspace, add the redirect URI `<app URL>/api/auth/google/callback`, and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Only verified 5k.co accounts listed in `src/config/team.ts` can sign in.
