# Future Radio: Trial Deployment & Resumption Context Prompt

*Copy and paste the entire block below into your next Gemini or AI assistant session to instantly load the full project context and begin launching the product for public trials!*

---

```markdown
# Context Prompt: Resume Future Radio Web App Trial Deployment

You are an expert full-stack developer assisting in taking "Future Radio" (a premium localized AI RJ & music streaming web application) from its current fully-compiled codebase to a live public trial/testing phase.

---

## 1. Project Overview & Aesthetics
* **Name**: Future Radio ("AB FUTURE SUNO")
* **Goal**: A high-fidelity, premium mobile-first web app providing localized AI RJ Priya voiceovers interspersed with continuous music streams from YouTube, and a real-time localized news feed ("Whatsup News").
* **Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand Stores, XState v5 Finite State Machine, and Supabase client-side database integrations.
* **Core Brand Colors**:
  * Dark Background: `#0a0a0f`
  * Surface Background: `#111118` / `#1c1c28`
  * Border Accent: `#2a2a35`
  * Brand Teal (News Accent): `#1d9e75` (RGB: `29, 158, 117`)
  * Brand Purple (Radio Accent): HSL H246 tailored gradient / `#7f77dd`

---

## 2. Key Code Architecture & File Map
The codebase compiles 100% successfully on production builds. Key components include:

1. **Audio Engine FSM (`components/audio/audioMachine.ts`)**:
   * XState v5 state machine driving states: `idle`, `buffering`, `playing_song`, `ducking`, `playing_jocktalk`, `unducking`, `ad_paused`.
2. **Audio Orchestrator (`components/audio/AudioOrchestrator.tsx`)**:
   * Binds the FSM to a persistent YouTube player iframe and HTML5 audio nodes for RJ voiceovers and jingles.
   * **Lock-Screen Persistence**: Binds browser playback to `navigator.mediaSession` metadata and hardware controls (`play`, `pause`, `nexttrack`).
   * **Background Keep-Alive**: Plays a looping base64 silent WAV audio track (`data:audio/wav;base64,...`) alongside the streams to **force the mobile browser's audio context to remain active and prevent mobile OS sleeping when the screen is locked.**
   * **Compliance Sizing**: Sizes the YouTube iframe player down to `1px` x `1px` absolute-positioned at the bottom during news browsing, expanding back to high-res on the Radio Player console page.
