# Dr. Bhushan’s CRM — mobile

Cross-platform (iOS + Android) app for doctors, nurses and reception, built on the same backend as the web dashboard (`dr-bhushan-crm-dashboard/backend`).

**Stack:** Expo SDK 57 · Expo Router · TanStack Query · socket.io-client · expo-secure-store · expo-image-picker · lucide-react-native

## What’s in the first release

| Screen | What it does | API |
| --- | --- | --- |
| Sign in | Email/password, plus the web’s one-click demo roles (when the server has `DEMO_LOGINS=true`) | `POST /auth/login`, `POST /auth/demo`, `GET /auth/me` |
| Today | Today’s appointments in clinic time, status chips, one-tap check-in / undo. Doctors can switch between *My patients* and *Whole clinic*. Live via websocket | `GET /appointments?date=`, `POST/DELETE /appointments/:id/check-in` |
| Patients | Search by name, phone or ID | `GET /patients?search=` |
| Patient | Safety strip (same rules as the web), overview, hair grade, active prescriptions, call button | `GET /patients/:id`, `GET /patients/:id/history`, `GET /patients/:id/photos` |
| Add photo | Camera or library → angle + milestone → upload | `POST /patients/:id/photos` |
| Account | Profile, server status, sign out | `GET /health` |

Deliberately left on the web: settings, plans, packages, billing, inventory, reports, leads, and history editing.

## Run it

```sh
cp .env.example .env.local    # set EXPO_PUBLIC_API_URL (git-ignored)
npm install
npx expo start                # then scan the QR code with Expo Go, or press i / a
```

On a physical phone, `EXPO_PUBLIC_API_URL` must be your computer’s LAN address (e.g. `http://192.168.1.20:4000`), not `localhost`. Needs Node ≥ 20.19.4.

- **iPhone:** Expo Go only opens the project when Expo CLI and Expo Go are signed in to the same (free) Expo account — run `npx expo login`, and sign in inside Expo Go. Android doesn’t need this.
- **Browser preview:** press `w` (or open http://localhost:8081). The backend must allow that origin: add `http://localhost:8081` to `CORS_ORIGIN` in the backend `.env` and restart it. On web the session is kept in localStorage instead of the keychain, and confirmations use the browser’s dialogs — use it for previewing, not as the product.

```sh
npm run typecheck
npx expo-doctor
```

Builds and store submission go through EAS (`npx eas-cli@latest build`).

## Brand

Colours, fonts and shapes are ported from the web `frontend/src/styles.css` — see `src/theme.ts` (oklch converted to hex, light and dark). Components in `src/components/ui.tsx` each name the web class they mirror. When the web brand changes, update `theme.ts` to match.

## Layout

```
src/app/            routes (Expo Router)
  _layout.tsx       fonts, query client, auth guard
  sign-in.tsx
  (tabs)/           Today · Patients · Account
  patients/[id]/    profile, add photo (modal)
src/api/            typed query hooks per backend module
src/lib/            api client, auth, socket, clinic dates
src/components/     UI kit + safety strip
```
