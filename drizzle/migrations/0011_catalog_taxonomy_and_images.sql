-- 0011_catalog_taxonomy_and_images.sql
-- Correct catalog taxonomy and product-specific imagery without changing prices or stock quantities.

UPDATE "products"
SET "name" = 'Mahindi',
    "productType" = 'raw_material',
    "imageUrl" = '/products/maize-cobs-commons.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Mahindi' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") IN ('mahindi', 'mahindi ya kawaida');

UPDATE "products"
SET "productType" = 'finished_goods',
    "imageUrl" = '/products/maize-flour.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Mahindi' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%unga wa mahindi%';

UPDATE "products"
SET "name" = 'Alizeti',
    "productType" = 'raw_material',
    "imageUrl" = '/products/sunflower-flower-commons.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Alizeti' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") IN ('alizeti', 'alizeti green');

UPDATE "products"
SET "name" = 'Mafuta ya Alizeti',
    "productType" = 'finished_goods',
    "unit" = 'litre',
    "imageUrl" = '/products/sunflower-oil-sizes.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Mafuta Alizeti' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") IN ('mafuta alizeti', 'mafuta ya alizeti');

UPDATE "products"
SET "productType" = 'animal_feed',
    "imageUrl" = '/products/uduv-fishmeal-neutral.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Uduvi' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%uduv%' OR LOWER("name") LIKE '%uduvi%' OR LOWER("name") LIKE '%fishmeal%' OR LOWER("name") LIKE '%fish meal%';

UPDATE "products"
SET "name" = 'Chokaa ya Animal Feed',
    "productType" = 'animal_feed',
    "imageUrl" = '/products/chokaa-feed-grade.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Chokaa' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%chokaa%';

UPDATE "products"
SET "productType" = 'animal_feed',
    "imageUrl" = '/products/soya-cake-neutral.jpeg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Animal Feeds' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%soya%' OR LOWER("name") LIKE '%soy%';

UPDATE "products"
SET "productType" = 'animal_feed',
    "imageUrl" = '/products/sunflower-meal-commons.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Animal Feeds' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%mashudu%' OR LOWER("name") LIKE '%sunflower meal%' OR LOWER("name") LIKE '%sunflower cake%';

UPDATE "products"
SET "productType" = 'byproduct',
    "imageUrl" = '/products/maize-byproduct-livestock-feed.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Mahindi' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") LIKE '%pumba%' OR LOWER("name") LIKE '%maize bran%' OR LOWER("name") LIKE '%corn bran%';

UPDATE "products"
SET "name" = 'Mixed Animal Feed',
    "productType" = 'animal_feed',
    "imageUrl" = '/products/mixed-animal-feed-commons.jpg',
    "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Animal Feeds' LIMIT 1),
    "updatedAt" = NOW()
WHERE LOWER("name") IN ('chakula cha wanyama', 'mixed animal feed', 'mchanganyiko wa chakula cha mifugo');
