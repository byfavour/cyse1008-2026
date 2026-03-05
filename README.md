# Black River Market (Emulator-Only Setup)

This course repo is run with **Firebase emulators only**.
Do not use the remote Firebase Console for this project work.

## 1) Prerequisites

- Node.js 20.x
- npm
- Java (required by Firestore emulator)
- Firebase CLI

Install Firebase CLI globally if needed:

```bash
npm install -g firebase-tools
```

## 2) Clone and install

```bash
git clone https://github.com/Loyalist-College-CCoulter-Courses/cyse1008-2026.git
cd cyse1008-2026
npm install
```

## 3) Use the correct Firebase project alias

This is the step that prevents the emulator data mismatch.

```bash
firebase login
firebase use default
```

`default` maps to project ID `black-river-market` in `.firebaserc`.

If you run emulators under a different alias (like `staging`) while your app uses `black-river-market`, you can create data that does not appear where you expect in Emulator UI.

## 4) Environment file for local dev

Make sure `.env.development` includes:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=black-river-market
NEXT_PUBLIC_FIREBASE_EMULATOR=true
```

## 5) Start the app + emulators

```bash
npm run dev
```

This runs:

- Next.js app at `http://localhost:3032`
- Firebase Emulator UI at `http://127.0.0.1:4000`

## 6) If vendor/product data is not showing in Firestore emulator

1. Stop dev servers.
2. Re-select the correct alias:

```bash
firebase use default
```

3. Start again:

```bash
npm run dev
```

You can also force project ID at startup:

```bash
firebase emulators:start --project black-river-market --import ./.firebase-data --export-on-exit --only auth,functions,firestore,storage,extensions
```

## 7) Common workflow

```bash
# pull latest code
git pull --rebase

# run locally
npm run dev
```

If `git push` is rejected on protected branches, push your feature branch and open a PR.
