/*
# [Update Equipment Quantities]
This migration updates the total quantity for existing equipment items: Notebook, Tablet, Microfone, and Caixa de Som.

## Query Description:
This operation modifies the `total_quantity` column for specific rows in the `equipment` table. It is a safe data update and does not affect table structures or other data. No data loss is expected.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table Affected: `equipment`
- Columns Affected: `total_quantity`
- Rows Affected: 4 (Notebook, Tablet, Microfone, Caixa de Som)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: No changes
- Triggers: No changes
- Estimated Impact: Negligible performance impact, as it's a simple update on a few rows.
*/

-- Update quantity for Notebook
UPDATE public.equipment
SET total_quantity = 19
WHERE name = 'Notebook';

-- Update quantity for Tablet
UPDATE public.equipment
SET total_quantity = 24
WHERE name = 'Tablet';

-- Update quantity for Microfone
UPDATE public.equipment
SET total_quantity = 2
WHERE name = 'Microfone';

-- Update quantity for Caixa de Som
UPDATE public.equipment
SET total_quantity = 1
WHERE name = 'Caixa de Som';