3. **Supabase Database Query Modules**:
   * [lib/supabase/news.ts](file:///c:/ScalerXLab%20Assests/Future%20Radio/lib/supabase/news.ts): Handles dynamic news queries, user liked articles, and bookmarks.
   * [lib/supabase/playlist.ts](file:///c:/ScalerXLab%20Assests/Future%20Radio/lib/supabase/playlist.ts): Retrieves playlist blocks per city context and manages song likes.
   * **Fail-safe Fallback**: Both libraries automatically fall back to seeded mock arrays if Supabase keys are disconnected, ensuring 100% offline uptime during development.
4. **Secure Profile Grid (`components/auth/AuthModal.tsx`)**:
   * Supports Google OAuth Profile synchronizations.
   * **YouTube Subscription recognition**: Simulates active profile checking to tag the user with `isYtPremium`. Premium accounts enjoy a 100% ad-free stream by bypassing the FSM `ad_paused` state transitions, while normal guests play scheduled ad jingles.
5. **Views & Pages**:
   * Entry Splash & City Bottom Sheet: [app/page.tsx](file:///c:/ScalerXLab%20Assests/Future%20Radio/app/page.tsx)
   * Radio Deck Player: [app/radio/page.tsx](file:///c:/ScalerXLab%20Assests/Future%20Radio/app/radio/page.tsx)
   * Whatsup News Feed: [app/news/page.tsx](file:///c:/ScalerXLab%20Assests/Future%20Radio/app/news/page.tsx)
   * Article detail sheet (Intercepted route modal): [app/news/@modal/(.)article/[slug]/page.tsx](file:///c:/ScalerXLab%20Assests/Future%20Radio/app/news/@modal/%28.%29article/%5Bslug%5D/page.tsx)
   * Direct fallback article reader: [app/news/article/[slug]/page.tsx](file:///c:/ScalerXLab%20Assests/Future%20Radio/app/news/article/%5Bslug%5D/page.tsx)

---

## 3. Database Schema Grid
We have written a comprehensive setup script inside `supabase_schema.sql` at the root directory:
* **`articles`**: `id` (text, PK), `type` (text), `category` (text), `headline` (text), `snippet` (text), `source` (text), `source_handle` (text), `time_ago` (text), `image_url` (text), `likes_count` (int), `comments_count` (int), `is_twitter_source` (bool).
* **`playlist_blocks`**: `block_id` (text, PK), `city_id` (text), `youtube_id` (text), `song_title` (text), `song_artist` (text), `song_duration_s` (int), `rj_audio_url` (text), `jingle_url` (text), `rj_transcript` (text), `news_headlines` (text[]), `mood` (text), `valid_from` (timestamptz), `valid_until` (timestamptz).
* **`user_likes`**: `id` (UUID, PK), `user_id` (UUID references auth.users), `item_type` (text CHECK song/news), `item_id` (text).
* **`user_bookmarks`**: `id` (UUID, PK), `user_id` (UUID references auth.users), `article_id` (text references articles).
* **RLS Policies**: Enable SELECT for public on `articles` and `playlist_blocks`, and auth-restricted policies on `user_likes` and `user_bookmarks`.

---

## 4. Current State
* Local `.env.local` file contains live Supabase anchors:
  * `NEXT_PUBLIC_SUPABASE_URL=https://ngcsyxbusazvauwmivij.supabase.co`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
* Next.js production compiler executes clean builds:
  ```powershell
  Route (app)                              Size     First Load JS
  ┌ ○ /                                    7.72 kB         135 kB
  ├ ○ /_not-found                          873 B          88.2 kB
  ├ ○ /news                                9.03 kB         210 kB
  ├ ƒ /news/(.)article/[slug]              5.87 kB         198 kB
  ├ ƒ /news/article/[slug]                 5.64 kB         167 kB
  └ ○ /radio                               4.8 kB          197 kB
  + First Load JS shared by all            87.3 kB
  ```

---

## 5. Trial Deployment Checklist & Next Steps
We need to make this product fully live for public trials. Please guide me through, and help me execute the following tasks:

### Task A: Supabase DB Live Sync Verification
1. Verify if we need to write a script (like a Node/TypeScript seed script) to run the `supabase_schema.sql` queries programmatically or confirm steps to load it into the Supabase dashboard SQL editor.
2. Confirm the exact structure of RPC functions or triggers in PostgreSQL to automatically increment and decrement article likes (e.g. `increment_article_likes` and `decrement_article_likes` which are mapped in the client API wrapper).

### Task B: Google OAuth Real Integration
1. Update `components/auth/AuthModal.tsx` to swap out simulated timers for authentic `@supabase/supabase-js` OAuth calls using Google provider redirection:
   ```typescript
   const { error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: window.location.origin }
   });
   ```
2. Explain the setup steps inside the **Google Cloud Console API Credentials** and **Supabase Authentication Providers** dashboard to add redirect URLs for the live URL.

### Task C: Real YouTube Subscription Checker Hook
1. Create a secure Supabase Edge Function or Next.js API Route that receives the user's Google OAuth access tokens to securely query the YouTube API (`https://www.googleapis.com/auth/youtube.readonly`) and verify if they have an active YouTube subscription, passing the validated boolean flag (`isYtPremium`) back to our store.

### Task D: Vercel Deployment & Live Trial Testing
1. Configure `vercel.json` or custom project telemetry headers to handle secure production redirects.
2. Guide me step-by-step through linking our GitHub repository to **Vercel** and loading the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for instant global hosting.
3. Help me test mobile background persistent audio keep-alive and lock-screen controls directly on physical iOS Safari / Android Chrome trial devices and confirm compliance layouts.

Let's begin! Let's address **Task A** first: verify how to deploy the database schema and write any missing SQL increments/decrements.
```
