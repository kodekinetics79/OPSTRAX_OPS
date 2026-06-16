PRAGMA foreign_keys = ON;

ALTER TABLE tenants ADD COLUMN tier TEXT NOT NULL DEFAULT 'full';

UPDATE tenants
SET tier = CASE
  WHEN id = 'tenant_evostel' THEN 'restricted'
  ELSE 'full'
END;
