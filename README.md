# logi-X-

Minimal Expo-style React Native scaffold for a two-role corridor transit tracker.

## What is implemented

- Role-isolated customer and driver UIs (`CustomerScreen`, `DriverScreen`)
- Fixed corridor polyline + proximity checkpoint engine
- 3-second customer location stream with route-scoped driver subscription
- Immediate boarded/missed kill-switch cleanup for active tracking

## Run tests

```bash
npm test
```
