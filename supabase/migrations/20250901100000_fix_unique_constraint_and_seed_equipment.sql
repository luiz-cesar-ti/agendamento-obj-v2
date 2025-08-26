/*
# [Fix Unique Constraint and Seed Equipment]
This migration fixes an issue where the `equipment` table was missing a unique constraint on the `name` column, which caused `ON CONFLICT` clauses to fail. It adds the unique constraint and then seeds the table with initial equipment data if it doesn't already exist.

## Query Description:
This operation first alters the `equipment` table to enforce that all equipment names are unique. Then, it attempts to insert a predefined list of equipment. If an equipment with the same name already exists, the insert for that specific item is skipped, preventing duplicates and preserving any existing data for that item. This operation is safe to run multiple times.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The constraint can be dropped, but the inserted data would need manual deletion)

## Structure Details:
- Table: `equipment`
- Action: Adds a `UNIQUE` constraint on the `name` column.
- Action: Inserts data into the `equipment` table.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Requires database owner or sufficient privileges to alter tables.

## Performance Impact:
- Indexes: Adds a new unique index on the `name` column, which may slightly slow down inserts/updates but will speed up lookups based on name.
- Triggers: None
- Estimated Impact: Negligible for typical application workloads.
*/

-- Add a unique constraint to the 'name' column to prevent duplicate equipment names.
-- This ensures data integrity and is required for the ON CONFLICT clause to work.
ALTER TABLE public.equipment
ADD CONSTRAINT equipment_name_unique UNIQUE (name);

-- Seed the equipment table with initial data.
-- ON CONFLICT(name) DO NOTHING ensures that if an equipment with the same name
-- already exists, this script will not create a duplicate or overwrite existing data.
INSERT INTO public.equipment (name, total_quantity, category)
VALUES
    ('Notebook', 20, 'Computadores'),
    ('Tablet', 15, 'Dispositivos Móveis'),
    ('Microfone', 10, 'Áudio'),
    ('Caixa de som', 10, 'Áudio'),
    ('Projetor', 5, 'Apresentação')
ON CONFLICT (name) DO NOTHING;
