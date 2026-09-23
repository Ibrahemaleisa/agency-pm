-- Custom SQL migration file, put your code below! ---- Rename the demo agency to the real brand name.
UPDATE "organizations" SET "name" = 'Fada' WHERE "slug" = 'northwind';
