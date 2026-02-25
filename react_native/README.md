# AssetHub Mobile (React Native)

React Native app for AssetHub, built with Expo.

## Setup

```bash
npm install
```

## API

- **Web / iOS simulator**: `http://localhost:3001` (default)
- **Android emulator**: `http://10.0.2.2:3001` (auto-detected)
- **Physical device**: set `EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:3001`

## Run

**Native builds (no Expo Go):**

```bash
npm run prebuild    # generate ios/ and android/ (run once)
npm run android     # build & run on Android
npm run ios         # build & run on iOS (macOS only)
```

**Metro bundler (keep running for dev):**

```bash
npm start
```

For web: `npm run web`.
