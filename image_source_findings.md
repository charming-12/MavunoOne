# Image source findings

The user-provided Google Images URL was opened, but Google returned a CAPTCHA, so it is not a reliable direct source for automated fetching.

The extracted result page showed Tanzanian sunflower-oil listings advertising 1L, 3L, 5L, and 20L sizes, but many results were social-media or business listings and may contain third-party branding. Those should not be copied into MavunoOne without explicit permission.

Wikimedia Commons category `Category:Vegetable_oils` was opened. It lists `Bottle 1 liter Sunflower refined oil.jpg` (1200x1600) and other oil files. Wikimedia Commons provides source/license metadata per file page, so a specific file page must be checked before downloading and using it. The category also contains branded files such as Wesson and Lesieur, which should be avoided for MavunoOne storefront imagery.

Search image thumbnails also showed oil jerrycans with visible labels/brands. These are not safe choices for MavunoOne unless the brand belongs to the user and permission is confirmed.

Current local fallback assets remain safer for production: unbranded sunflower flower/seeds, sunflower oil bottle, maize grain, maize flour, animal feeds, and by-products in `public/products/`.
