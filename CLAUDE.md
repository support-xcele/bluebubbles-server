# bluebubbles-server (xcelerate fork → "xMessage")

This is **Stack 1** of a 2-stack iMessage architecture for the xcelerate CRM.
This repo is a fork of [BlueBubbles](https://bluebubbles.app/) rebranded as
**xMessage**, running as an Electron + TypeScript Mac app that bridges Apple's
Messages.app to an HTTP API. Bundle ID and userData paths still reference
`BlueBubbles` / `bluebubbles-server` so existing config carries over — only
the display name changed.

## What's custom in this fork (vs upstream)

### Auto-share + auto-Contact pipeline
- **`server/api/lib/ContactsLib.ts`** (custom in `wip/auto-backup-2026-05-05`)
  — `addNativeContactIfMissing` writes contacts to native macOS
  Contacts.app via osascript, idempotent on phone/email match. Used so
  every iMessage sender becomes a CRM lead with iCloud sync.
- **`server/api/http/api/v1/routers/contactRouter.ts:createNative`** —
  POST `/api/v1/contact/native` accepts `{firstName,lastName?,phoneNumbers?[],emails?[]}` (or array). Idempotent; returns `{created, existing, errors}`.
- **`server/index.ts:handleNewMessage`** — calls `addNativeContactIfMissing`
  for every non-self incoming message.

### iCloud branding (zero-click)
- **`server/api/interfaces/iCloudInterface.ts:setShareNameProfile`** —
  env-gated by `BB_HELPER_SUPPORTS_SET_NICKNAME=true`. Sends a
  `set-nickname-info` IPC to the patched helper dylib, which uses the raw
  `setPersonalNickname:` ivar setter to bypass Apple's first-time-setup
  gate. Verified via GET `/api/v1/icloud/contact` → `{data:{name,avatar}}`.

### macOS 26 IMNickname API patches
- The helper dylib has been updated for macOS 26's renamed IMNickname
  selectors. See [bluebubbles-helper](https://github.com/support-xcele/bluebubbles-helper).

## Sister repos

- [support-xcele/bluebubbles-helper](https://github.com/support-xcele/bluebubbles-helper) — the dylib injected into Messages.app. Built separately and dropped into `packages/server/appResources/private-api/macos11/` before this server is built.
- [support-xcele/imessage-bridge](https://github.com/support-xcele/imessage-bridge) — Stack 2: a Linux/Railway-hosted Rust service wrapping rustpush, for the cohort of disposable Apple IDs. Different architecture, doesn't share code with this repo.
- [support-xcele/xcelerate-telegram](https://github.com/support-xcele/xcelerate-telegram) — the CRM. Talks to this server via `lib/server/imessage-bridge.js` over `BLUEBUBBLES_MAC<n>_URL` + `BLUEBUBBLES_MAC<n>_PASSWORD` env vars.

## Tech stack

- **Electron** (Mac app shell) + **Node.js** (server runtime)
- **TypeScript** throughout (`packages/server/src/`)
- **Koa** for the HTTP API at `127.0.0.1:1234` (cloudflared-tunneled to `imessage-mac1.xcelegram.com`)
- **TypeORM** + SQLite for the bundled databases (BlueBubbles + Messages.app's chat.db are read-only)
- **node-mac-contacts** for contact reads (iCloud Contacts subset)
- **AppleScript** + **osascript** for actions Messages.app's private API can't do directly (e.g. native contact creation)

## Build pipeline

```bash
git clone https://github.com/support-xcele/bluebubbles-server
git clone https://github.com/support-xcele/bluebubbles-helper
cd bluebubbles-server
npm install
# Build the helper dylib first (Xcode required; see bluebubbles-helper CLAUDE.md)
# Drop the result into packages/server/appResources/private-api/macos11/
cd packages/ui && npm run build && cd ../..
rm -rf packages/server/dist && cp -R packages/ui/build packages/server/dist
cd packages/server && npm run build && \
    npx electron-builder build --mac --arm64 --publish never \
        --config ./scripts/electron-builder-config.js
```

Output: `packages/server/dist/mac-arm64/xMessage.app`. Install to `/Applications/`.

## Deployment / production state

- **Running app**: `/Applications/xMessage.app` on the xcelerate Mac mini.
- **HTTP API port**: 1234 (private to localhost; tunneled out via cloudflared).
- **LaunchAgent**: `~/Library/LaunchAgents/com.xcelerate.xmessage.plist`
  auto-restarts on crash + boot.
- **CRM connection**: xcelerate-telegram's `BLUEBUBBLES_MAC1_URL` and
  `BLUEBUBBLES_MAC1_PASSWORD` env vars point at the cloudflared tunnel.
- **Active VIP persona**: `xcelerateofm@icloud.com`, branded as "Elli Lacy"
  with selfie photo.

## Health check (from anywhere)

```bash
PW=$(sqlite3 ~/Library/Application\ Support/bluebubbles-server/config.db \
     "SELECT value FROM config WHERE name='password'")
curl -sS "http://127.0.0.1:1234/api/v1/icloud/contact?password=$PW" | jq .
# expected: data.name = "Elli Lacy", data.avatar starts with /9j/ (base64 JPEG)
```

## Build gotchas

1. **Helper dylib not auto-copied** — the build script bundles whatever's
   in `packages/server/appResources/private-api/macos11/`. It does NOT
   rebuild the dylib. Always copy a fresh build of the helper before
   running electron-builder.
2. **Pods need arm64e ARCHS** — see bluebubbles-helper CLAUDE.md.
3. **`--deep` resign invalidates Gatekeeper** — first launch after
   `--deep` resign requires manual right-click → Open. Avoid on the
   headless Mac mini.

## Cohort warnings

- **macOS upgrades on the Mac mini are fragile.** Apple changes private
  API selectors between releases (the helper dylib's macOS 26 patches
  exist precisely because of one such change). Test the helper on a
  staging Apple ID before deploying to the VIP account.
- **Don't sign out of iCloud on the Mac mini.** Doing so wipes the
  share-name + photo and re-triggers Apple's first-time-setup gate. The
  zero-click recovery path requires a known-good helper dylib already
  injected; if the dylib is broken, manual UI steps are needed.

## When working on this repo

- All custom logic lives in `packages/server/src/server/api/` — start there.
- Logs appear in `~/Library/Logs/BlueBubbles-Server/` (Electron's log dir).
- Database at `~/Library/Application Support/bluebubbles-server/config.db`
  (SQLite, read-only via the API; for direct edits, kill the app first).

## Last commit context

`6a422577` — "chore(appResources): bump shipped helper dylib to block-handle build" (2026-05-03).

The branch `wip/auto-backup-2026-05-05` contains 3 uncommitted production
files (179 lines) that were dirty when the local workspace was archived:
- `contactRouter.ts:+37` — POST `/api/v1/contact/native` handler
- `ContactsLib.ts:+117` — AppleScript-based `addNativeContact*` methods
- `index.ts:+25` — likely wires `createNative` into the new-message handler

Plus a `.dylib.backup-stale` rollback artifact. **Review the wip branch
before merging — these may be production-ready, but the original commit
they belong with isn't fully clear.**
