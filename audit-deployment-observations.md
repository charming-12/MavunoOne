# Deployment audit observations

- Checked 2026-08-24.
- Render production URL https://mavuno-one.onrender.com loads the branded Ipuli Milling and Animal Enterprise public home page.
- Vercel current audit-fixes Preview URL https://mavuno-rlrwhcqcy-josiah6.vercel.app loads the same public shell.
- The Vercel Preview visibly exposes staging payment configuration in the footer: Tigo Pesa — Simulated Test, TEST-MERCHANT-001, Ipuli Milling and Animal Enterprise (TEST).
- Render production footer does not expose the staging simulated payment configuration.
- This supports separation of public configuration between Render production and Vercel staging, but does not prove the databases are isolated without inspecting environment variables or querying each deployment while authenticated.
- Public page rendering is healthy in both environments during this check.
