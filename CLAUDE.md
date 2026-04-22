# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UBTApp is a React Native mobile app built with Expo (SDK 54), targeting Android, iOS, and web. It uses React 19 with the new architecture enabled (`newArchEnabled: true`).

## Commands

```bash
# Start development server (Expo Go / browser)
npm start

# Start on specific platform
npm run android
npm run ios
npm run web
```

No test runner or linter is currently configured.

## Architecture

- **Entry point:** `index.ts` — registers root component via `registerRootComponent`
- **Root component:** `App.tsx` — currently a placeholder screen
- **Config:** `app.json` — Expo app config (name, icons, splash, platform settings)
- **Orientation:** portrait-only
- **Styling:** React Native `StyleSheet` (no third-party styling library)

The app is at an initial scaffold stage with no navigation, state management, or screen structure yet.
