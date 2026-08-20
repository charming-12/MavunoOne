# Unit and VAT audit sources

## Official TRA VAT page
URL: https://www.tra.go.tz/page/value-added-tax-vat

Key findings retrieved during the audit:

- VAT is charged by persons registered for VAT only.
- The standard VAT rate for taxable supplies in Mainland Tanzania is 18%.
- The official page also lists a 16% rate for consideration of a supply by an individual not registered for VAT through a bank or approved electronic payment system; this is a tax-compliance rule that must not be hardcoded for every order without confirming the business's registration and transaction conditions.
- VAT registration is mandatory when taxable turnover reaches TZS 200 million in twelve months or TZS 100 million in six months, subject to the official exceptions and current rules.
- A VAT-registered business accounts for output VAT and input VAT through VAT returns.

## Official TRA EFD page
URL: https://www.tra.go.tz/page/know-about-e-fiscal-devices-efd

Key findings retrieved during the audit:

- EFDs are used for sales analysis and stock control and can issue fiscal receipts/invoices.
- The official page states that a receipt or invoice is required for each sale and that EFD/fiscalisation requirements apply according to the taxpayer's status and TRA rules.
- The application should not claim that an ordinary web invoice is a TRA fiscal receipt unless an approved EFD/ESD/VFD integration is actually configured.

## Application findings

- Products store one configured selling unit and a `packageSizeKg` conversion. `sellPrice` is treated as the price per configured selling unit.
- POS uses the configured unit and converts quantity to base stock using packageSizeKg.
- Public shop cart/order currently shows only one quantity dimension, strips unit/package data at submission, and the API hardcodes tax at 18%.
- Public shop and checkout do not currently cap cart quantity using actual sellable units in the UI.
- The product model does not yet have a separate volume conversion for litres/gallons; `packageSizeKg` is being used as a generic package conversion, which is not semantically correct for oil volume.
- Invoice/sale records preserve quantity, baseQuantity, unitPrice and total, but the UI needs clearer display of sale unit, package size and base quantity.

These findings support a configurable tax setting and clearer unit/package display, with final VAT/EFD activation confirmed by the business's tax professional/TRA position.
