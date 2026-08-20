# Ipuli Milling unit and pricing model

The platform now treats a product's configured selling unit as the unit the customer buys. `sellPrice` is the price for one configured selling unit, while `packageSizeKg` converts that selling unit into the base stock quantity used for inventory control.

| Product example | Selling unit | Price means | Stock conversion |
|---|---|---|---|
| Unga wa Mahindi | kg | Price per kg | 1 kg per unit |
| Unga wa Mahindi packaged in a sack | gunia | Price per gunia | `packageSizeKg` kg per gunia |
| Animal feed | kg or debe | Price per kg or debe | Configured package conversion |
| Sunflower oil | litre or ndoo | Price per litre or ndoo | Requires a volume conversion for litre/packaging; the current schema's `packageSizeKg` should not be treated as a physical litre-to-kg conversion without a verified product conversion |
| By-product | kg, debe or other configured unit | Price per selected unit | Uses the product's configured conversion |

For a sale of five units, the system calculates `quantity × sellPrice`. It separately calculates base stock movement as `quantity × packageSizeKg`. For example, one gunia configured as 100 kg at TZS 180,000 means five gunia are TZS 900,000 and consume 500 kg of base stock. A customer buying five kg is a different sale from a customer buying five debe; each must be configured as a distinct selling unit and price when the business sells them differently.

The POS, public Shop, cart, checkout, stock movement and invoice history now display the configured selling unit. Public Shop quantity is capped using the real available package count instead of allowing an unlimited cart. The server recalculates product price and line totals from the catalog rather than trusting a browser-submitted price.

## Tax configuration

VAT is not automatically applied to every order. The system uses `VAT_ENABLED`, `VAT_RATE` and `VAT_LABEL` configuration values. When VAT is disabled, invoices show a zero tax amount and the subtotal equals the total. When enabled, the configured rate is stored on each sale as `taxRate` and `taxAmount`, so the invoice is transparent.

Before enabling VAT in production, the business should confirm its VAT registration status, taxable supplies, EFD/fiscal receipt obligations and the correct treatment with TRA or a qualified Tanzanian tax adviser. An ordinary web invoice must not be described as a TRA fiscal receipt unless an approved fiscalisation integration has been configured.
