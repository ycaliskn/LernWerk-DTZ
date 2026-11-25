# Security and repository controls

## Public repository

The requested repository is intended to be public. Public visibility means anyone can read and fork source code. It does not mean anyone can push to the owner's repository. Write access is controlled by GitHub collaborators/teams and repository permissions.

After repository creation, configure:

- Keep `ycaliskn` as the only user/team with write or administrator permission. Public visibility lets others view and fork the code; it does not grant push permission.
- Add a branch ruleset for `main`: block force-push and branch deletion, require the CI status checks, and restrict updates to the owner account. Allow an owner/admin recovery path so the owner cannot lock themselves out.
- Keep `CODEOWNERS` assigned to `@ycaliskn`; use it to identify the project owner on external pull requests. Do not require a self-approval on the owner's own pull requests.
- Enable secret scanning and push protection if available on the account/repository.
- Enable Dependabot security updates and dependency review. A monthly Dependabot configuration is included.
- Use GitHub Actions secrets for signing keys, Apple credentials, Google Play service account and AdMob identifiers. Never commit them.
- Require 2FA/passkey on the GitHub account. Never share the account password or personal access token in chat.

## Mobile data

- Current demo uses IndexedDB without encryption. Do not put health, identity or payment information in it.
- Before production, use encrypted SQLite / platform secure storage. Keep the encryption key in iOS Keychain or Android Keystore via an audited native plugin.
- Use TLS, short-lived access tokens, refresh-token rotation, least-privilege database roles and server-side authorization.
- Guest data is local only until the user explicitly links an account. Explain that uninstalling the app or losing the device before backup can remove guest progress.
- Provide account export and account deletion workflows before launch.

## Pro and purchases

- Never use a client boolean as the sole proof of Pro status.
- Verify Apple / Google transactions server-side, handle renewals, refunds, revocations and grace periods, and cache only the server-verified entitlement.

## Advertising

- Do not show interstitial ads during questions, answer selection, navigation or critical tasks. Only request an interstitial at a natural transition after the cooldown has elapsed.
- AdMob cannot guarantee that a creative lasts exactly 20 seconds. The creative/provider controls its duration and close behaviour.
- Sensitive-category blocking is best-effort; review Ad Review Center and block unwanted advertiser URLs as needed.
