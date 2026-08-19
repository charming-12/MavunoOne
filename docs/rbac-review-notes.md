# RBAC and dashboard review notes

## Current role model

The database role enum contains `boss`, `owner`, `manager`, `cashier`, `storekeeper`, `machine_operator`, `customer`, and `admin`. Finance Manager and Operations Manager both use the database role `manager`; the current distinction is `jobTitle: finance` for Finance Manager.

## Confirmed current behavior

The signed session now carries `jobTitle`, and the Office layout distinguishes Finance Manager from Operations Manager. Finance navigation is filtered to finance routes, while Operations Manager navigation excludes finance routes. Cashier is included in the Office shell and POS route.

The Cashier POS flow now creates a sale, sale items, stock-out movement, invoice number, cashier ID, and audit log. Cash payments are marked paid immediately. M-Pesa, Tigo Pesa, Airtel Money, and credit are marked pending because no real payment-provider callback is connected yet.

Sales History was previously mock data. It has now been changed to read the live sales ledger from the database and show invoice, customer, total, item count, date, method, and payment status.

## Review concerns requiring follow-up

The shared Office overview currently executes broad dashboard queries and renders shared operational cards for every Office role. Cashier, Storekeeper, and Machine Operator may see links or cards that redirect to pages outside their primary duties. Role-specific Overview content should be implemented rather than relying only on sidebar filtering.

The Boss dashboard is a separate executive surface and should not be reused by staff. Admin and Owner may use the Office shell but should have a broader administration-oriented Overview than operational staff.

Direct backend guards must be reviewed alongside navigation. `officeProcedure` is intentionally broad, so individual procedures must enforce role and manager subtype where sensitive actions are involved.

## Overview recommendation

Every authenticated staff role may have an Overview entry, but it should not be the same Overview. Boss needs executive KPIs; Admin needs system, staff, technical, and business controls; Finance Manager needs finance and reconciliation; Operations Manager needs stock, sales, production, and logistics; Cashier needs POS and shift/sales status; Storekeeper needs stock receiving, issuing, and reconciliation; Machine Operator needs assigned machine jobs and production status.
