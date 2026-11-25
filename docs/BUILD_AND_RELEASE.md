# Build and release guide

## Local web/PWA preview

Requirements: Node.js 22+ (or Python 3).

```bash
npm start
# open http://localhost:4173
```

## Automated tests

```bash
npm test
npm run test:3x
npm run api:test
```

## Android APK for device testing

A GitHub Actions workflow is included at `.github/workflows/mobile-build.yml`. After the project is pushed to `main` (or the workflow is manually run), open GitHub → Actions → **LernWerk mobile test builds**. Download the `lernwerk-android-debug-apk` artifact.

This is a **debug APK** for sideload testing, not a Play Store release. On the Android device, permit installation from the browser/file manager used to open the APK. A Play Store release should use an app-signing key stored only in the protected GitHub Actions secrets or the Play Console; never commit the keystore.

## iOS

The included workflow builds `App.app` for the **iOS Simulator** on a macOS GitHub runner and uploads it as `lernwerk-ios-simulator-app`. A simulator build is not an IPA and cannot be installed on a physical iPhone.

A physical-device/TestFlight IPA requires a macOS/Xcode signing process with an Apple Developer Team, distribution certificate and provisioning profile. Those credentials must be stored in a secure local keychain or protected GitHub Actions secrets. Do not send them in chat or add them to the repository. After signing, upload the IPA/build to App Store Connect and distribute through TestFlight.

The present execution environment is Linux and does not have Xcode, Android SDK or Gradle installed; it cannot locally compile a genuine APK or iOS IPA. The workflow is prepared to compile on GitHub's platform-specific build runners after the repository is connected and the workflow is run.

## Native Capacitor shells

```bash
npm install --no-audit --no-fund
npx cap add android
npx cap add ios
npx cap sync
```

Android Studio:

```bash
npx cap open android
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

iOS on macOS:

```bash
npx cap open ios
# Select the Apple Developer Team, bundle ID and provisioning profile in Xcode.
# Archive > Distribute App > App Store Connect / TestFlight.
```

## Before store submission

- Add stable package-lock and pin/verify native plugin dependency versions.
- Replace demo app icon, display name, bundle identifier and privacy URLs.
- Add AdMob app/ad-unit identifiers and implement a maintained native AdMob plugin.
- Add consent management (GDPR/EEA), ATT handling where applicable, store privacy disclosures and child-directed audience review.
- Complete A2/B1 content, translations, source/licence audit and professional German review.
- Add authenticated account linking, server-side sync, PostgreSQL migrations and store receipt validation.
- Run physical-device tests on iPhone and Android, including offline, restore, upgrade, purchase, refund and data deletion scenarios.

### Signed iOS IPA using the prepared workflow

The `ios-device-ipa` job is optional and runs only when the workflow is manually dispatched with **Build a device-installable IPA** enabled. Before enabling it, add the following values under GitHub repository Settings → Secrets and variables → Actions → New repository secret:

- `APPLE_CERTIFICATE_BASE64`: base64-encoded Apple Distribution `.p12` certificate.
- `APPLE_CERTIFICATE_PASSWORD`: password used to export that `.p12` file.
- `APPLE_API_KEY_BASE64`: base64-encoded App Store Connect API `.p8` private key.
- `APPLE_API_KEY_ID`: App Store Connect API Key ID.
- `APPLE_API_ISSUER_ID`: App Store Connect Issuer ID.
- `APPLE_TEAM_ID`: Apple Developer Team ID.

The API key must have suitable App Store Connect access, the distribution certificate must be valid, and the bundle identifier (`de.lernwerk.dtz`) must be registered and available in the Apple Developer account. Keep all of these values in GitHub Actions Secrets only; never paste them into this conversation or commit them. The resulting IPA artifact is for device/TestFlight distribution, but the workflow has not yet been run and its first signing attempt must be validated in the user's Apple account.
