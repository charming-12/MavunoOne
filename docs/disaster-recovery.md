# MavunoOne Disaster Recovery Runbook

## Current protection status

MavunoOne source code is versioned in GitHub and deployed from the `master` branch. Production business data lives in Neon PostgreSQL. The application also has a sample-data snapshot mechanism used only for development/testing; this is not a production disaster-recovery backup.

In production, sample-data reset and sample-data restore are disabled unless the application is running outside production and `MAVUNO_ALLOW_SAMPLE_RESET=true` is explicitly set. This prevents an Admin from accidentally deleting live sales, stock, farmer, expense or payment data.

## What must be protected

The production recovery set must include the Neon database, migration files, Render environment variables, payment configuration, CCTV/GPS integration secrets, uploaded product assets and the exact Git commit deployed in Render. A source-code checkout alone is not a complete backup because it does not contain live database rows or production secrets.

## Primary recovery strategy

Use Neon-managed database backups and point-in-time recovery according to the retention and restore options available on the active Neon plan. Keep the production `DATABASE_URL`, session secret, bootstrap secret and payment/hardware credentials in Render environment variables or an approved encrypted secret manager. Do not commit any secret into GitHub.

For an operational incident, first stop destructive operations and record the incident time. Identify the last known-good database point, preserve the current Render deployment/commit, restore or branch the Neon database using the approved Neon recovery flow, verify migrations and data counts, then redeploy the known-good Git commit on Render if code rollback is also required.

## Testing sample-data reset

Sample reset is allowed only in a non-production environment with:

```text
NODE_ENV != production
MAVUNO_ALLOW_SAMPLE_RESET=true
```

Before enabling it, use a separate database. Never enable it against the live Neon production database. The reset creates a sample snapshot in `data_backups`, removes non-protected users and sample tables, and preserves Admin, Boss and Owner accounts.

## Recovery verification checklist

After a recovery, verify login, products, stock-in and stock-out quantities, sales and sale items, farmer balances, expenses, maintenance costs, employee roles, payment instructions, CCTV/GPS configuration status, audit logs and the public Shop checkout. Confirm that the application is not still connected to a staging database before reopening operations.

## Known gap

The application does not currently expose a production backup download/schedule endpoint, and the local `pg_dump` helper writes to the Render filesystem, which should not be treated as durable backup storage. Production recovery therefore depends on Neon-managed backups/PITR plus secure Render/GitHub configuration preservation until an external durable backup destination and scheduled export job are implemented.
