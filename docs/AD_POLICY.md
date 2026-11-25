# Advertising policy draft

The free-tier placement policy is intentionally conservative:

- Small placement: eligible after every third answered exercise, never over the answer controls. The current app renders a clearly marked placeholder slot; live AdMob inventory is not connected.
- Interstitial: at most one impression per 20-minute cooldown and only at a safe transition (session end / exit), never while a learner is choosing or submitting an answer.
- The app cannot enforce a creative's exact 20-second duration. AdMob creative length and close affordances are controlled by the ad network. The app can control frequency and placement, not the exact runtime of every creative.
- Pro: all ad placements must be disabled after server-verified entitlement.
- Block sensitive categories in AdMob, review Ad Review Center and add advertiser URL blocks. Category classification is best-effort, not an absolute guarantee.

Initial blocklist intent: adult/sexual content, politics, alcohol, tobacco/smoking, gambling. Confirm supported categories and advertiser controls in the AdMob console for each app and region before release.
