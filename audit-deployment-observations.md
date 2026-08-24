# Deployment audit observations

- Checked 2026-08-24.
- Render production URL https://mavuno-one.onrender.com loads the branded Ipuli Milling and Animal Enterprise public home page.
- Vercel current audit-fixes Preview URL https://mavuno-rlrwhcqcy-josiah6.vercel.app loads the same public shell.
- The Vercel Preview visibly exposes staging payment configuration in the footer: Tigo Pesa — Simulated Test, TEST-MERCHANT-001, Ipuli Milling and Animal Enterprise (TEST).
- Render production footer does not expose the staging simulated payment configuration.
- This supports separation of public configuration between Render production and Vercel staging, but does not prove the databases are isolated without inspecting environment variables or querying each deployment while authenticated.
- Public page rendering is healthy in both environments during this check.

## Latest audit-fixes deployment

- Commit `3558283` was pushed to branch `audit-fixes`.
- Vercel created Preview deployment `mavuno-kh7fjdzb5-josiah6.vercel.app`; at the time of checking it was still `Building` after 18 seconds.
- The previous Preview `mavuno-rlrwhcqcy-josiah6.vercel.app` was `Ready`.
- A direct curl to Render `/api/payment/instructions` returned disabled/empty payment instructions and `/api/config/ready` returned missing `LIPA_NUMBER`, `LIPA_API_KEY`, and CCTV variables. This confirms production real-payment configuration is not active through the app's current configuration endpoint.
- A direct curl to the Vercel Preview API was redirected to Vercel authentication protection, while the public home page rendered normally in the browser. This means unauthenticated CLI endpoint checks cannot prove the staging API/database behavior.

## Deployment status after push

The new commit `3558283` is visible in Vercel as Preview deployment `mavuno-kh7fjdzb5-josiah6.vercel.app`. It was still shown as `Building` at approximately 45 seconds after creation; the prior deployment remained `Ready`. Render production was not redeployed or modified by this push.

## Final Preview result

The new Vercel deployment for commit `3558283` completed successfully and is now `Ready`. Its URLs are https://mavuno-kh7fjdzb5-josiah6.vercel.app and the branch URL https://mavuno-one-git-audit-fixes-josiah6.vercel.app. Deployment duration was about one minute. Render production remains untouched.
